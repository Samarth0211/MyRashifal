"""
Generate Instagram template images (1080x1080) for MyRashifal+ automation.
Uses PIL/Pillow. Run: python scripts/generate_instagram_templates.py

Brand colors: BG=#060918, Gold=#e8bf4b, Text=#eaedf3, Secondary=#8a90a8
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import random
import math

# ── Config ──
SIZE = (1080, 1080)
BG = (6, 9, 24)
GOLD = (232, 191, 75)
GOLD_DARK = (201, 149, 26)
TEXT = (234, 237, 243)
SECONDARY = (138, 144, 168)
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'instagram')

# Zodiac data
RASHIS = [
    {'id': 'aries', 'en': 'Aries', 'hi': 'मेष', 'symbol': '♈'},
    {'id': 'taurus', 'en': 'Taurus', 'hi': 'वृषभ', 'symbol': '♉'},
    {'id': 'gemini', 'en': 'Gemini', 'hi': 'मिथुन', 'symbol': '♊'},
    {'id': 'cancer', 'en': 'Cancer', 'hi': 'कर्क', 'symbol': '♋'},
    {'id': 'leo', 'en': 'Leo', 'hi': 'सिंह', 'symbol': '♌'},
    {'id': 'virgo', 'en': 'Virgo', 'hi': 'कन्या', 'symbol': '♍'},
    {'id': 'libra', 'en': 'Libra', 'hi': 'तुला', 'symbol': '♎'},
    {'id': 'scorpio', 'en': 'Scorpio', 'hi': 'वृश्चिक', 'symbol': '♏'},
    {'id': 'sagittarius', 'en': 'Sagittarius', 'hi': 'धनु', 'symbol': '♐'},
    {'id': 'capricorn', 'en': 'Capricorn', 'hi': 'मकर', 'symbol': '♑'},
    {'id': 'aquarius', 'en': 'Aquarius', 'hi': 'कुम्भ', 'symbol': '♒'},
    {'id': 'pisces', 'en': 'Pisces', 'hi': 'मीन', 'symbol': '♓'},
]

TIP_TEMPLATES = [
    {'id': 'tip-moon-sign', 'title': 'Your Moon Sign\nMatters More!', 'subtitle': 'Vedic Astrology Fact'},
    {'id': 'tip-nakshatra', 'title': '27 Nakshatras', 'subtitle': 'Discover Your Star'},
    {'id': 'tip-dasha', 'title': 'What is\nMahadasha?', 'subtitle': 'Life Phase Secrets'},
    {'id': 'tip-panchang', 'title': "Aaj Ka\nPanchang", 'subtitle': 'Daily Cosmic Guide'},
    {'id': 'tip-retrograde', 'title': 'Retrograde\nPlanets', 'subtitle': 'Truth vs Myths'},
    {'id': 'tip-houses', 'title': '12 Houses of\nKundli', 'subtitle': 'Career, Love & Money'},
    {'id': 'tip-manglik', 'title': 'Manglik Dosha', 'subtitle': 'Truth About Marriage'},
]

AD_TEMPLATES = [
    {'id': 'ad-free-kundli', 'title': 'Free Vedic\nKundli', 'subtitle': 'Get Yours in 30 Seconds', 'badge': 'FREE'},
    {'id': 'ad-matching', 'title': 'Kundli\nMatching', 'subtitle': 'Check Compatibility Now', 'badge': 'FREE'},
    {'id': 'ad-career-report', 'title': 'Career &\nWealth Report', 'subtitle': 'Know Your Destiny', 'badge': '₹49'},
    {'id': 'ad-daily-rashifal', 'title': 'Daily\nRashifal', 'subtitle': 'For All 12 Signs', 'badge': 'FREE'},
    {'id': 'ad-numerology', 'title': 'Numerology\nReport', 'subtitle': 'Unlock Your Numbers', 'badge': '₹49'},
]


def get_font(size, bold=False):
    """Try to load a good font, fallback gracefully."""
    candidates = [
        'C:/Windows/Fonts/segoeui.ttf' if not bold else 'C:/Windows/Fonts/segoeuib.ttf',
        'C:/Windows/Fonts/arial.ttf' if not bold else 'C:/Windows/Fonts/arialbd.ttf',
        'C:/Windows/Fonts/calibri.ttf',
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def get_hindi_font(size):
    """Load a font that supports Devanagari."""
    candidates = [
        'C:/Windows/Fonts/Nirmala.ttf',
        'C:/Windows/Fonts/mangal.ttf',
        'C:/Windows/Fonts/arial.ttf',
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def get_symbol_font(size):
    """Load a font that supports zodiac Unicode symbols."""
    candidates = [
        'C:/Windows/Fonts/seguisym.ttf',
        'C:/Windows/Fonts/segoeui.ttf',
        'C:/Windows/Fonts/arial.ttf',
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_stars(draw, count=40):
    """Draw random small stars."""
    for _ in range(count):
        x = random.randint(0, SIZE[0])
        y = random.randint(0, SIZE[1])
        r = random.randint(1, 3)
        alpha = random.randint(60, 200)
        color = (TEXT[0], TEXT[1], TEXT[2], alpha)
        draw.ellipse([x-r, y-r, x+r, y+r], fill=color)


def draw_glow(img, center, radius, color):
    """Draw a soft radial glow."""
    glow = Image.new('RGBA', SIZE, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for i in range(radius, 0, -2):
        alpha = int(40 * (i / radius))
        glow_draw.ellipse(
            [center[0]-i, center[1]-i, center[0]+i, center[1]+i],
            fill=(color[0], color[1], color[2], alpha)
        )
    img.paste(Image.alpha_composite(img, glow))


def draw_zodiac_ring(draw, center, radius, highlight_idx=None):
    """Draw 12 zodiac symbols in a circle."""
    symbols = [r['symbol'] for r in RASHIS]
    font = get_symbol_font(28)
    for i, sym in enumerate(symbols):
        angle = (i * 30 - 90) * math.pi / 180
        x = center[0] + radius * math.cos(angle)
        y = center[1] + radius * math.sin(angle)
        color = GOLD if i == highlight_idx else (SECONDARY[0], SECONDARY[1], SECONDARY[2], 120)
        draw.text((x - 14, y - 14), sym, fill=color, font=font)


def create_base_image():
    """Create base image with stars and subtle gradient."""
    img = Image.new('RGBA', SIZE, BG + (255,))
    draw = ImageDraw.Draw(img)
    draw_stars(draw, 50)
    return img, draw


def add_branding(draw, bottom=True):
    """Add MyRashifal+ branding."""
    font_brand = get_font(36, bold=True)
    font_url = get_font(24)
    # Top branding
    draw.text((SIZE[0]//2, 60), 'MyRashifal+', fill=GOLD, font=font_brand, anchor='mm')
    if bottom:
        draw.text((SIZE[0]//2, SIZE[1]-50), 'myrashifal.in', fill=SECONDARY, font=font_url, anchor='mm')


def generate_rashifal_template(rashi, index):
    """Generate a rashifal template for a specific rashi."""
    img, draw = create_base_image()

    # Gold glow in center
    draw_glow(img, (SIZE[0]//2, SIZE[1]//2 - 40), 200, GOLD_DARK)
    draw = ImageDraw.Draw(img)

    # Zodiac ring
    draw_zodiac_ring(draw, (SIZE[0]//2, SIZE[1]//2 - 40), 280, highlight_idx=index)

    # Large zodiac symbol
    symbol_font = get_symbol_font(180)
    draw.text((SIZE[0]//2, SIZE[1]//2 - 60), rashi['symbol'], fill=GOLD, font=symbol_font, anchor='mm')

    # Rashi name (English)
    name_font = get_font(56, bold=True)
    draw.text((SIZE[0]//2, SIZE[1]//2 + 100), rashi['en'], fill=TEXT, font=name_font, anchor='mm')

    # Rashi name (Hindi)
    hindi_font = get_hindi_font(40)
    draw.text((SIZE[0]//2, SIZE[1]//2 + 160), rashi['hi'], fill=SECONDARY, font=hindi_font, anchor='mm')

    # "Daily Rashifal" label
    label_font = get_font(30)
    draw.text((SIZE[0]//2, SIZE[1]//2 + 220), 'Daily Rashifal', fill=GOLD, font=label_font, anchor='mm')

    add_branding(draw)

    # Decorative line
    draw.line([(200, SIZE[1]//2 + 190), (SIZE[0]-200, SIZE[1]//2 + 190)], fill=GOLD + (60,), width=1)

    return img


def generate_tip_template(tip):
    """Generate a tip/educational template."""
    img, draw = create_base_image()

    # Glow
    draw_glow(img, (SIZE[0]//2, SIZE[1]//2 - 60), 250, (75, 100, 232))
    draw = ImageDraw.Draw(img)

    add_branding(draw)

    # "DID YOU KNOW?" tag
    tag_font = get_font(22, bold=True)
    draw.rounded_rectangle(
        [(SIZE[0]//2 - 100, 110), (SIZE[0]//2 + 100, 145)],
        radius=12, fill=GOLD
    )
    draw.text((SIZE[0]//2, 128), 'DID YOU KNOW?', fill=BG, font=tag_font, anchor='mm')

    # Title
    title_font = get_font(64, bold=True)
    lines = tip['title'].split('\n')
    y = SIZE[1]//2 - 60 * len(lines) // 2
    for line in lines:
        draw.text((SIZE[0]//2, y), line, fill=TEXT, font=title_font, anchor='mm')
        y += 80

    # Subtitle
    sub_font = get_font(32)
    draw.text((SIZE[0]//2, y + 30), tip['subtitle'], fill=GOLD, font=sub_font, anchor='mm')

    # Decorative elements
    draw.line([(100, y + 80), (SIZE[0]-100, y + 80)], fill=GOLD + (60,), width=1)

    # Bottom text
    bottom_font = get_font(26)
    draw.text((SIZE[0]//2, SIZE[1]-100), 'Swipe for more  →', fill=SECONDARY, font=bottom_font, anchor='mm')

    return img


def generate_ad_template(ad):
    """Generate an ad/promotional template."""
    img, draw = create_base_image()

    # Gold glow
    draw_glow(img, (SIZE[0]//2, SIZE[1]//2), 300, GOLD_DARK)
    draw = ImageDraw.Draw(img)

    add_branding(draw)

    # Badge (FREE / ₹49)
    badge_font = get_font(28, bold=True)
    badge_text = ad['badge']
    badge_color = (34, 197, 94) if badge_text == 'FREE' else GOLD
    draw.rounded_rectangle(
        [(SIZE[0]//2 - 60, 110), (SIZE[0]//2 + 60, 148)],
        radius=14, fill=badge_color
    )
    draw.text((SIZE[0]//2, 129), badge_text, fill=BG if badge_text == 'FREE' else BG, font=badge_font, anchor='mm')

    # Title
    title_font = get_font(72, bold=True)
    lines = ad['title'].split('\n')
    y = SIZE[1]//2 - 70 * len(lines) // 2
    for line in lines:
        draw.text((SIZE[0]//2, y), line, fill=TEXT, font=title_font, anchor='mm')
        y += 90

    # Subtitle
    sub_font = get_font(34)
    draw.text((SIZE[0]//2, y + 20), ad['subtitle'], fill=GOLD, font=sub_font, anchor='mm')

    # CTA button
    btn_y = SIZE[1] - 160
    draw.rounded_rectangle(
        [(SIZE[0]//2 - 180, btn_y), (SIZE[0]//2 + 180, btn_y + 60)],
        radius=30, fill=GOLD
    )
    btn_font = get_font(26, bold=True)
    draw.text((SIZE[0]//2, btn_y + 30), 'Try Now  →  myrashifal.in', fill=BG, font=btn_font, anchor='mm')

    return img


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    random.seed(42)  # Reproducible star positions

    print('Generating rashifal templates...')
    for i, rashi in enumerate(RASHIS):
        random.seed(42 + i)
        img = generate_rashifal_template(rashi, i)
        path = os.path.join(OUTPUT_DIR, f'rashifal-{rashi["id"]}.png')
        img.save(path, 'PNG', optimize=True)
        print(f'  OK{path}')

    print('\nGenerating tip templates...')
    for tip in TIP_TEMPLATES:
        random.seed(100)
        img = generate_tip_template(tip)
        path = os.path.join(OUTPUT_DIR, f'{tip["id"]}.png')
        img.save(path, 'PNG', optimize=True)
        print(f'  OK{path}')

    print('\nGenerating ad templates...')
    for ad in AD_TEMPLATES:
        random.seed(200)
        img = generate_ad_template(ad)
        path = os.path.join(OUTPUT_DIR, f'{ad["id"]}.png')
        img.save(path, 'PNG', optimize=True)
        print(f'  OK{path}')

    total = len(RASHIS) + len(TIP_TEMPLATES) + len(AD_TEMPLATES)
    print(f'\nDone! Generated {total} templates in {OUTPUT_DIR}')


if __name__ == '__main__':
    main()
