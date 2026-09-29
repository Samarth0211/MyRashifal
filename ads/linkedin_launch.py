"""
Generate a clean LinkedIn launch post image for MyRashifal+
Optimal LinkedIn image: 1200x627 (1.91:1 ratio)
"""
from PIL import Image, ImageDraw, ImageFont
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'public')

# Colors
BG = (6, 9, 24)
GOLD = (201, 149, 26)
GOLD_LIGHT = (232, 191, 75)
WHITE = (255, 255, 255)
TEXT_SEC = (158, 164, 188)
GREEN = (34, 197, 94)

def get_font(size, bold=False):
    paths = [
        'C:/Windows/Fonts/segoeuib.ttf' if bold else 'C:/Windows/Fonts/segoeui.ttf',
        'C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf',
    ]
    for p in paths:
        try:
            return ImageFont.truetype(p, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()

def get_hindi_font(size, bold=False):
    try:
        return ImageFont.truetype('C:/Windows/Fonts/Nirmala.ttc', size, index=1 if bold else 0)
    except:
        return get_font(size, bold)

def get_symbol_font(size):
    try:
        return ImageFont.truetype('C:/Windows/Fonts/seguisym.ttf', size)
    except:
        return get_font(size)

def draw_rounded_rect(draw, xy, radius, fill):
    draw.rounded_rectangle(xy, radius=radius, fill=fill)

def text_w(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0]

def load_icon(size=100):
    path = os.path.join(PUBLIC_DIR, 'icon-512-maskable.png')
    if os.path.exists(path):
        icon = Image.open(path).convert('RGBA').resize((size, size), Image.LANCZOS)
        mask = Image.new('L', (size, size), 0)
        d = ImageDraw.Draw(mask)
        d.rounded_rectangle([0, 0, size, size], radius=size // 4, fill=255)
        icon.putalpha(mask)
        return icon
    return None


def create_linkedin_image():
    W, H = 1200, 627
    img = Image.new('RGBA', (W, H), (*BG, 255))
    draw = ImageDraw.Draw(img, 'RGBA')

    # Subtle background elements
    # Soft glow on right side
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for r in range(250, 0, -2):
        a = int(12 * (r / 250) ** 0.5)
        od.ellipse([W - 200 - r, H//2 - r, W - 200 + r, H//2 + r], fill=(*GOLD, a))
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img, 'RGBA')

    # ---- LEFT SIDE (text content) ----
    left_x = 80

    # App icon
    icon = load_icon(72)
    if icon:
        img.paste(icon, (left_x, 65), icon)
        draw = ImageDraw.Draw(img, 'RGBA')

    # Brand name next to icon
    f_brand = get_font(26, bold=True)
    draw.text((left_x + 85, 72), 'MyRashifal+', fill=GOLD_LIGHT, font=f_brand)
    f_tag = get_font(15)
    draw.text((left_x + 85, 104), 'Vedic Astrology & Kundli', fill=TEXT_SEC, font=f_tag)

    # "JUST LAUNCHED" badge
    f_badge = get_font(14, bold=True)
    badge_text = 'JUST LAUNCHED'
    bw = text_w(draw, badge_text, f_badge) + 24
    draw_rounded_rect(draw, (left_x, 160, left_x + bw, 186), 10, (*GREEN, 50))
    draw.text((left_x + 12, 164), badge_text, fill=GREEN, font=f_badge)

    # Main headline
    f_head = get_font(46, bold=True)
    draw.text((left_x, 210), 'Free Vedic Kundli &', fill=WHITE, font=f_head)
    draw.text((left_x, 265), 'Daily Rashifal', fill=GOLD_LIGHT, font=f_head)

    # Subtitle
    f_sub = get_font(20)
    draw.text((left_x, 335), 'Accurate birth charts powered by real', fill=TEXT_SEC, font=f_sub)
    draw.text((left_x, 362), 'astronomical data, not guesswork.', fill=TEXT_SEC, font=f_sub)

    # Feature list
    f_feat = get_font(18)
    f_check = get_font(18, bold=True)
    features = [
        'Planetary positions & house analysis',
        'Nakshatra & Vimshottari Dasha',
        'AI-powered personality insights',
        'Kundli matching & daily rashifal',
    ]
    fy = 415
    for feat in features:
        draw.text((left_x + 4, fy), '+', fill=GREEN, font=f_check)
        draw.text((left_x + 26, fy), feat, fill=WHITE, font=f_feat)
        fy += 32

    # URL / CTA
    f_url = get_font(22, bold=True)
    draw.text((left_x, H - 60), 'myrashifal.in', fill=GOLD_LIGHT, font=f_url)
    f_free = get_font(16)
    draw.text((left_x + text_w(draw, 'myrashifal.in', f_url) + 16, H - 55), '|  100% Free to use', fill=TEXT_SEC, font=f_free)

    # ---- RIGHT SIDE (visual) ----
    right_cx = W - 260

    # Zodiac circle
    f_sym = get_symbol_font(28)
    symbols = list('\u2648\u2649\u264A\u264B\u264C\u264D\u264E\u264F\u2650\u2651\u2652\u2653')
    import math
    radius = 170
    center_y = H // 2
    for i, sym in enumerate(symbols):
        angle = (i / 12) * 2 * math.pi - math.pi / 2
        x = right_cx + radius * math.cos(angle)
        y = center_y + radius * math.sin(angle)
        bbox = draw.textbbox((0, 0), sym, font=f_sym)
        sw = bbox[2] - bbox[0]
        sh = bbox[3] - bbox[1]
        draw.text((x - sw//2, y - sh//2), sym, fill=(*GOLD_LIGHT, 100), font=f_sym)

    # Inner circle border
    draw.arc(
        [right_cx - 130, center_y - 130, right_cx + 130, center_y + 130],
        0, 360, fill=(*GOLD, 25), width=1
    )
    draw.arc(
        [right_cx - 80, center_y - 80, right_cx + 80, center_y + 80],
        0, 360, fill=(*GOLD, 15), width=1
    )

    # Center icon
    center_icon = load_icon(80)
    if center_icon:
        img.paste(center_icon, (right_cx - 40, center_y - 40), center_icon)
        draw = ImageDraw.Draw(img, 'RGBA')

    # Vertical separator line
    sep_x = W - 490
    draw.line([(sep_x, 80), (sep_x, H - 80)], fill=(*GOLD, 20), width=1)

    return img.convert('RGB')


if __name__ == '__main__':
    img = create_linkedin_image()
    out_path = os.path.join(SCRIPT_DIR, 'linkedin_launch_1200x627.png')
    img.save(out_path, 'PNG', quality=95)
    print(f'[OK] Saved: {out_path}')
