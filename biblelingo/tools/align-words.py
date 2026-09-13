#!/usr/bin/env python3
"""Corta cada palavra das frases gravadas (alinhamento forçado com faster-whisper).

Por que: a síntese de uma palavra isolada sai com artefatos ("the" com 3,5 s e dois trechos
de voz). O Duolingo toca a palavra recortada da própria frase, na mesma voz. Este script faz
isso: para cada frase do manifesto (chave com espaço) e cada personagem que a gravou, alinha
o áudio ao texto e grava audio/words/<hash>.mp3 por palavra, com pequena margem e fade.

Saída: audio/words.json  { "<palavra>": { "<personagem>": "words/x.mp3", "default": "words/y.mp3" } }
       audio/words-index.json  cache por arquivo de frase já alinhado (idempotente)
Uso:   python3 tools/align-words.py [--mock]   (--mock: sem whisper, só para testar o fluxo)
Requer: ffmpeg no PATH; faster-whisper (pip install faster-whisper), exceto em --mock.
"""
import difflib, hashlib, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO = os.path.join(ROOT, "audio")
WORDS = os.path.join(AUDIO, "words")
MANIFEST = os.path.join(AUDIO, "manifest.json")
OUT = os.path.join(AUDIO, "words.json")
INDEX = os.path.join(AUDIO, "words-index.json")
MOCK = "--mock" in sys.argv
PAD_BEFORE, PAD_AFTER, MIN_DUR, MIN_PROB = 0.05, 0.10, 0.10, 0.40
# O whisper escreve números em dígitos e algumas formas modernas; o texto usa a forma escrita
NUMBERS = {"0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven",
           "8": "eight", "9": "nine", "10": "ten", "11": "eleven", "12": "twelve", "13": "thirteen", "14": "fourteen",
           "15": "fifteen", "16": "sixteen", "17": "seventeen", "18": "eighteen", "19": "nineteen", "20": "twenty",
           "30": "thirty", "40": "forty", "50": "fifty", "60": "sixty", "70": "seventy", "80": "eighty", "90": "ninety",
           "100": "hundred", "153": "one hundred and fifty three", "1000": "thousand"}
VARIANTS = {"yes": {"yeah", "yep", "yess"}, "ye": {"you"}, "shewed": {"showed"}, "thou": {"you"}, "thy": {"your"},
            "hath": {"has"}, "unto": {"to"}, "ok": {"okay"}}


def norm(t):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", "", t.lower())).strip()


def duration(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path])
    return float(out.decode().strip() or 0)


def transcribe_words(model, path, text):
    """Lista de (palavra_normalizada, inicio, fim, prob) na ordem do áudio."""
    if MOCK:
        # Distribui as palavras uniformemente pelo clipe (só para testar o fluxo de corte)
        toks = text.split(" ")
        d = duration(path)
        step = d / max(1, len(toks))
        return [(w, i * step, (i + 1) * step, 1.0) for i, w in enumerate(toks)]
    segments, _ = model.transcribe(path, language="en", word_timestamps=True, beam_size=1,
                                   initial_prompt=text, condition_on_previous_text=False, vad_filter=False)
    words = []
    for s in segments:
        for w in s.words or []:
            n = norm(w.word)
            if not n:
                continue
            if n in NUMBERS:
                parts = NUMBERS[n].split(" ")
                span = (float(w.end) - float(w.start)) / len(parts)
                for i, p in enumerate(parts):
                    words.append((p, float(w.start) + i * span, float(w.start) + (i + 1) * span, float(w.probability)))
                continue
            words.append((n, float(w.start), float(w.end), float(w.probability)))
    return words


def similar(a, b):
    if a == b or b in VARIANTS.get(a, ()):
        return 1.0
    return difflib.SequenceMatcher(a=a, b=b, autojunk=False).ratio()


def align(tokens, heard):
    """Casa os tokens do texto com as palavras ouvidas (mesma ordem); devolve {idx_token: (ini, fim, prob)}."""
    a = tokens
    b = [h[0] for h in heard]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    out = {}
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                out[i1 + k] = heard[j1 + k][1:]
        elif tag == "replace":
            # trechos diferentes: casa em ordem por semelhança (ex.: 'shewed' ~ 'showed', 'start' ~ 'star')
            j = j1
            for i in range(i1, i2):
                best, bj = 0.0, -1
                for jj in range(j, j2):
                    r = similar(a[i], b[jj])
                    if r > best:
                        best, bj = r, jj
                if bj >= 0 and best >= 0.7:
                    s, e, p = heard[bj][1:]
                    out[i] = (s, e, p * (1.0 if best >= 0.95 else 0.7))
                    j = bj + 1
    return out


def cut(src, start, end, dst):
    fade = 0.015
    subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-ss", f"{start:.3f}", "-t", f"{end - start:.3f}", "-i", src,
                           "-af", f"afade=t=in:st=0:d={fade},afade=t=out:st={max(0, end - start - fade):.3f}:d={fade}",
                           "-ac", "1", "-ar", "22050", "-codec:a", "libmp3lame", "-b:a", "48k", dst])


def main():
    manifest = json.load(open(MANIFEST))
    index = json.load(open(INDEX)) if os.path.exists(INDEX) else {}
    words = json.load(open(OUT)) if os.path.exists(OUT) else {}
    os.makedirs(WORDS, exist_ok=True)
    model = None
    if not MOCK:
        from faster_whisper import WhisperModel
        model = WhisperModel(os.environ.get("WHISPER_MODEL", "small.en"), device="cpu", compute_type="int8")
    sentences = [(k, c, f) for k, e in manifest.items() if " " in k for c, f in e.items() if c != "default"]
    # frases já alinhadas mas com alguma palavra sem corte voltam para a fila (o alinhador melhorou)
    for f, meta in list(index.items()):
        if len(set(meta.get("words", []))) < len(set(meta.get("key", "").split(" "))):
            del index[f]
    todo = [(k, c, f) for k, c, f in sentences if f not in index]
    print(f"Frases gravadas: {len(sentences)} · a alinhar: {len(todo)}")
    done = 0
    for key, char, file in todo:
        src = os.path.join(AUDIO, file)
        if not os.path.exists(src):
            continue
        tokens = key.split(" ")
        try:
            heard = transcribe_words(model, src, key)
        except Exception as ex:  # noqa: BLE001
            print("falhou", key, "-", ex)
            continue
        matched = align(tokens, heard)
        total = duration(src)
        produced = []
        for i, tok in enumerate(tokens):
            if i not in matched:
                continue
            s, e, p = matched[i]
            if p < MIN_PROB:
                continue
            prev_end = matched[i - 1][1] if (i - 1) in matched else 0.0
            next_start = matched[i + 1][0] if (i + 1) in matched else total
            cs = max(prev_end, s - PAD_BEFORE, 0.0)
            ce = min(next_start, e + PAD_AFTER, total)
            if ce - cs < MIN_DUR:
                continue
            name = hashlib.sha1(f"{tok}|{char}|{file}".encode()).hexdigest()[:16] + ".mp3"
            dst = os.path.join(WORDS, name)
            cut(src, cs, ce, dst)
            entry = words.setdefault(tok, {})
            prev = entry.get(char)
            # entre várias frases do mesmo personagem, fica a de maior confiança
            if not prev or p > prev.get("p", 0):
                entry[char] = {"f": "words/" + name, "p": round(p, 3), "d": round(ce - cs, 3)}
            produced.append(tok)
        index[file] = {"key": key, "char": char, "words": produced}
        done += 1
        if done % 25 == 0:
            json.dump(words, open(OUT, "w"), ensure_ascii=False, indent=1)
            json.dump(index, open(INDEX, "w"), ensure_ascii=False, indent=1)
            print(f"{done}/{len(todo)}")
    # Remove cortes de frases que saíram do manifesto
    live = {f for _, _, f in sentences}
    for f in list(index):
        if f not in live:
            del index[f]
    referenced = set()
    for tok, entry in list(words.items()):
        for c in list(entry):
            if c == "default":
                continue
            meta = entry[c]
            if not os.path.exists(os.path.join(AUDIO, meta["f"])) or not any(f in live and c == index[f]["char"] and tok in index[f]["words"] for f in index):
                del entry[c]
        chars = [c for c in entry if c != "default"]
        if not chars:
            del words[tok]
            continue
        best = max(chars, key=lambda c: (entry[c]["p"], -abs(entry[c]["d"] - 0.5)))
        entry["default"] = entry[best]["f"]
        referenced.update(entry[c]["f"] for c in chars)
    removed = 0
    for f in os.listdir(WORDS):
        if f.endswith(".mp3") and ("words/" + f) not in referenced:
            os.remove(os.path.join(WORDS, f))
            removed += 1
    json.dump(words, open(OUT, "w"), ensure_ascii=False, indent=1)
    json.dump(index, open(INDEX, "w"), ensure_ascii=False, indent=1)
    n_files = sum(1 for e in words.values() for c in e if c != "default")
    print(f"Concluído: {done} frases alinhadas · {len(words)} palavras · {n_files} cortes · {removed} órfãos removidos")


if __name__ == "__main__":
    main()
