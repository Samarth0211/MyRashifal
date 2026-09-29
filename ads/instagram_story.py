"""
Generate an Instagram Story image (1080x1920) for MyRashifal+
Run: python ads/instagram_story.py
Output: ads/instagram_story_1080x1920.png
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

W, H = 1080, 1920


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


def draw_stars(draw, w, h, count=100):
    random.seed(77)
    for _ in range(count):
        x = random.randint(0, w)
        y = random.randint(0, h)
        s = random.choice([1, 1, 2])
        a = random.randint(25, 90)
        draw.ellipse([x, y, x+s, y+s], fill=(255, 255, 255, a))


def draw_zodiac_ring(img, cx, cy, radius, symbol_size=30):
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
        alpha_val = 55 + (i % 3) * 15
        od.text((x - sw//2, y - sh//2), sym, font=sfont, fill=(*GOLD_LIGHT, alpha_val))
    return Image.alpha_composite(img, overlay)


def create_story():
    img = Image.new('RGBA', (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Background stars
    draw_stars(draw, W, H, 120)

    # Two subtle glows — upper and lower
    img = draw_soft_glow(img, (W//2, 500), 400, GOLD, max_alpha=12)
    img = draw_soft_glow(img, (W//2, 1300), 300, GOLD, max_alpha=8)
    draw = ImageDraw.Draw(img)

    # Zodiac ring behind headline
    img = draw_zodiac_ring(img, W//2, 520, 340, symbol_size=28)
    draw = ImageDraw.Draw(img)

    # ---- Top: Brand name ----
    y = 120
    brand_font = get_font(34, bold=True)
    brand_text = "MyRashifal+"
    bx = text_cx(draw, brand_text, brand_font, W)
    draw.text((bx, y), brand_text, font=brand_font, fill=GOLD_LIGHT)

    # Tagline
    y += 52
    tag_font = get_font(20)
    tag_text = "Vedic Astrology Powered by Real Astronomy"
    tx = text_cx(draw, tag_text, tag_font, W)
    draw.text((tx, y), tag_text, font=tag_font, fill=TEXT_SEC)

    # Gold line
    y += 40
    draw.line([(W//2 - 150, y), (W//2 + 150, y)], fill=(*GOLD, 80), width=1)

    # ---- Main headline ----
    y += 60
    h1_font = get_font(58, bold=True)
    line1 = "Your Free Vedic"
    l1x = text_cx(draw, line1, h1_font, W)
    draw.text((l1x, y), line1, font=h1_font, fill=WHITE)

    y += 72
    line2 = "Kundli in"
    l2x = text_cx(draw, line2, h1_font, W)
    draw.text((l2x, y), line2, font=h1_font, fill=WHITE)

    y += 72
    line3 = "30 Seconds"
    l3x = text_cx(draw, line3, h1_font, W)
    draw.text((l3x, y), line3, font=h1_font, fill=GOLD_LIGHT)

    # Hindi subtitle
    y += 85
    hi_font = get_hindi_font(30)
    hi_text = "\u0905\u092A\u0928\u0940 \u0915\u0941\u0902\u0921\u0932\u0940 \u092B\u094D\u0930\u0940 \u092E\u0947\u0902 \u092C\u0928\u093E\u090F\u0902"
    hx = text_cx(draw, hi_text, hi_font, W)
    draw.text((hx, y), hi_text, font=hi_font, fill=TEXT_SEC)

    # ---- Feature cards (single column, full width) ----
    y += 90
    features = [
        ("Free Kundli", "Birth chart using real astronomical data"),
        ("Daily Rashifal", "For all 12 signs in 3 languages"),
        ("Kundli Matching", "36-point Ashtakoot Gun Milan"),
        ("AI Personality", "Career, relationships & life insights"),
        ("Shubh Muhurat", "Find auspicious dates for events"),
    ]

    card_w = 900
    card_h = 78
    gap = 16
    start_x = (W - card_w) // 2

    feat_font = get_font(22, bold=True)
    desc_font = get_font(16)

    for i, (title, desc) in enumerate(features):
        cx = start_x
        cy = y + i * (card_h + gap)

        # Card background
        draw.rounded_rectangle(
            [cx, cy, cx + card_w, cy + card_h],
            radius=14,
            fill=(*BG_CARD, 200)
        )
        # Gold left accent
        draw.rounded_rectangle(
            [cx, cy, cx + 5, cy + card_h],
            radius=2,
            fill=GOLD
        )

        # Checkmark
        draw.text((cx + 22, cy + 17), "\u2713", font=get_symbol_font(24), fill=GREEN)

        # Title + desc
        draw.text((cx + 58, cy + 14), title, font=feat_font, fill=WHITE)
        draw.text((cx + 58, cy + 44), desc, font=desc_font, fill=TEXT_SEC)

    # ---- CTA button ----
    y_cta = y + len(features) * (card_h + gap) + 55

    btn_w = 420
    btn_h = 64
    btn_x = (W - btn_w) // 2
    btn_y = y_cta
    draw.rounded_rectangle(
        [btn_x, btn_y, btn_x + btn_w, btn_y + btn_h],
        radius=32,
        fill=GOLD
    )
    cta_font = get_font(26, bold=True)
    cta_text = "Visit myrashifal.in"
    ctx = text_cx(draw, cta_text, cta_font, W)
    draw.text((ctx, btn_y + 16), cta_text, font=cta_font, fill=BG)

    # Sub-CTA
    y_sub = btn_y + btn_h + 24
    sub_font = get_font(18)
    sub_text = "No app download  |  Works on any device"
    sx = text_cx(draw, sub_text, sub_font, W)
    draw.text((sx, y_sub), sub_text, font=sub_font, fill=TEXT_SEC)

    # ---- What you get ----
    y_what = y_sub + 55
    what_font = get_font(20, bold=True)
    what_text = "What You Get - Absolutely Free"
    wx = text_cx(draw, what_text, what_font, W)
    draw.text((wx, y_what), what_text, font=what_font, fill=GOLD_LIGHT)

    y_what += 42
    items = [
        "Exact planetary positions & house placements",
        "Nakshatra & Vimshottari Dasha periods",
        "AI-powered personality & career analysis",
        "Yoga detection (Raj Yoga, Gajakesari, etc.)",
    ]
    item_font = get_font(17)
    for item in items:
        bullet_text = f"  \u2022  {item}"
        bx = text_cx(draw, bullet_text, item_font, W)
        draw.text((bx, y_what), bullet_text, font=item_font, fill=TEXT_SEC)
        y_what += 32

    # ---- Testimonial / social proof ----
    y_proof = y_what + 50
    draw.line([(W//2 - 160, y_proof), (W//2 + 160, y_proof)], fill=(*GOLD, 50), width=1)

    y_proof += 30
    quote_font = get_font(19)
    quote_text = '"Most accurate free Kundli I\'ve found online"'
    qx = text_cx(draw, quote_text, quote_font, W)
    draw.text((qx, y_proof), quote_text, font=quote_font, fill=(*WHITE, 200))

    y_proof += 32
    star_font = get_symbol_font(22)
    stars_text = "\u2605 \u2605 \u2605 \u2605 \u2605"
    stx = text_cx(draw, stars_text, star_font, W)
    draw.text((stx, y_proof), stars_text, font=star_font, fill=GOLD_LIGHT)

    y_proof += 32
    user_font = get_font(15)
    user_text = "- 150+ users trust MyRashifal+"
    ux = text_cx(draw, user_text, user_font, W)
    draw.text((ux, y_proof), user_text, font=user_font, fill=TEXT_SEC)

    # ---- Bottom: language badges ----
    y_bottom = H - 110
    lang_font = get_font(18, bold=True)
    badges = ["English", "\u0939\u093F\u0902\u0926\u0940", "\u092E\u0930\u093E\u0920\u0940"]
    badge_w = 130
    total_w = len(badges) * badge_w + (len(badges) - 1) * 16
    bx_start = (W - total_w) // 2

    for j, badge in enumerate(badges):
        bx = bx_start + j * (badge_w + 16)
        draw.rounded_rectangle(
            [bx, y_bottom, bx + badge_w, y_bottom + 42],
            radius=21,
            fill=(255, 255, 255, 15)
        )
        if j > 0:
            bf = get_hindi_font(18, bold=True)
        else:
            bf = lang_font
        bbox = draw.textbbox((0, 0), badge, font=bf)
        tw = bbox[2] - bbox[0]
        draw.text((bx + (badge_w - tw) // 2, y_bottom + 9), badge, font=bf, fill=GOLD_LIGHT)

    # "100% Free" above badges
    free_font = get_font(15)
    free_text = "100% Free  |  No Sign-up Required  |  3 Languages"
    fx = text_cx(draw, free_text, free_font, W)
    draw.text((fx, y_bottom - 32), free_text, font=free_font, fill=(*TEXT_SEC, 160))

    # Swipe up hint at very bottom
    y_swipe = H - 50
    swipe_font = get_font(16)
    swipe_text = "Swipe up or visit myrashifal.in"
    swx = text_cx(draw, swipe_text, swipe_font, W)
    draw.text((swx, y_swipe), swipe_text, font=swipe_font, fill=(*GOLD_LIGHT, 120))

    # Save
    out = img.convert('RGB')
    path = os.path.join(SCRIPT_DIR, 'instagram_story_1080x1920.png')
    out.save(path, 'PNG', quality=95)
    print(f"[OK] Saved: {path}")


if __name__ == '__main__':
    create_story()
