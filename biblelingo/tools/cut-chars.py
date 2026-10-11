#!/usr/bin/env python3
"""Recorta o fundo dos retratos de chars/*.jpg e grava chars/v2/<key>/bust.webp (512x512, fundo transparente,
busto centralizado e encostado na base). O app usa bust.webp no palco do personagem, na trilha e nas fichas
enquanto não existe o ativo de corpo inteiro (full.webp).

Uso: python3 tools/cut-chars.py [chave ...]   (sem argumentos: todos, menos hero e promo)
Requer: rembg (modelo isnet-general-use, baixado na primeira execução) e Pillow.
"""
import sys, os, glob
from PIL import Image, ImageFilter
from rembg import remove, new_session

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "chars")
OUT = os.path.join(SRC, "v2")
SIZE = 512
SKIP = {"hero", "promo"}


def cut(key, session):
    src = os.path.join(SRC, key + ".jpg")
    im = Image.open(src).convert("RGB")
    # Os retratos trazem uma faixa clara de legenda nos últimos ~5% da altura: fica fora do recorte
    im = im.crop((0, 0, im.width, round(im.height * 0.94)))
    # Amplia antes do recorte: a máscara sai mais suave em fontes pequenas (360x249)
    scale = max(1, round(1024 / max(im.size)))
    big = im.resize((im.width * scale, im.height * scale), Image.LANCZOS)
    cut = remove(big, session=session, alpha_matting=True, alpha_matting_foreground_threshold=240,
                 alpha_matting_background_threshold=10, alpha_matting_erode_size=10)
    alpha = cut.getchannel("A")
    bbox = alpha.point(lambda a: 255 if a > 24 else 0).getbbox()
    if not bbox:
        return None
    cut = cut.crop(bbox)
    # Suaviza a borda da máscara (1 px) para não serrilhar na tela
    a = cut.getchannel("A").filter(ImageFilter.GaussianBlur(0.8))
    cut.putalpha(a)
    # Encaixa em 512x512 com o busto encostado na base e centralizado
    w, h = cut.size
    k = min((SIZE - 16) / w, (SIZE - 8) / h)
    cut = cut.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(cut, ((SIZE - cut.width) // 2, SIZE - cut.height), cut)
    os.makedirs(os.path.join(OUT, key), exist_ok=True)
    dst = os.path.join(OUT, key, "bust.webp")
    canvas.save(dst, "WEBP", quality=92, method=6)
    return dst


def main():
    keys = [a for a in sys.argv[1:]] or sorted(os.path.basename(f)[:-4] for f in glob.glob(os.path.join(SRC, "*.jpg")))
    keys = [k for k in keys if k not in SKIP]
    session = new_session("isnet-general-use")
    for k in keys:
        dst = cut(k, session)
        print(("ok   " if dst else "vazio") + " " + k)


if __name__ == "__main__":
    main()
