"""
Generate Instagram ad creatives for MyRashifal+
Run: python ads/generate_ads.py
Output: ads/ folder with PNG files
"""
from PIL import Image, ImageDraw, ImageFont
import math
import os
import random

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'public')

# Brand colors
BG = (6, 9, 24)
BG_LIGHTER = (12, 16, 38)
BG_CARD = (15, 20, 45)
GOLD = (201, 149, 26)
GOLD_LIGHT = (232, 191, 75)
GOLD_DIM = (160, 120, 20)
TEXT = (234, 237, 243)
TEXT_SEC = (138, 144, 168)
GREEN = (34, 197, 94)
WHITE = (255, 255, 255)

# Font helpers
def get_font(size, bold=False):
    """System fonts for English text."""
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
    """Nirmala UI for Devanagari text."""
    try:
        idx = 1 if bold else 0
        return ImageFont.truetype('C:/Windows/Fonts/Nirmala.ttc', size, index=idx)
    except (OSError, IOError):
        return get_font(size, bold)

def get_symbol_font(size):
    """Segoe UI Symbol for zodiac/planet glyphs."""
    try:
        return ImageFont.truetype('C:/Windows/Fonts/seguisym.ttf', size)
    except (OSError, IOError):
        return get_font(size)

def draw_rounded_rect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill)

def draw_soft_glow(img, center, radius, color, max_alpha=25):
    """Draw a subtle radial glow — efficient version."""
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    steps = min(radius, 80)
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

def draw_stars(draw, w, h, count=50):
    """Tiny star dots on background."""
    random.seed(42)
    for _ in range(count):
        x = random.randint(0, w)
        y = random.randint(0, h)
        s = random.choice([1, 1, 1, 2])
        a = random.randint(30, 100)
        draw.ellipse([x, y, x+s, y+s], fill=(255, 255, 255, a))

def draw_gradient_line(draw, y, w, color, alpha=40):
    """Horizontal line with fading edges."""
    mid = w // 2
    span = 200
    for x in range(mid - span, mid + span):
        dist = abs(x - mid)
        a = int(alpha * (1 - dist / span))
        if a > 0:
            draw.point((x, y), fill=(*color, a))

def text_center_x(draw, text, font, w):
    bbox = draw.textbbox((0, 0), text, font=font)
    return (w - (bbox[2] - bbox[0])) // 2

def load_app_icon(size=120):
    icon_path = os.path.join(PUBLIC_DIR, 'icon-512-maskable.png')
    if os.path.exists(icon_path):
        icon = Image.open(icon_path).convert('RGBA').resize((size, size), Image.LANCZOS)
        mask = Image.new('L', (size, size), 0)
        md = ImageDraw.Draw(mask)
        md.rounded_rectangle([0, 0, size, size], radius=size // 4, fill=255)
        icon.putalpha(mask)
        return icon
    return None


# ============================================================
# AD 1: Free Kundli - Feed (1080x1080)
# ============================================================
def ad1_feed():
    W, H = 1080, 1080
    img = Image.new('RGBA', (W, H), (*BG, 255))
    draw = ImageDraw.Draw(img, 'RGBA')

    draw_stars(draw, W, H, 70)
    img = draw_soft_glow(img, (W//2, 280), 320, GOLD, 18)
    img = draw_soft_glow(img, (100, H-100), 200, (100, 80, 200), 8)
    draw = ImageDraw.Draw(img, 'RGBA')

    # Zodiac ring (subtle, using symbol font)
    f_sym = get_symbol_font(26)
    symbols = list('\u2648\u2649\u264A\u264B\u264C\u264D\u264E\u264F\u2650\u2651\u2652\u2653')
    cx, cy = W // 2, 260
    radius = 195
    for i, sym in enumerate(symbols):
        angle = (i / 12) * 2 * math.pi - math.pi / 2
        x = cx + radius * math.cos(angle)
        y = cy + radius * math.sin(angle)
        bbox = draw.textbbox((0, 0), sym, font=f_sym)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text((x - tw//2, y - th//2), sym, fill=(*GOLD_DIM, 70), font=f_sym)

    # App icon
    icon = load_app_icon(90)
    if icon:
        img.paste(icon, (W//2 - 45, 155), icon)
        draw = ImageDraw.Draw(img, 'RGBA')

    # Brand name
    f_brand = get_font(26, bold=True)
    x = text_center_x(draw, 'MyRashifal+', f_brand, W)
    draw.text((x, 258), 'MyRashifal+', fill=GOLD_LIGHT, font=f_brand)

    draw_gradient_line(draw, 300, W, GOLD, 50)

    # FREE badge
    f_free = get_font(20, bold=True)
    badge_text = '100% FREE'
    bbox = draw.textbbox((0, 0), badge_text, font=f_free)
    bw = bbox[2] - bbox[0] + 30
    bx = (W - bw) // 2
    draw_rounded_rect(draw, (bx, 325, bx+bw, 355), 12, (*GREEN, 50))
    draw.text((bx + 15, 329), badge_text, fill=GREEN, font=f_free)

    # Main headline
    f_head = get_font(62, bold=True)
    lines = ['Get Your Vedic', 'Kundli Report']
    y = 385
    for line in lines:
        x = text_center_x(draw, line, f_head, W)
        draw.text((x, y), line, fill=WHITE, font=f_head)
        y += 76

    # Sub
    f_sub = get_font(26)
    sub = 'Accurate Birth Chart in 30 Seconds'
    x = text_center_x(draw, sub, f_sub, W)
    draw.text((x, y + 15), sub, fill=TEXT_SEC, font=f_sub)

    # Feature pills
    features = ['9 Planets', '12 Houses', 'Nakshatras', 'Dasha']
    f_pill = get_font(18, bold=True)
    pill_y = y + 75
    total_w = sum(draw.textbbox((0,0), f, font=f_pill)[2] - draw.textbbox((0,0), f, font=f_pill)[0] + 44 for f in features) + 12 * (len(features)-1)
    px = (W - total_w) // 2
    for feat in features:
        bbox = draw.textbbox((0,0), feat, font=f_pill)
        fw = bbox[2] - bbox[0] + 44
        draw_rounded_rect(draw, (px, pill_y, px+fw, pill_y+38), 19, (*GOLD, 30))
        draw.text((px + 22, pill_y + 8), feat, fill=GOLD_LIGHT, font=f_pill)
        px += fw + 12

    # CTA button
    f_cta = get_font(28, bold=True)
    cta = 'Generate Free Kundli'
    bbox = draw.textbbox((0,0), cta, font=f_cta)
    cw = bbox[2] - bbox[0] + 70
    ch = 58
    cx = (W - cw) // 2
    cy = H - 220
    draw_rounded_rect(draw, (cx, cy, cx+cw, cy+ch), 14, GOLD)
    draw.text((cx + 35, cy + 13), cta, fill=BG, font=f_cta)

    # Arrow
    f_arrow = get_font(28)
    draw.text((cx + cw - 38, cy + 13), '>', fill=BG, font=f_arrow)

    # Website
    f_url = get_font(20)
    url = 'myrashifal.in'
    x = text_center_x(draw, url, f_url, W)
    draw.text((x, H - 130), url, fill=TEXT_SEC, font=f_url)

    # Hindi tagline
    f_hi = get_hindi_font(22)
    hi = '\u0905\u092a\u0928\u0940 \u091c\u0928\u094d\u092e \u0915\u0941\u0902\u0921\u0932\u0940 \u092e\u0941\u092b\u093c\u094d\u0924 \u092e\u0947\u0902 \u092c\u0928\u093e\u090f\u0902'
    x = text_center_x(draw, hi, f_hi, W)
    draw.text((x, H - 90), hi, fill=(*TEXT_SEC, 160), font=f_hi)

    return img.convert('RGB')


# ============================================================
# AD 1: Free Kundli - Story (1080x1920)
# ============================================================
def ad1_story():
    W, H = 1080, 1920
    img = Image.new('RGBA', (W, H), (*BG, 255))
    draw = ImageDraw.Draw(img, 'RGBA')

    draw_stars(draw, W, H, 100)
    img = draw_soft_glow(img, (W//2, 450), 350, GOLD, 16)
    img = draw_soft_glow(img, (W-150, H-300), 250, (100, 80, 200), 6)
    draw = ImageDraw.Draw(img, 'RGBA')

    # Zodiac ring
    f_sym = get_symbol_font(30)
    symbols = list('\u2648\u2649\u264A\u264B\u264C\u264D\u264E\u264F\u2650\u2651\u2652\u2653')
    cx, cy = W // 2, 450
    radius = 220
    for i, sym in enumerate(symbols):
        angle = (i / 12) * 2 * math.pi - math.pi / 2
        x = cx + radius * math.cos(angle)
        y = cy + radius * math.sin(angle)
        bbox = draw.textbbox((0, 0), sym, font=f_sym)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text((x - tw//2, y - th//2), sym, fill=(*GOLD_DIM, 60), font=f_sym)

    icon = load_app_icon(110)
    if icon:
        img.paste(icon, (W//2 - 55, 300), icon)
        draw = ImageDraw.Draw(img, 'RGBA')

    f_brand = get_font(30, bold=True)
    x = text_center_x(draw, 'MyRashifal+', f_brand, W)
    draw.text((x, 425), 'MyRashifal+', fill=GOLD_LIGHT, font=f_brand)

    draw_gradient_line(draw, 475, W, GOLD, 50)

    # FREE badge
    f_free = get_font(28, bold=True)
    badge_text = '100% FREE'
    bbox = draw.textbbox((0, 0), badge_text, font=f_free)
    bw = bbox[2] - bbox[0] + 40
    bx = (W - bw) // 2
    draw_rounded_rect(draw, (bx, 510, bx+bw, 550), 12, (*GREEN, 50))
    draw.text((bx + 20, 514), badge_text, fill=GREEN, font=f_free)

    f_head = get_font(68, bold=True)
    lines = ['Your Complete', 'Vedic Birth', 'Chart']
    y = 600
    for line in lines:
        x = text_center_x(draw, line, f_head, W)
        draw.text((x, y), line, fill=WHITE, font=f_head)
        y += 84

    f_sub = get_font(28)
    sub = 'Based on Real Astronomical Data'
    x = text_center_x(draw, sub, f_sub, W)
    draw.text((x, y + 25), sub, fill=TEXT_SEC, font=f_sub)

    # Features list with checkmarks
    features = [
        'Planetary Positions & Houses',
        'Nakshatra & Dasha Periods',
        'Personality Analysis',
        'Yoga Detection',
    ]
    f_feat = get_font(26)
    f_check = get_font(26, bold=True)
    fy = y + 100
    for feat in features:
        draw.text((200, fy), '+', fill=GREEN, font=f_check)
        draw.text((235, fy), feat, fill=TEXT, font=f_feat)
        fy += 50

    # CTA
    f_cta = get_font(30, bold=True)
    cta = 'Try Now  -  myrashifal.in'
    bbox = draw.textbbox((0,0), cta, font=f_cta)
    cw = bbox[2] - bbox[0] + 70
    cx = (W - cw) // 2
    cy = H - 380
    draw_rounded_rect(draw, (cx, cy, cx+cw, cy+66), 14, GOLD)
    draw.text((cx + 35, cy + 16), cta, fill=BG, font=f_cta)

    # Hindi
    f_hi = get_hindi_font(26)
    hi = '\u0905\u092a\u0928\u0940 \u091c\u0928\u094d\u092e \u0915\u0941\u0902\u0921\u0932\u0940 \u092e\u0941\u092b\u093c\u094d\u0924 \u092e\u0947\u0902 \u092c\u0928\u093e\u090f\u0902'
    x = text_center_x(draw, hi, f_hi, W)
    draw.text((x, H - 270), hi, fill=TEXT_SEC, font=f_hi)

    # Swipe up
    f_swipe = get_font(20)
    swipe = 'Swipe Up'
    x = text_center_x(draw, swipe, f_swipe, W)
    draw.text((x, H - 100), swipe, fill=(*TEXT_SEC, 100), font=f_swipe)
    # Arrow
    draw.polygon([(W//2-8, H-120), (W//2, H-130), (W//2+8, H-120)], fill=(*TEXT_SEC, 80))

    return img.convert('RGB')


# ============================================================
# AD 2: Daily Rashifal - Feed (1080x1080)
# ============================================================
def ad2_feed():
    W, H = 1080, 1080
    img = Image.new('RGBA', (W, H), (*BG, 255))
    draw = ImageDraw.Draw(img, 'RGBA')

    draw_stars(draw, W, H, 50)
    img = draw_soft_glow(img, (200, 200), 250, GOLD, 12)
    img = draw_soft_glow(img, (W-200, H-200), 250, (100, 80, 200), 8)
    draw = ImageDraw.Draw(img, 'RGBA')

    # Brand top
    f_brand = get_font(22, bold=True)
    draw.text((40, 40), 'MyRashifal+', fill=GOLD_LIGHT, font=f_brand)
    f_tag = get_font(14)
    draw.text((40, 68), 'Vedic Astrology & Kundli', fill=TEXT_SEC, font=f_tag)

    # Zodiac grid (4x3) with proper symbol font
    f_sym = get_symbol_font(34)
    symbols = list('\u2648\u2649\u264A\u264B\u264C\u264D\u264E\u264F\u2650\u2651\u2652\u2653')
    names = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
    f_name = get_font(13)
    grid_x, grid_y = 80, 140
    cell_w, cell_h = 230, 165
    cols = 4
    for i, (sym, name) in enumerate(zip(symbols, names)):
        col = i % cols
        row = i // cols
        cx = grid_x + col * cell_w + cell_w // 2
        cy = grid_y + row * cell_h + cell_h // 2 - 10

        # Card bg
        draw_rounded_rect(draw,
            (grid_x + col*cell_w + 10, grid_y + row*cell_h + 10,
             grid_x + col*cell_w + cell_w - 10, grid_y + row*cell_h + cell_h - 10),
            12, (*BG_CARD, 200))

        # Border
        draw.rounded_rectangle(
            [grid_x + col*cell_w + 10, grid_y + row*cell_h + 10,
             grid_x + col*cell_w + cell_w - 10, grid_y + row*cell_h + cell_h - 10],
            radius=12, outline=(*GOLD, 25), width=1)

        # Symbol
        bbox = draw.textbbox((0,0), sym, font=f_sym)
        sw = bbox[2] - bbox[0]
        draw.text((cx - sw//2, cy - 28), sym, fill=GOLD_LIGHT, font=f_sym)

        # Name
        bbox = draw.textbbox((0,0), name, font=f_name)
        nw = bbox[2] - bbox[0]
        draw.text((cx - nw//2, cy + 22), name, fill=TEXT_SEC, font=f_name)

    # Bottom text
    f_head = get_font(42, bold=True)
    head = "Today's Rashifal"
    x = text_center_x(draw, head, f_head, W)
    draw.text((x, H - 265), head, fill=WHITE, font=f_head)

    f_sub = get_font(22)
    sub = 'Personalized daily predictions for your Rashi'
    x = text_center_x(draw, sub, f_sub, W)
    draw.text((x, H - 210), sub, fill=TEXT_SEC, font=f_sub)

    # CTA
    f_cta = get_font(24, bold=True)
    cta = 'Check Your Rashifal Free >'
    bbox = draw.textbbox((0,0), cta, font=f_cta)
    cw = bbox[2] - bbox[0] + 56
    cx = (W - cw) // 2
    cy = H - 150
    draw_rounded_rect(draw, (cx, cy, cx+cw, cy+52), 14, GOLD)
    draw.text((cx + 28, cy + 12), cta, fill=BG, font=f_cta)

    f_url = get_font(17)
    url = 'myrashifal.in/rashifal'
    x = text_center_x(draw, url, f_url, W)
    draw.text((x, H - 70), url, fill=TEXT_SEC, font=f_url)

    return img.convert('RGB')


# ============================================================
# AD 3: Kundli Matching - Feed (1080x1080)
# ============================================================
def ad3_feed():
    W, H = 1080, 1080
    img = Image.new('RGBA', (W, H), (*BG, 255))
    draw = ImageDraw.Draw(img, 'RGBA')

    draw_stars(draw, W, H, 50)
    img = draw_soft_glow(img, (W//2, 340), 280, GOLD, 14)
    draw = ImageDraw.Draw(img, 'RGBA')

    # Brand
    f_brand = get_font(22, bold=True)
    draw.text((40, 40), 'MyRashifal+', fill=GOLD_LIGHT, font=f_brand)

    # Score circle — cleaner ring
    cx, cy = W//2, 330
    r = 115
    # Background ring
    draw.arc([cx-r, cy-r, cx+r, cy+r], 0, 360, fill=(*TEXT_SEC, 30), width=8)
    # Filled arc (30/36 = 300 degrees)
    draw.arc([cx-r, cy-r, cx+r, cy+r], -90, -90 + 300, fill=GOLD_LIGHT, width=8)

    # Score text
    f_score = get_font(58, bold=True)
    score = '30/36'
    x = text_center_x(draw, score, f_score, W)
    draw.text((x, cy - 36), score, fill=GOLD_LIGHT, font=f_score)

    f_label = get_font(18)
    label = 'Gun Milan Score'
    x = text_center_x(draw, label, f_label, W)
    draw.text((x, cy + 30), label, fill=TEXT_SEC, font=f_label)

    # Headline
    f_head = get_font(50, bold=True)
    lines = ['Kundli Matching', 'Before You Say Yes']
    y = 510
    for line in lines:
        x = text_center_x(draw, line, f_head, W)
        draw.text((x, y), line, fill=WHITE, font=f_head)
        y += 62

    # Features
    f_feat = get_font(20)
    features = [
        'Ashtakoot Gun Milan  |  36 Points System',
        'Manglik Check  |  Compatibility Report'
    ]
    fy = 670
    for feat in features:
        x = text_center_x(draw, feat, f_feat, W)
        draw.text((x, fy), feat, fill=TEXT_SEC, font=f_feat)
        fy += 34

    # CTA
    f_cta = get_font(26, bold=True)
    cta = 'Check Compatibility >'
    bbox = draw.textbbox((0,0), cta, font=f_cta)
    cw = bbox[2] - bbox[0] + 60
    cx_btn = (W - cw) // 2
    cy_btn = H - 220
    draw_rounded_rect(draw, (cx_btn, cy_btn, cx_btn+cw, cy_btn+56), 14, GOLD)
    draw.text((cx_btn + 30, cy_btn + 13), cta, fill=BG, font=f_cta)

    # Price
    f_price = get_font(17, bold=True)
    price_text = 'Starting at Rs.79'
    x = text_center_x(draw, price_text, f_price, W)
    draw_rounded_rect(draw, (x-12, cy_btn+72, x + draw.textbbox((0,0), price_text, font=f_price)[2] - draw.textbbox((0,0), price_text, font=f_price)[0] + 12, cy_btn+100), 8, (*BG_CARD, 220))
    draw.text((x, cy_btn+75), price_text, fill=GOLD_LIGHT, font=f_price)

    f_url = get_font(17)
    x = text_center_x(draw, 'myrashifal.in', f_url, W)
    draw.text((x, H - 60), 'myrashifal.in', fill=TEXT_SEC, font=f_url)

    # Hindi
    f_hi = get_hindi_font(20)
    hi = '\u0915\u0941\u0902\u0921\u0932\u0940 \u092e\u093f\u0932\u093e\u0928 \u2014 \u0936\u093e\u0926\u0940 \u0938\u0947 \u092a\u0939\u0932\u0947 \u091c\u093e\u0928\u0947\u0902'
    x = text_center_x(draw, hi, f_hi, W)
    draw.text((x, H - 100), hi, fill=(*TEXT_SEC, 140), font=f_hi)

    return img.convert('RGB')


# ============================================================
# AD 4: Career Report - Feed (1080x1080)
# ============================================================
def ad4_feed():
    W, H = 1080, 1080
    img = Image.new('RGBA', (W, H), (*BG, 255))
    draw = ImageDraw.Draw(img, 'RGBA')

    draw_stars(draw, W, H, 45)
    img = draw_soft_glow(img, (W//2, 300), 300, GOLD, 12)
    draw = ImageDraw.Draw(img, 'RGBA')

    # Brand
    f_brand = get_font(22, bold=True)
    draw.text((40, 40), 'MyRashifal+', fill=GOLD_LIGHT, font=f_brand)

    # Premium badge
    f_badge = get_font(13, bold=True)
    badge = 'PREMIUM REPORT'
    bbox = draw.textbbox((0,0), badge, font=f_badge)
    bw = bbox[2] - bbox[0] + 24
    bx = W - bw - 40
    draw_rounded_rect(draw, (bx, 42, bx+bw, 66), 8, (*GOLD, 40))
    draw.text((bx + 12, 47), badge, fill=GOLD_LIGHT, font=f_badge)

    # Bar chart (cleaner)
    bars_data = [
        (240, 460, 38),
        (295, 400, 38),
        (350, 350, 38),
        (405, 290, 38),
        (460, 230, 38),
    ]
    base_y = 470
    for bx, by, bw in bars_data:
        draw_rounded_rect(draw, (bx, by, bx+bw, base_y), 6, (*GOLD, 90))

    # Upward arrow
    arrow_x = 520
    draw.line([(arrow_x, base_y), (arrow_x, 200)], fill=(*GOLD_LIGHT, 80), width=2)
    draw.polygon([(arrow_x-7, 210), (arrow_x, 195), (arrow_x+7, 210)], fill=(*GOLD_LIGHT, 80))

    # Planet labels
    f_planet = get_font(22)
    planets = ['Sun - 10H', 'Jupiter - 9H', 'Saturn - 7H', 'Mercury - 2H']
    py = 230
    for p in planets:
        draw.text((580, py), p, fill=(*TEXT_SEC, 100), font=f_planet)
        py += 50

    # Headline
    f_head = get_font(48, bold=True)
    lines = ['Career & Wealth', 'Report']
    y = 530
    for line in lines:
        x = text_center_x(draw, line, f_head, W)
        draw.text((x, y), line, fill=WHITE, font=f_head)
        y += 60

    # Sub
    f_sub = get_font(20)
    sub_lines = [
        'Based on your 10th House & Dashamsa Chart',
        'Personalized career guidance from your birth chart'
    ]
    sy = 680
    for s in sub_lines:
        x = text_center_x(draw, s, f_sub, W)
        draw.text((x, sy), s, fill=TEXT_SEC, font=f_sub)
        sy += 32

    # CTA
    f_cta = get_font(26, bold=True)
    cta = 'Get Your Report  -  Rs.49'
    bbox = draw.textbbox((0,0), cta, font=f_cta)
    cw = bbox[2] - bbox[0] + 60
    cx = (W - cw) // 2
    cy = H - 210
    draw_rounded_rect(draw, (cx, cy, cx+cw, cy+56), 14, GOLD)
    draw.text((cx + 30, cy + 13), cta, fill=BG, font=f_cta)

    f_url = get_font(17)
    x = text_center_x(draw, 'myrashifal.in/reports', f_url, W)
    draw.text((x, H - 120), 'myrashifal.in/reports', fill=TEXT_SEC, font=f_url)

    # Hindi
    f_hi = get_hindi_font(20)
    hi = '\u0915\u0930\u093f\u092f\u0930 \u0930\u093f\u092a\u094b\u0930\u094d\u091f \u2014 \u0905\u092a\u0928\u0940 \u0915\u0941\u0902\u0921\u0932\u0940 \u0938\u0947 \u091c\u093e\u0928\u0947\u0902'
    x = text_center_x(draw, hi, f_hi, W)
    draw.text((x, H - 75), hi, fill=(*TEXT_SEC, 140), font=f_hi)

    return img.convert('RGB')


# ============================================================
# AD 5: App Coming Soon - Feed (1080x1080)
# ============================================================
def ad5_feed():
    W, H = 1080, 1080
    img = Image.new('RGBA', (W, H), (*BG, 255))
    draw = ImageDraw.Draw(img, 'RGBA')

    draw_stars(draw, W, H, 60)
    img = draw_soft_glow(img, (W//2, H//2 - 50), 300, GOLD, 14)
    draw = ImageDraw.Draw(img, 'RGBA')

    # Brand
    f_brand = get_font(22, bold=True)
    draw.text((40, 40), 'MyRashifal+', fill=GOLD_LIGHT, font=f_brand)

    # Phone mockup (cleaner design)
    phone_x = W//2 - 95
    phone_y = 110
    phone_w, phone_h = 190, 360
    r = 22
    # Phone body
    draw_rounded_rect(draw, (phone_x, phone_y, phone_x+phone_w, phone_y+phone_h), r, (20, 25, 50))
    # Border
    draw.rounded_rectangle(
        [phone_x, phone_y, phone_x+phone_w, phone_y+phone_h],
        radius=r, outline=(*GOLD, 30), width=1)
    # Screen
    draw_rounded_rect(draw, (phone_x+6, phone_y+35, phone_x+phone_w-6, phone_y+phone_h-16), 16, (10, 14, 32))
    # Notch
    draw_rounded_rect(draw, (phone_x+55, phone_y+5, phone_x+135, phone_y+22), 8, (10, 14, 32))

    # App icon in phone
    icon = load_app_icon(65)
    if icon:
        img.paste(icon, (phone_x + phone_w//2 - 32, phone_y + 100), icon)
        draw = ImageDraw.Draw(img, 'RGBA')

    f_app = get_font(14, bold=True)
    app_name = 'MyRashifal+'
    bbox = draw.textbbox((0,0), app_name, font=f_app)
    aw = bbox[2] - bbox[0]
    draw.text((phone_x + phone_w//2 - aw//2, phone_y + 178), app_name, fill=GOLD_LIGHT, font=f_app)

    # Stars text
    f_star = get_font(14, bold=True)
    stars = '* * * * *'
    bbox = draw.textbbox((0,0), stars, font=f_star)
    sw = bbox[2] - bbox[0]
    draw.text((phone_x + phone_w//2 - sw//2, phone_y + 198), stars, fill=GOLD, font=f_star)

    # COMING SOON badge
    f_coming = get_font(22, bold=True)
    badge = 'COMING SOON'
    bbox = draw.textbbox((0,0), badge, font=f_coming)
    bw = bbox[2] - bbox[0] + 36
    bx = (W - bw) // 2
    by = 510
    draw_rounded_rect(draw, (bx, by, bx+bw, by+38), 10, (*GREEN, 50))
    draw.text((bx + 18, by + 6), badge, fill=GREEN, font=f_coming)

    # Headline
    f_head = get_font(50, bold=True)
    lines = ['MyRashifal+', 'Android App']
    y = 580
    for line in lines:
        x = text_center_x(draw, line, f_head, W)
        draw.text((x, y), line, fill=WHITE, font=f_head)
        y += 62

    # Google Play label
    f_play = get_font(18)
    play_text = 'Coming to Google Play'
    bbox = draw.textbbox((0,0), play_text, font=f_play)
    pw = bbox[2] - bbox[0] + 32
    px = (W - pw) // 2
    py = 730
    draw_rounded_rect(draw, (px, py, px+pw, py+34), 10, (*BG_CARD, 200))
    draw.text((px + 16, py + 6), play_text, fill=TEXT, font=f_play)

    # CTA
    f_cta = get_font(24, bold=True)
    cta = 'Get Notified on Launch >'
    bbox = draw.textbbox((0,0), cta, font=f_cta)
    cw = bbox[2] - bbox[0] + 56
    cx = (W - cw) // 2
    cy = H - 210
    draw_rounded_rect(draw, (cx, cy, cx+cw, cy+52), 14, GOLD)
    draw.text((cx + 28, cy + 12), cta, fill=BG, font=f_cta)

    f_url = get_font(17)
    x = text_center_x(draw, 'myrashifal.in/download', f_url, W)
    draw.text((x, H - 125), 'myrashifal.in/download', fill=TEXT_SEC, font=f_url)

    # Hindi
    f_hi = get_hindi_font(20)
    hi = '\u0910\u092a \u091c\u0932\u094d\u0926 \u0906 \u0930\u0939\u093e \u0939\u0948 \u2014 \u0928\u094b\u091f\u093f\u092b\u093e\u0908 \u0939\u094b\u0902!'
    x = text_center_x(draw, hi, f_hi, W)
    draw.text((x, H - 80), hi, fill=(*TEXT_SEC, 140), font=f_hi)

    return img.convert('RGB')


# ============================================================
# Generate all ads
# ============================================================
if __name__ == '__main__':
    out = SCRIPT_DIR
    print('Generating ads...')

    ads = [
        ('ad1_free_kundli_feed_1080x1080.png', ad1_feed),
        ('ad1_free_kundli_story_1080x1920.png', ad1_story),
        ('ad2_daily_rashifal_feed_1080x1080.png', ad2_feed),
        ('ad3_kundli_matching_feed_1080x1080.png', ad3_feed),
        ('ad4_career_report_feed_1080x1080.png', ad4_feed),
        ('ad5_app_coming_soon_feed_1080x1080.png', ad5_feed),
    ]

    for filename, func in ads:
        print(f'  Creating {filename}...')
        img = func()
        img.save(os.path.join(out, filename), 'PNG', quality=95)
        print(f'  [OK] {filename} saved')

    print(f'\nAll {len(ads)} ads saved to: {out}/')
    print('Upload these directly to Instagram!')
