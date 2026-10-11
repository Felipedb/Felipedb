#!/usr/bin/env python3
"""Recorta o fundo dos retratos de chars/*.jpg e grava chars/v2/<key>/bust.webp (512x512, fundo transparente,
busto centralizado e encostado na base). O app usa bust.webp grande, sem moldura, no palco do personagem, na
trilha e nas fichas; as chaves de chars/v2/fallback.json usam o retrato redondo (JPG em círculo) no lugar.

Uso: python3 tools/cut-chars.py [chave ...]   (sem argumentos: todos, menos hero, promo e os de fallback.json)
Requer: rembg (modelos bria-rmbg e u2net_human_seg, baixados na primeira execução), Pillow, numpy e scipy.

Recorte (revisado em folha de contato sobre fundo claro e escuro):
  1. tira a moldura creme do cartão e a faixa de legenda (só nos retratos de 249 px de altura);
  2. amplia para ~1024 px e passa o modelo (bria-rmbg por padrão: mantém véus, cajados e folhas com borda limpa);
  3. binariza a máscara (alfa > limiar), remove ilhas e respingos, fecha furinhos, encolhe 1 px e suaviza a borda.
  Sem o passo 3 o fundo pintado vazava como névoa semitransparente (mão de Moisés, véu de Rute, arca de Noé).
"""
import sys, os, glob, json, subprocess
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "chars")
OUT = os.path.join(SRC, "v2")
SIZE = 512
SKIP = {"hero", "promo"}

# Ajustes por personagem. model: "bria-rmbg" (padrão) ou "u2net_human_seg" quando o bria mantém o céu pintado
# como parte da figura; thr: limiar do alfa (0 a 255); crop: (esq, topo, dir, base) em fração da imagem.
DEFAULT = {"model": "bria-rmbg", "thr": 200, "open": 2}
PARAMS = {
    "abraao": {"model": "u2net_human_seg"},
    "elias": {"model": "u2net_human_seg"},
    "moises": {"model": "u2net_human_seg", "thr": 235},
}


def fallback_keys():
    try:
        with open(os.path.join(OUT, "fallback.json"), encoding="utf-8") as f:
            return set(json.load(f).get("keys", []))
    except FileNotFoundError:
        return set()


def clean_mask(alpha, thr, opening):
    m = np.array(alpha) > thr
    m = ndi.binary_opening(m, iterations=opening)
    lab, n = ndi.label(m)
    if n:
        sizes = ndi.sum(m, lab, range(1, n + 1))
        keep = [i + 1 for i, s in enumerate(sizes) if s >= sizes.max() * 0.15]
        m = np.isin(lab, keep)
    holes = ndi.binary_fill_holes(m) & ~m
    hl, hn = ndi.label(holes)
    if hn:
        hs = ndi.sum(holes, hl, range(1, hn + 1))
        m = m | np.isin(hl, [i + 1 for i, s in enumerate(hs) if s < m.sum() * 0.002])
    m = ndi.binary_erosion(m, iterations=1)
    return Image.fromarray((m * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.2))


def cut(key):
    from rembg import remove, new_session
    p = {**DEFAULT, **PARAMS.get(key, {})}
    im = Image.open(os.path.join(SRC, key + ".jpg")).convert("RGB")
    w, h = im.size
    # Moldura creme do cartão (~5% em volta) e faixa de legenda (~6% na base dos retratos de 249 px)
    crop = p.get("crop") or (0.05, 0.05, 0.99, 0.94 if h >= 249 else 1.0)
    im = im.crop((round(w * crop[0]), round(h * crop[1]), round(w * crop[2]), round(h * crop[3])))
    scale = max(1, round(1024 / max(im.size)))
    big = im.resize((im.width * scale, im.height * scale), Image.LANCZOS)
    out = remove(big, session=new_session(p["model"])).convert("RGBA")
    out.putalpha(clean_mask(out.getchannel("A"), p["thr"], p["open"]))
    bbox = out.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox()
    if not bbox:
        return None
    out = out.crop(bbox)
    # Encaixa em 512x512 com o busto encostado na base e centralizado
    cw, ch = out.size
    k = min((SIZE - 16) / cw, (SIZE - 8) / ch)
    out = out.resize((max(1, round(cw * k)), max(1, round(ch * k))), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(out, ((SIZE - out.width) // 2, SIZE - out.height), out)
    os.makedirs(os.path.join(OUT, key), exist_ok=True)
    dst = os.path.join(OUT, key, "bust.webp")
    canvas.save(dst, "WEBP", quality=92, method=6)
    return dst


def main():
    args = sys.argv[1:]
    if len(args) == 2 and args[0] == "--one":
        dst = cut(args[1])
        print(("ok   " if dst else "vazio") + " " + args[1])
        return
    keys = args or sorted(os.path.basename(f)[:-4] for f in glob.glob(os.path.join(SRC, "*.jpg")))
    skip = SKIP | (fallback_keys() if not args else set())
    # Um processo por personagem: a sessão do bria-rmbg cai sem aviso quando reaproveitada em sequência
    for k in keys:
        if k in skip:
            continue
        subprocess.run([sys.executable, os.path.abspath(__file__), "--one", k], check=False)


if __name__ == "__main__":
    main()
