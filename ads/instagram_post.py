"""
Generate a clean, attractive Instagram post image for MyRashifal+
Run: python ads/instagram_post.py
Output: ads/instagram_post_1080x1080.png
"""
from PIL import Image, ImageDraw, ImageFont
import math
import os
import random

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Brand colors
BG = (6, 9, 24)
BG_CARD = (15, 20, 50)
GOLD = (201, 149, 26)
GOLD_LIGHT = (232, 191, 75)
TEXT = (234, 237, 243)
TEXT_SEC = (160, 166, 188)
WHITE = (255, 255, 255)
GREEN = (34, 197, 94)

W, H = 1080, 1080


def get_font(size, bold=False):
    names = [
        'C:/Windows/Fonts/segoeuib.ttf' if bold else 'C:/Windows/Fonts/segoeui.ttf',
        'C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf',
    ]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def get_hindi_font(size, bold=False):
    try:
        idx = 1 if bold else 0
        return ImageFont.truetype('C:/Windows/Fonts/Nirmala.ttc', size, index=idx)
    except (OSError, IOError):
        return get_font(size, bold)


def get_symbol_font(size):
    try:
        return ImageFont.truetype('C:/Windows/Fonts/seguisym.ttf', size)
    except (OSError, IOError):
        return get_font(size)


def text_cx(draw, text, font, canvas_w):
    bbox = draw.textbbox((0, 0), text, font=font)
    return (canvas_w - (bbox[2] - bbox[0])) // 2


def draw_soft_glow(img, center, radius, color, max_alpha=20):
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    steps = min(radius, 60)
    for i in range(steps):
        r = radius - (radius * i // steps)
        a = int(max_alpha * (1 - i / steps) ** 2)
        if a < 1:
            continue
        od.ellipse(
            [center[0]-r, center[1]-r, center[0]+r, center[1]+r],
            fill=(*color, a)
        )
    return Image.alpha_composite(img, overlay)


def draw_stars(draw, w, h, count=60):
    random.seed(99)
    for _ in range(count):
        x = random.randint(0, w)
        y = random.randint(0, h)
        s = random.choice([1, 1, 2])
        a = random.randint(25, 90)
        draw.ellipse([x, y, x+s, y+s], fill=(255, 255, 255, a))


def draw_zodiac_ring(img, cx, cy, radius, symbol_size=28):
    """Draw 12 zodiac symbols in a circle."""
    symbols = [
        '\u2648', '\u2649', '\u264A', '\u264B', '\u264C', '\u264D',
        '\u264E', '\u264F', '\u2650', '\u2651', '\u2652', '\u2653'
    ]
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    sfont = get_symbol_font(symbol_size)
    for i, sym in enumerate(symbols):
        angle = math.radians(i * 30 - 90)
        x = cx + int(radius * math.cos(angle))
        y = cy + int(radius * math.sin(angle))
        bbox = od.textbbox((0, 0), sym, font=sfont)
        sw = bbox[2] - bbox[0]
        sh = bbox[3] - bbox[1]
        alpha_val = 50 + (i % 3) * 15
        od.text((x - sw//2, y - sh//2), sym, font=sfont, fill=(*GOLD_LIGHT, alpha_val))
    return Image.alpha_composite(img, overlay)


def create_post():
    img = Image.new('RGBA', (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Background stars
    draw_stars(draw, W, H, 80)

    # Subtle center glow
    img = draw_soft_glow(img, (W//2, 420), 380, GOLD, max_alpha=14)
    draw = ImageDraw.Draw(img)

    # Zodiac ring (decorative, faint)
    img = draw_zodiac_ring(img, W//2, 420, 320, symbol_size=26)
    draw = ImageDraw.Draw(img)

    # ---- Top: App name ----
    y = 50
    brand_font = get_font(30, bold=True)
    brand_text = "MyRashifal+"
    bx = text_cx(draw, brand_text, brand_font, W)
    draw.text((bx, y), brand_text, font=brand_font, fill=GOLD_LIGHT)

    # Tagline
    y += 48
    tag_font = get_font(18)
    tag_text = "Vedic Astrology Powered by Real Astronomy"
    tx = text_cx(draw, tag_text, tag_font, W)
    draw.text((tx, y), tag_text, font=tag_font, fill=TEXT_SEC)

    # Thin gold line
    y += 35
    draw.line([(W//2 - 140, y), (W//2 + 140, y)], fill=(*GOLD, 80), width=1)

    # ---- Main headline ----
    y += 45
    h1_font = get_font(52, bold=True)
    line1 = "Your Free Vedic"
    l1x = text_cx(draw, line1, h1_font, W)
    draw.text((l1x, y), line1, font=h1_font, fill=WHITE)

    y += 65
    line2 = "Kundli in 30 Seconds"
    l2x = text_cx(draw, line2, h1_font, W)
    draw.text((l2x, y), line2, font=h1_font, fill=GOLD_LIGHT)

    # Hindi subtitle
    y += 80
    hi_font = get_hindi_font(28)
    hi_text = "\u0905\u092A\u0928\u0940 \u0915\u0941\u0902\u0921\u0932\u0940 \u092B\u094D\u0930\u0940 \u092E\u0947\u0902 \u092C\u0928\u093E\u090F\u0902"  # अपनी कुंडली फ्री में बनाएं
    hx = text_cx(draw, hi_text, hi_font, W)
    draw.text((hx, y), hi_text, font=hi_font, fill=TEXT_SEC)

    # ---- Feature cards ----
    y += 75
    features = [
        ("Free Kundli", "Real astronomical data"),
        ("Daily Rashifal", "12 signs, 3 languages"),
        ("Kundli Matching", "36-point Gun Milan"),
        ("AI Insights", "Personality & career analysis"),
    ]

    card_w = 460
    card_h = 72
    gap = 14
    start_x = (W - card_w * 2 - gap) // 2

    feat_font = get_font(20, bold=True)
    desc_font = get_font(15)

    for i, (title, desc) in enumerate(features):
        col = i % 2
        row = i // 2
        cx = start_x + col * (card_w + gap)
        cy = y + row * (card_h + gap)

        # Card background
        draw.rounded_rectangle(
            [cx, cy, cx + card_w, cy + card_h],
            radius=12,
            fill=(*BG_CARD, 200)
        )
        # Gold left accent
        draw.rounded_rectangle(
            [cx, cy, cx + 4, cy + card_h],
            radius=2,
            fill=GOLD
        )

        # Checkmark
        draw.text((cx + 18, cy + 15), "\u2713", font=get_symbol_font(22), fill=GREEN)

        # Title + desc
        draw.text((cx + 48, cy + 13), title, font=feat_font, fill=WHITE)
        draw.text((cx + 48, cy + 40), desc, font=desc_font, fill=TEXT_SEC)

    # ---- CTA section ----
    y_cta = y + 2 * (card_h + gap) + 50

    # CTA button
    btn_w = 380
    btn_h = 60
    btn_x = (W - btn_w) // 2
    btn_y = y_cta
    draw.rounded_rectangle(
        [btn_x, btn_y, btn_x + btn_w, btn_y + btn_h],
        radius=30,
        fill=GOLD
    )
    cta_font = get_font(24, bold=True)
    cta_text = "Visit myrashifal.in"
    ctx = text_cx(draw, cta_text, cta_font, W)
    draw.text((ctx, btn_y + 15), cta_text, font=cta_font, fill=BG)

    # Sub-CTA text
    y_sub = btn_y + btn_h + 22
    sub_font = get_font(17)
    sub_text = "No app download needed  |  Works on any device"
    sx = text_cx(draw, sub_text, sub_font, W)
    draw.text((sx, y_sub), sub_text, font=sub_font, fill=TEXT_SEC)

    # ---- What you get section ----
    y_what = y_sub + 50
    what_font = get_font(18, bold=True)
    what_text = "What You Get - Absolutely Free"
    wx = text_cx(draw, what_text, what_font, W)
    draw.text((wx, y_what), what_text, font=what_font, fill=GOLD_LIGHT)

    y_what += 36
    items = [
        "Birth chart with exact planetary positions",
        "Nakshatra & Vimshottari Dasha periods",
        "AI personality analysis & Yoga detection",
    ]
    item_font = get_font(16)
    for item in items:
        bullet_text = f"  \u2022  {item}"
        bx = text_cx(draw, bullet_text, item_font, W)
        draw.text((bx, y_what), bullet_text, font=item_font, fill=TEXT_SEC)
        y_what += 28

    # ---- Bottom bar: language badges ----
    y_bottom = H - 65
    lang_font = get_font(16, bold=True)
    badges = ["English", "\u0939\u093F\u0902\u0926\u0940", "\u092E\u0930\u093E\u0920\u0940"]  # हिंदी, मराठी
    badge_w = 110
    total_w = len(badges) * badge_w + (len(badges) - 1) * 14
    bx_start = (W - total_w) // 2

    for j, badge in enumerate(badges):
        bx = bx_start + j * (badge_w + 14)
        draw.rounded_rectangle(
            [bx, y_bottom, bx + badge_w, y_bottom + 38],
            radius=19,
            fill=(255, 255, 255, 15)
        )
        if j > 0:
            bf = get_hindi_font(16, bold=True)
        else:
            bf = lang_font
        bbox = draw.textbbox((0, 0), badge, font=bf)
        tw = bbox[2] - bbox[0]
        draw.text((bx + (badge_w - tw) // 2, y_bottom + 8), badge, font=bf, fill=GOLD_LIGHT)

    # "100% Free" text above bottom badges
    free_font = get_font(14)
    free_text = "100% Free  |  No Sign-up Required  |  3 Languages"
    fx = text_cx(draw, free_text, free_font, W)
    draw.text((fx, y_bottom - 28), free_text, font=free_font, fill=(*TEXT_SEC, 160))

    # Save
    out = img.convert('RGB')
    path = os.path.join(SCRIPT_DIR, 'instagram_post_1080x1080.png')
    out.save(path, 'PNG', quality=95)
    print(f"[OK] Saved: {path}")


if __name__ == '__main__':
    create_post()
