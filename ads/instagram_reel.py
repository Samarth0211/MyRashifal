"""
Generate an Instagram Reels video (1080x1920, ~30s) for MyRashifal+
Run:  python ads/instagram_reel.py
Output: ads/output/myrashifal_reel.mp4
"""
from PIL import Image, ImageDraw, ImageFont
from moviepy import ImageClip, concatenate_videoclips, CompositeVideoClip, vfx
import math
import os
import random
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, 'output')

# ── Brand colors ──
BG = (6, 9, 24)
BG_CARD = (15, 20, 50)
GOLD = (201, 149, 26)
GOLD_LIGHT = (232, 191, 75)
TEXT = (234, 237, 243)
TEXT_SEC = (160, 166, 188)
WHITE = (255, 255, 255)
GREEN = (34, 197, 94)
RED_ACCENT = (239, 68, 68)

W, H = 1080, 1920
FPS = 30


# ── Font helpers ──
def get_font(size, bold=False):
    names = [
        'C:/Windows/Fonts/segoeuib.ttf' if bold else 'C:/Windows/Fonts/segoeui.ttf',
        'C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf',
    ]
    for n in names:
        try:
            return ImageFont.truetype(n, size)
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


def text_w(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0]


# ── Background helpers ──
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


def draw_stars(draw, w, h, count=100, seed=42):
    random.seed(seed)
    for _ in range(count):
        x = random.randint(0, w)
        y = random.randint(0, h)
        s = random.choice([1, 1, 2])
        a = random.randint(30, 100)
        draw.ellipse([x, y, x+s, y+s], fill=(255, 255, 255, a))


def draw_zodiac_ring(img, cx, cy, radius, symbol_size=28):
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


def make_base_frame(glow_cy=H//2):
    """Create a base frame with stars and glow."""
    img = Image.new('RGBA', (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_stars(draw, W, H, 100)
    img = draw_soft_glow(img, (W//2, glow_cy), 400, GOLD, max_alpha=14)
    return img


def draw_badge(draw, text, x, y, color=GREEN, font=None):
    """Draw a small pill badge."""
    if font is None:
        font = get_font(18, bold=True)
    tw = text_w(draw, text, font)
    pad_x, pad_y = 18, 8
    draw.rounded_rectangle(
        [x, y, x + tw + pad_x*2, y + 30 + pad_y],
        radius=18,
        fill=(*color, 40)
    )
    draw.rounded_rectangle(
        [x, y, x + tw + pad_x*2, y + 30 + pad_y],
        radius=18,
        outline=(*color, 100),
        width=1
    )
    draw.text((x + pad_x, y + pad_y - 2), text, font=font, fill=(*color, 230))


def draw_phone_frame(img, cx, cy, pw=600, ph=420):
    """Draw a stylized phone mockup border."""
    draw = ImageDraw.Draw(img)
    x1, y1 = cx - pw//2, cy - ph//2
    x2, y2 = cx + pw//2, cy + ph//2
    # Outer glow
    for i in range(3):
        draw.rounded_rectangle(
            [x1 - 3 - i, y1 - 3 - i, x2 + 3 + i, y2 + 3 + i],
            radius=24 + i,
            outline=(*GOLD, 30 - i*8),
            width=1
        )
    # Phone border
    draw.rounded_rectangle(
        [x1, y1, x2, y2],
        radius=22,
        outline=(*WHITE, 50),
        width=2
    )
    # Inner dark fill
    draw.rounded_rectangle(
        [x1+2, y1+2, x2-2, y2-2],
        radius=20,
        fill=(*BG_CARD, 220)
    )
    return x1+2, y1+2, x2-2, y2-2


def draw_feature_card(draw, title, desc, x, y, cw=880, ch=80):
    """Draw a single feature card with gold accent bar."""
    draw.rounded_rectangle([x, y, x+cw, y+ch], radius=14, fill=(*BG_CARD, 200))
    draw.rounded_rectangle([x, y, x+5, y+ch], radius=2, fill=GOLD)
    draw.text((x+22, y+17), "\u2713", font=get_symbol_font(24), fill=GREEN)
    draw.text((x+56, y+14), title, font=get_font(22, bold=True), fill=WHITE)
    draw.text((x+56, y+44), desc, font=get_font(16), fill=TEXT_SEC)


# ════════════════════════════════════════
# SCENE GENERATORS — each returns a PIL Image (RGBA, 1080x1920)
# ════════════════════════════════════════

def scene_intro():
    """Scene 1: Brand intro with logo and zodiac ring."""
    img = make_base_frame(glow_cy=700)
    img = draw_zodiac_ring(img, W//2, 720, 320, symbol_size=32)
    draw = ImageDraw.Draw(img)

    # Brand
    y = 480
    brand = get_font(48, bold=True)
    bx = text_cx(draw, "MyRashifal+", brand, W)
    draw.text((bx, y), "MyRashifal+", font=brand, fill=GOLD_LIGHT)

    # Tagline
    y += 70
    tag = get_font(22)
    tag_text = "Vedic Astrology Powered by"
    tx = text_cx(draw, tag_text, tag, W)
    draw.text((tx, y), tag_text, font=tag, fill=TEXT_SEC)

    y += 36
    tag2 = "Real Astronomy"
    tx2 = text_cx(draw, tag2, get_font(26, bold=True), W)
    draw.text((tx2, y), tag2, font=get_font(26, bold=True), fill=WHITE)

    # Gold divider
    y += 60
    draw.line([(W//2-120, y), (W//2+120, y)], fill=(*GOLD, 80), width=1)

    # Subtitle in Hindi
    y += 40
    hi = get_hindi_font(26)
    hi_text = "सटीक वैदिक ज्योतिष"
    hx = text_cx(draw, hi_text, hi, W)
    draw.text((hx, y), hi_text, font=hi, fill=TEXT_SEC)

    # Bottom teaser
    y_bot = H - 250
    tease = get_font(20)
    tease_text = "See what's inside..."
    tx3 = text_cx(draw, tease_text, tease, W)
    draw.text((tx3, y_bot), tease_text, font=tease, fill=(*GOLD_LIGHT, 150))

    # Animated dots hint
    y_bot += 50
    for i in range(3):
        dx = W//2 - 20 + i * 20
        alpha = 80 + i * 40
        draw.ellipse([dx, y_bot, dx+8, y_bot+8], fill=(*GOLD_LIGHT, alpha))

    return img


def scene_free_kundli():
    """Scene 2: Free Kundli feature."""
    img = make_base_frame(glow_cy=650)
    draw = ImageDraw.Draw(img)

    # Title section
    y = 280
    draw.text((text_cx(draw, "FREE", get_font(24, bold=True), W), y),
              "FREE", font=get_font(24, bold=True), fill=GREEN)
    y += 50
    h1 = get_font(52, bold=True)
    t1 = "Janam Kundli"
    draw.text((text_cx(draw, t1, h1, W), y), t1, font=h1, fill=WHITE)
    y += 68
    t2 = "Birth Chart"
    draw.text((text_cx(draw, t2, h1, W), y), t2, font=h1, fill=GOLD_LIGHT)

    # Phone mockup area
    y += 100
    px1, py1, px2, py2 = draw_phone_frame(img, W//2, y + 200, pw=700, ph=380)
    draw = ImageDraw.Draw(img)

    # Inside phone: planet table mock
    inner_y = py1 + 20
    planets = [
        ("Sun ☉", "Leo 14°23'", "Magha"),
        ("Moon ☽", "Cancer 8°15'", "Pushya"),
        ("Mars ♂", "Aries 22°07'", "Bharani"),
        ("Jupiter ♃", "Sagittarius 5°42'", "Moola"),
        ("Venus ♀", "Libra 18°30'", "Swati"),
    ]

    col_font = get_font(15, bold=True)
    val_font = get_font(14)

    # Table header
    draw.text((px1+30, inner_y), "Planet", font=col_font, fill=GOLD_LIGHT)
    draw.text((px1+200, inner_y), "Position", font=col_font, fill=GOLD_LIGHT)
    draw.text((px1+430, inner_y), "Nakshatra", font=col_font, fill=GOLD_LIGHT)
    inner_y += 30
    draw.line([(px1+20, inner_y), (px2-20, inner_y)], fill=(*WHITE, 30), width=1)
    inner_y += 12

    for planet, pos, nak in planets:
        draw.text((px1+30, inner_y), planet, font=val_font, fill=TEXT)
        draw.text((px1+200, inner_y), pos, font=val_font, fill=TEXT_SEC)
        draw.text((px1+430, inner_y), nak, font=val_font, fill=TEXT_SEC)
        inner_y += 50

    # Feature bullets below phone
    y_feat = py2 + 60
    bullets = [
        "Real astronomical ephemeris data",
        "Lahiri Ayanamsa for sidereal accuracy",
        "Vimshottari Dasha periods included",
        "AI-powered personality analysis",
    ]
    bullet_font = get_font(20)
    for bullet in bullets:
        bt = f"  ✦  {bullet}"
        bx = text_cx(draw, bt, bullet_font, W)
        draw.text((bx, y_feat), bt, font=bullet_font, fill=TEXT_SEC)
        y_feat += 40

    return img


def scene_daily_rashifal():
    """Scene 3: Daily Rashifal for 12 signs."""
    img = make_base_frame(glow_cy=600)
    draw = ImageDraw.Draw(img)

    # Title
    y = 300
    h1 = get_font(50, bold=True)
    t1 = "Daily Rashifal"
    draw.text((text_cx(draw, t1, h1, W), y), t1, font=h1, fill=WHITE)
    y += 65
    t2 = "All 12 Zodiac Signs"
    draw.text((text_cx(draw, t2, h1, W), y), t2, font=h1, fill=GOLD_LIGHT)

    # FREE badge
    y += 80
    badge_font = get_font(20, bold=True)
    badge_text = "FREE"
    bw = text_w(draw, badge_text, badge_font)
    badge_x = (W - bw - 40) // 2
    draw_badge(draw, badge_text, badge_x, y, GREEN, badge_font)

    # 12 zodiac signs in 4x3 grid
    y += 80
    signs = [
        ("♈", "Aries", "मेष"), ("♉", "Taurus", "वृषभ"), ("♊", "Gemini", "मिथुन"),
        ("♋", "Cancer", "कर्क"), ("♌", "Leo", "सिंह"), ("♍", "Virgo", "कन्या"),
        ("♎", "Libra", "तुला"), ("♏", "Scorpio", "वृश्चिक"), ("♐", "Sagittarius", "धनु"),
        ("♑", "Capricorn", "मकर"), ("♒", "Aquarius", "कुंभ"), ("♓", "Pisces", "मीन"),
    ]

    cols, rows = 4, 3
    cell_w, cell_h = 220, 200
    grid_w = cols * cell_w + (cols-1) * 20
    start_x = (W - grid_w) // 2
    sym_font = get_symbol_font(40)
    name_font = get_font(15, bold=True)
    hindi_font = get_hindi_font(13)

    for idx, (sym, name, hi_name) in enumerate(signs):
        col = idx % cols
        row = idx // cols
        cx = start_x + col * (cell_w + 20) + cell_w // 2
        cy = y + row * (cell_h + 12) + cell_h // 2

        # Card bg
        draw.rounded_rectangle(
            [cx - cell_w//2, cy - cell_h//2, cx + cell_w//2, cy + cell_h//2],
            radius=16,
            fill=(*BG_CARD, 180)
        )

        # Symbol
        sx = text_cx(draw, sym, sym_font, cell_w) + cx - cell_w//2
        draw.text((sx, cy - 50), sym, font=sym_font, fill=GOLD_LIGHT)

        # English name
        nx = text_cx(draw, name, name_font, cell_w) + cx - cell_w//2
        draw.text((nx, cy + 10), name, font=name_font, fill=WHITE)

        # Hindi name
        hx = text_cx(draw, hi_name, hindi_font, cell_w) + cx - cell_w//2
        draw.text((hx, cy + 32), hi_name, font=hindi_font, fill=TEXT_SEC)

    # Bottom text
    y_bot = y + rows * (cell_h + 12) + 50
    sub = get_font(20)
    sub_text = "Career • Love • Health • Finance"
    draw.text((text_cx(draw, sub_text, sub, W), y_bot), sub_text, font=sub, fill=TEXT_SEC)

    y_bot += 40
    sub2 = "Updated every morning at 7 AM"
    draw.text((text_cx(draw, sub2, sub, W), y_bot), sub2, font=sub, fill=(*GOLD_LIGHT, 150))

    return img


def scene_ask_astrologer():
    """Scene 4: Ask a Question feature."""
    img = make_base_frame(glow_cy=700)
    draw = ImageDraw.Draw(img)

    # Title
    y = 320
    h1 = get_font(50, bold=True)
    t1 = "Ask Any"
    draw.text((text_cx(draw, t1, h1, W), y), t1, font=h1, fill=WHITE)
    y += 65
    t2 = "Life Question"
    draw.text((text_cx(draw, t2, h1, W), y), t2, font=h1, fill=GOLD_LIGHT)

    # Badge
    y += 80
    draw_badge(draw, "First 5 FREE", (W - 180) // 2, y, GREEN)

    # Chat bubble mockup
    y += 90
    bubble_w = 800
    bx = (W - bubble_w) // 2

    # User question bubble (right-aligned)
    q_text = "Will I get promoted this year?"
    q_font = get_font(20)
    qw = text_w(draw, q_text, q_font) + 50
    qx = bx + bubble_w - qw - 20
    draw.rounded_rectangle(
        [qx, y, qx + qw, y + 52],
        radius=20,
        fill=(*GOLD, 60)
    )
    draw.text((qx + 25, y + 14), q_text, font=q_font, fill=WHITE)

    # AI answer bubble (left-aligned)
    y += 80
    a_lines = [
        "Based on your Kundli, Jupiter transits",
        "your 10th house from March 2026.",
        "Strong chances of career growth!",
    ]
    a_font = get_font(18)
    a_h = len(a_lines) * 32 + 30
    draw.rounded_rectangle(
        [bx + 20, y, bx + 650, y + a_h],
        radius=20,
        fill=(*BG_CARD, 220)
    )
    # Gold left accent on answer
    draw.rounded_rectangle([bx + 20, y, bx + 25, y + a_h], radius=2, fill=GOLD)

    ay = y + 15
    for line in a_lines:
        draw.text((bx + 45, ay), line, font=a_font, fill=TEXT)
        ay += 32

    # More example questions
    y += a_h + 60
    examples = [
        "\"Should I change my job?\"",
        "\"Is this a good year to buy property?\"",
        "\"How will my finances be this year?\"",
    ]
    ex_font = get_font(19)
    for ex in examples:
        ex_x = text_cx(draw, ex, ex_font, W)
        draw.text((ex_x, y), ex, font=ex_font, fill=(*TEXT_SEC, 180))
        y += 42

    # Bottom info
    y += 40
    info_font = get_font(20)
    info = "Answers based on YOUR birth chart"
    draw.text((text_cx(draw, info, info_font, W), y), info, font=info_font, fill=GOLD_LIGHT)

    y += 35
    info2 = "Then just ₹29 per question"
    draw.text((text_cx(draw, info2, get_font(18), W), y), info2, font=get_font(18), fill=TEXT_SEC)

    return img


def scene_matching():
    """Scene 5: Kundli Matching / Gun Milan."""
    img = make_base_frame(glow_cy=650)
    draw = ImageDraw.Draw(img)

    # Title
    y = 320
    h1 = get_font(50, bold=True)
    draw.text((text_cx(draw, "Kundli Matching", h1, W), y), "Kundli Matching", font=h1, fill=WHITE)
    y += 65
    draw.text((text_cx(draw, "Gun Milan", h1, W), y), "Gun Milan", font=h1, fill=GOLD_LIGHT)

    # Hearts + compatibility visual
    y += 100
    heart_font = get_symbol_font(80)
    hx = text_cx(draw, "♥", heart_font, W)
    draw.text((hx, y), "♥", font=heart_font, fill=(*RED_ACCENT, 200))

    # Score circle
    y += 120
    score_font = get_font(60, bold=True)
    score = "32/36"
    sx = text_cx(draw, score, score_font, W)
    # Circle behind score
    draw.ellipse([W//2-80, y-10, W//2+80, y+100], outline=(*GOLD, 120), width=3)
    draw.text((sx, y + 10), score, font=score_font, fill=GOLD_LIGHT)

    # Label
    y += 120
    label = "Ashtakoot Points"
    draw.text((text_cx(draw, label, get_font(22), W), y), label, font=get_font(22), fill=TEXT_SEC)

    # Feature list
    y += 80
    features = [
        "8 Kuta detailed analysis",
        "Manglik Dosha checking",
        "Compatibility scores",
        "Remedies & recommendations",
    ]
    f_font = get_font(22)
    for feat in features:
        ft = f"  ✦  {feat}"
        fx = text_cx(draw, ft, f_font, W)
        draw.text((fx, y), ft, font=f_font, fill=TEXT_SEC)
        y += 48

    # Price
    y += 40
    price_font = get_font(24, bold=True)
    draw.text((text_cx(draw, "Just ₹79", price_font, W), y),
              "Just ₹79", font=price_font, fill=GOLD_LIGHT)

    return img


def scene_reports():
    """Scene 6: Premium Reports."""
    img = make_base_frame(glow_cy=600)
    draw = ImageDraw.Draw(img)

    # Title
    y = 280
    h1 = get_font(50, bold=True)
    draw.text((text_cx(draw, "Premium Reports", h1, W), y),
              "Premium Reports", font=h1, fill=WHITE)
    y += 65
    sub = "Detailed AI-Powered Analysis"
    draw.text((text_cx(draw, sub, get_font(24), W), y),
              sub, font=get_font(24), fill=GOLD_LIGHT)

    # Report cards
    y += 90
    reports = [
        ("Career & Wealth", "₹49", "💼"),
        ("Marriage & Love", "₹79", "💕"),
        ("Health & Wellness", "₹49", "🏥"),
        ("Annual Varshphal", "₹149", "📅"),
        ("Education & Exam", "₹49", "📚"),
    ]

    card_w = 850
    card_h = 85
    gap = 16
    start_x = (W - card_w) // 2

    for i, (name, price, emoji) in enumerate(reports):
        cx = start_x
        cy = y + i * (card_h + gap)

        draw.rounded_rectangle([cx, cy, cx+card_w, cy+card_h], radius=14, fill=(*BG_CARD, 200))
        draw.rounded_rectangle([cx, cy, cx+5, cy+card_h], radius=2, fill=GOLD)

        # Emoji
        draw.text((cx + 22, cy + 22), emoji, font=get_font(28), fill=WHITE)

        # Name
        draw.text((cx + 65, cy + 18), name, font=get_font(22, bold=True), fill=WHITE)
        draw.text((cx + 65, cy + 48), "Personalized report from your Kundli", font=get_font(14), fill=TEXT_SEC)

        # Price
        price_font = get_font(22, bold=True)
        pw = text_w(draw, price, price_font)
        draw.text((cx + card_w - pw - 30, cy + 28), price, font=price_font, fill=GOLD_LIGHT)

    # Bundle deal
    y_bundle = y + len(reports) * (card_h + gap) + 40
    bundle_w = 700
    bx = (W - bundle_w) // 2
    draw.rounded_rectangle(
        [bx, y_bundle, bx + bundle_w, y_bundle + 80],
        radius=16,
        fill=(*GOLD, 30)
    )
    draw.rounded_rectangle(
        [bx, y_bundle, bx + bundle_w, y_bundle + 80],
        radius=16,
        outline=(*GOLD, 100),
        width=1
    )
    bundle_font = get_font(22, bold=True)
    bt = "Complete Life Bundle — ₹299"
    draw.text((text_cx(draw, bt, bundle_font, W), y_bundle + 14), bt, font=bundle_font, fill=GOLD_LIGHT)
    strike = get_font(16)
    st = "(Save ₹167 — was ₹466)"
    draw.text((text_cx(draw, st, strike, W), y_bundle + 48), st, font=strike, fill=TEXT_SEC)

    return img


def scene_muhurat():
    """Scene 7: Shubh Muhurat."""
    img = make_base_frame(glow_cy=700)
    draw = ImageDraw.Draw(img)

    # Title
    y = 350
    h1 = get_font(50, bold=True)
    draw.text((text_cx(draw, "Shubh Muhurat", h1, W), y), "Shubh Muhurat", font=h1, fill=WHITE)
    y += 65
    draw.text((text_cx(draw, "Auspicious Dates", h1, W), y), "Auspicious Dates", font=h1, fill=GOLD_LIGHT)

    # Hindi
    y += 70
    hi = get_hindi_font(28)
    hi_text = "शुभ मुहूर्त खोजें"
    draw.text((text_cx(draw, hi_text, hi, W), y), hi_text, font=hi, fill=TEXT_SEC)

    # Event types in 2x5 grid
    y += 90
    events = [
        "🕉️ Marriage", "🏠 Griha Pravesh",
        "💼 Business", "🚗 Vehicle Purchase",
        "👶 Mundan", "📝 Naming Ceremony",
        "🏗️ Property", "✈️ Travel",
        "💰 Gold Purchase", "📚 Education",
    ]

    cols = 2
    cell_w = 440
    cell_h = 60
    gap_x, gap_y = 30, 16
    grid_w = cols * cell_w + (cols-1) * gap_x
    start_x = (W - grid_w) // 2

    ev_font = get_font(20)
    for idx, ev in enumerate(events):
        col = idx % cols
        row = idx // cols
        ex = start_x + col * (cell_w + gap_x)
        ey = y + row * (cell_h + gap_y)
        draw.rounded_rectangle([ex, ey, ex+cell_w, ey+cell_h], radius=12, fill=(*BG_CARD, 180))
        draw.text((ex + 18, ey + 16), ev, font=ev_font, fill=TEXT)

    # Bottom price
    y_bot = y + 5 * (cell_h + gap_y) + 50
    price_font = get_font(24, bold=True)
    draw.text((text_cx(draw, "Just ₹29", price_font, W), y_bot),
              "Just ₹29", font=price_font, fill=GOLD_LIGHT)

    return img


def scene_multilang():
    """Scene 8: Multi-language support."""
    img = make_base_frame(glow_cy=700)
    img = draw_zodiac_ring(img, W//2, 700, 280, symbol_size=24)
    draw = ImageDraw.Draw(img)

    # Title
    y = 380
    h1 = get_font(48, bold=True)
    draw.text((text_cx(draw, "Available in", h1, W), y), "Available in", font=h1, fill=WHITE)
    y += 62
    draw.text((text_cx(draw, "3 Languages", h1, W), y), "3 Languages", font=h1, fill=GOLD_LIGHT)

    # Language cards — large and prominent
    y += 120
    langs = [
        ("English", "Complete Vedic astrology in English", get_font(36, bold=True), get_font(18)),
        ("हिन्दी", "संपूर्ण वैदिक ज्योतिष हिंदी में", get_hindi_font(36, bold=True), get_hindi_font(18)),
        ("मराठी", "संपूर्ण वैदिक ज्योतिष मराठीत", get_hindi_font(36, bold=True), get_hindi_font(18)),
    ]

    card_w = 800
    card_h = 120
    gap = 30
    start_x = (W - card_w) // 2

    for i, (name, desc, nf, df) in enumerate(langs):
        cy = y + i * (card_h + gap)
        draw.rounded_rectangle(
            [start_x, cy, start_x + card_w, cy + card_h],
            radius=18,
            fill=(*BG_CARD, 200)
        )
        draw.rounded_rectangle(
            [start_x, cy, start_x + 6, cy + card_h],
            radius=3,
            fill=GOLD
        )
        draw.text((start_x + 35, cy + 18), name, font=nf, fill=GOLD_LIGHT)
        draw.text((start_x + 35, cy + 70), desc, font=df, fill=TEXT_SEC)

    # Bottom text
    y_bot = y + 3 * (card_h + gap) + 40
    bot = get_font(20)
    bot_text = "Switch anytime from the menu"
    draw.text((text_cx(draw, bot_text, bot, W), y_bot), bot_text, font=bot, fill=TEXT_SEC)

    return img


def scene_cta():
    """Scene 9: Final CTA."""
    img = make_base_frame(glow_cy=700)
    img = draw_soft_glow(img, (W//2, 800), 350, GOLD, max_alpha=18)
    img = draw_zodiac_ring(img, W//2, 800, 360, symbol_size=30)
    draw = ImageDraw.Draw(img)

    # Main CTA
    y = 520
    h1 = get_font(56, bold=True)
    draw.text((text_cx(draw, "Try Free", h1, W), y), "Try Free", font=h1, fill=WHITE)
    y += 72
    draw.text((text_cx(draw, "Now!", h1, W), y), "Now!", font=h1, fill=GOLD_LIGHT)

    # CTA button
    y += 120
    btn_w = 500
    btn_h = 72
    btn_x = (W - btn_w) // 2
    draw.rounded_rectangle(
        [btn_x, y, btn_x + btn_w, y + btn_h],
        radius=36,
        fill=GOLD
    )
    cta_font = get_font(28, bold=True)
    cta_text = "myrashifal.in"
    ctx = text_cx(draw, cta_text, cta_font, W)
    draw.text((ctx, y + 18), cta_text, font=cta_font, fill=BG)

    # Sub text
    y += btn_h + 40
    sub = get_font(22)
    sub_text = "No app download needed"
    draw.text((text_cx(draw, sub_text, sub, W), y), sub_text, font=sub, fill=TEXT_SEC)

    y += 40
    sub2 = "Works on any device"
    draw.text((text_cx(draw, sub2, sub, W), y), sub2, font=sub, fill=TEXT_SEC)

    # Features recap
    y += 80
    recap = [
        "✓ Free Kundli", "✓ Daily Rashifal", "✓ Ask 5 Free Questions",
        "✓ Kundli Matching", "✓ Premium Reports", "✓ 3 Languages",
    ]
    recap_font = get_font(20)
    col_w = 400
    start_x = (W - col_w * 2) // 2
    for idx, item in enumerate(recap):
        col = idx % 2
        row = idx // 2
        rx = start_x + col * col_w
        ry = y + row * 42
        draw.text((rx, ry), item, font=recap_font, fill=(*TEXT, 200))

    # Language badges at very bottom
    y_bot = H - 150
    lang_font = get_font(18, bold=True)
    badges = ["English", "हिंदी", "मराठी"]
    badge_w = 130
    total_w = len(badges) * badge_w + (len(badges)-1) * 16
    bx_start = (W - total_w) // 2
    for j, badge in enumerate(badges):
        bx = bx_start + j * (badge_w + 16)
        draw.rounded_rectangle([bx, y_bot, bx+badge_w, y_bot+42], radius=21, fill=(255,255,255,15))
        bf = get_hindi_font(18, bold=True) if j > 0 else lang_font
        bbox = draw.textbbox((0, 0), badge, font=bf)
        tw = bbox[2] - bbox[0]
        draw.text((bx + (badge_w - tw)//2, y_bot + 9), badge, font=bf, fill=GOLD_LIGHT)

    # Bottom tagline
    y_final = H - 80
    final_font = get_font(16)
    final_text = "MyRashifal+ — Vedic Astrology Powered by Real Astronomy"
    draw.text((text_cx(draw, final_text, final_font, W), y_final), final_text, font=final_font, fill=(*TEXT_SEC, 140))

    return img


# ════════════════════════════════════════
# VIDEO ASSEMBLY
# ════════════════════════════════════════

def pil_to_np(img):
    """Convert RGBA PIL Image to RGB numpy array."""
    return np.array(img.convert('RGB'))


def build_video():
    print("Generating scenes...")
    scenes = [
        ("Intro",           scene_intro,           3.5),
        ("Free Kundli",     scene_free_kundli,     3.5),
        ("Daily Rashifal",  scene_daily_rashifal,  3.5),
        ("Ask Astrologer",  scene_ask_astrologer,  3.5),
        ("Kundli Matching", scene_matching,        3.0),
        ("Premium Reports", scene_reports,         3.5),
        ("Shubh Muhurat",   scene_muhurat,         3.0),
        ("Multi-Language",  scene_multilang,        3.0),
        ("CTA",             scene_cta,             4.0),
    ]

    clips = []
    for name, gen_func, duration in scenes:
        print(f"  Rendering: {name}...")
        img = gen_func()
        frame = pil_to_np(img)
        clip = ImageClip(frame, duration=duration)
        # Add crossfade in/out
        clip = clip.with_effects([
            vfx.CrossFadeIn(0.4),
            vfx.CrossFadeOut(0.4),
        ])
        clips.append(clip)

    print("Assembling video with crossfade transitions...")
    # Composite with overlap for smooth crossfade
    overlap = 0.4
    composed_clips = []
    t = 0
    for clip in clips:
        composed_clips.append(clip.with_start(t))
        t += clip.duration - overlap
    total_duration = t + overlap

    final = CompositeVideoClip(composed_clips, size=(W, H)).with_duration(total_duration)

    out_path = os.path.join(OUTPUT_DIR, 'myrashifal_reel.mp4')
    print(f"Writing video to {out_path}...")
    final.write_videofile(
        out_path,
        fps=FPS,
        codec='libx264',
        audio=False,
        preset='medium',
        threads=4,
    )
    print(f"\n[OK] Video saved: {out_path}")
    print(f"     Duration: ~{total_duration:.1f}s | Resolution: {W}x{H} | FPS: {FPS}")


if __name__ == '__main__':
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    build_video()
