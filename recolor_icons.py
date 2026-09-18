"""
Recolor the favicon and logo images to match the website color palette:
  Dark navy (#0D1D4A area)  → Dark teal #16292B
  Bright blue (#1a6ef5 area) → Gold #C98A3E
  White/near-white           → Cream #F9F4EC
  Black JPEG background      → Transparent (alpha)
"""
from PIL import Image
import numpy as np
import os

BASE = r"C:\Users\ismai\.gemini\antigravity-ide\brain\a05d47ef-ad9c-4c9c-8339-6b65914a4812"
OUT  = r"C:\Users\ismai\OneDrive\Desktop\Project\ismail\Research Data Web"

# Website palette (target colors)
TEAL_DARK  = np.array([22,  41,  43])   # #16292B
GOLD       = np.array([201, 138,  62])  # #C98A3E
CREAM      = np.array([249, 244, 236])  # #F9F4EC

def recolor_img(img_path, out_path, is_favicon=False):
    img = Image.open(img_path).convert("RGBA")
    arr = np.array(img, dtype=np.float32)

    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]

    # ------------------------------------------------------------------
    # Masks — identify color regions
    # ------------------------------------------------------------------
    # 1. Black / near-black JPEG background  →  transparent
    is_black = (r < 20) & (g < 20) & (b < 20)

    # 2. Dark navy (background of the rounded square icon)
    #    Hue: blue dominant, dark, not quite black
    is_dark_navy = (b > 30) & (b > r * 1.3) & (b > g * 1.2) & \
                   (r < 100) & (g < 100) & (b < 150)

    # 3. Bright/medium blue (book pages)
    is_blue = (b > 100) & (b > r * 1.2) & \
              ~is_dark_navy & ~is_black

    # 4. White / near-white (magnifying glass lens, highlights)
    is_white = (r > 170) & (g > 170) & (b > 170) & \
               ~is_blue & ~is_dark_navy & ~is_black

    # ------------------------------------------------------------------
    # Apply color swaps
    # ------------------------------------------------------------------
    result = arr.copy()

    # Black background → transparent
    result[is_black, 3] = 0
    result[is_black, 0] = 0
    result[is_black, 1] = 0
    result[is_black, 2] = 0

    # Dark navy → dark teal
    result[is_dark_navy, 0] = TEAL_DARK[0]
    result[is_dark_navy, 1] = TEAL_DARK[1]
    result[is_dark_navy, 2] = TEAL_DARK[2]
    result[is_dark_navy, 3] = 255

    # Blue → gold
    result[is_blue, 0] = GOLD[0]
    result[is_blue, 1] = GOLD[1]
    result[is_blue, 2] = GOLD[2]
    result[is_blue, 3] = 255

    # White → cream
    result[is_white, 0] = CREAM[0]
    result[is_white, 1] = CREAM[1]
    result[is_white, 2] = CREAM[2]
    result[is_white, 3] = 255

    out_img = Image.fromarray(result.astype(np.uint8), "RGBA")

    if is_favicon:
        # Upscale to 512×512 for crisp favicon
        out_img = out_img.resize((512, 512), Image.LANCZOS)

    out_img.save(out_path)
    print(f"Saved: {out_path} ({out_img.size})")

# --- Process favicon ---
recolor_img(
    os.path.join(BASE, "media__1789675719295.jpg"),
    os.path.join(OUT,  "favicon.png"),
    is_favicon=True
)

# --- Process logo ---
# Logo is on white background + has text — handle differently
logo_img = Image.open(os.path.join(BASE, "media__1789675721293.jpg")).convert("RGBA")
logo_arr = np.array(logo_img, dtype=np.float32)

r, g, b = logo_arr[:,:,0], logo_arr[:,:,1], logo_arr[:,:,2]

# White/near-white background → transparent (it's a white-bg logo)
is_white_bg = (r > 235) & (g > 235) & (b > 235)

# Dark navy (icon outline + text "Research")
is_dark_text = (b > r * 0.8) & (b > g * 0.8) & \
               (r < 80) & (g < 80) & ~is_white_bg

# Bright blue ("Hub" text + book pages)
is_blue_text = (b > 100) & (b > r * 1.3) & (b > g * 1.1) & \
               ~is_dark_text & ~is_white_bg

logo_result = logo_arr.copy()

# White bg → transparent
logo_result[is_white_bg, 3] = 0
logo_result[is_white_bg, 0] = 255
logo_result[is_white_bg, 1] = 255
logo_result[is_white_bg, 2] = 255

# Dark navy → dark teal
logo_result[is_dark_text, 0] = TEAL_DARK[0]
logo_result[is_dark_text, 1] = TEAL_DARK[1]
logo_result[is_dark_text, 2] = TEAL_DARK[2]
logo_result[is_dark_text, 3] = 255

# Blue → gold
logo_result[is_blue_text, 0] = GOLD[0]
logo_result[is_blue_text, 1] = GOLD[1]
logo_result[is_blue_text, 2] = GOLD[2]
logo_result[is_blue_text, 3] = 255

logo_out = Image.fromarray(logo_result.astype(np.uint8), "RGBA")
# Scale up 2x for sharpness
new_w = logo_out.width * 2
new_h = logo_out.height * 2
logo_out = logo_out.resize((new_w, new_h), Image.LANCZOS)
logo_out.save(os.path.join(OUT, "logo.png"))
print(f"Saved: logo.png ({logo_out.size})")
