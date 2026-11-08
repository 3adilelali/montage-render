# Render a "file window" image (editor look, brand colours) from real text lines, for montage inserts.
# Usage: python scripts/make-card.py <out.png> <title> <lines.txt> [--ltr]
# Lines starting with "# " are headings (orange), "- " bullets, "@@ " highlighted (magenta bar).
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

ROOT = Path(__file__).resolve().parent.parent
FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_REG = "C:/Windows/Fonts/segoeui.ttf"
MONO = "C:/Windows/Fonts/consola.ttf"

out, title, src = sys.argv[1], sys.argv[2], sys.argv[3]
ltr = "--ltr" in sys.argv
lines = Path(src).read_text(encoding="utf8").splitlines()

W, H = 1600, 960
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
# Window body + title bar.
d.rounded_rectangle((0, 0, W - 1, H - 1), 28, fill=(22, 18, 32, 255), outline=(65, 37, 98, 255), width=3)
d.rounded_rectangle((0, 0, W - 1, 84), 28, fill=(36, 28, 52, 255))
d.rectangle((0, 56, W - 1, 84), fill=(36, 28, 52, 255))
for i, c in enumerate([(224, 75, 168), (251, 159, 42), (160, 78, 215)]):
    d.ellipse((34 + i * 40, 28, 58 + i * 40, 52), fill=c)

def ar(t):
    return t if ltr else get_display(arabic_reshaper.reshape(t))

def font(size, w=700):
    return ImageFont.truetype(FONT_BOLD if w >= 600 else FONT_REG, size)

tf = font(36, 600)
tfont = font(32, 600)
tt = ar(title) if not title.isascii() else title
tw = d.textlength(tt, font=tfont)
d.text(((W - tw) / 2, 20), tt, font=tfont, fill=(220, 210, 235))

y = 130
for raw in lines:
    if not raw.strip():
        y += 26
        continue
    if raw.startswith("# "):
        f, col, text, h = font(50, 900), (255, 167, 51), raw[2:], 74
    elif raw.startswith("@@ "):
        f, col, text, h = font(40, 700), (255, 255, 255), raw[3:], 64
        d.rounded_rectangle((60, y - 8, W - 60, y + 54), 12, fill=(178, 55, 138, 110))
    elif raw.startswith("- "):
        f, col, text, h = font(38, 500), (232, 226, 244), "• " + raw[2:] if ltr else raw[2:] + " •", 60
    else:
        f, col, text, h = font(38, 500), (200, 192, 216), raw, 60
    t = ar(text)
    tw = d.textlength(t, font=f)
    x = 90 if ltr else W - 90 - tw
    d.text((x, y), t, font=f, fill=col)
    y += h
    if y > H - 60:
        break

# Soft shadow behind the window.
shadow = Image.new("RGBA", (W + 120, H + 120), (0, 0, 0, 0))
ImageDraw.Draw(shadow).rounded_rectangle((60, 80, W + 60, H + 80), 30, fill=(0, 0, 0, 170))
shadow = shadow.filter(ImageFilter.GaussianBlur(28))
shadow.alpha_composite(img, (60, 60))
shadow.save(out)
print("saved", out)
