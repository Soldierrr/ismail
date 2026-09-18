from PIL import Image
import os
from collections import Counter

base_dir = r"C:\Users\ismai\.gemini\antigravity-ide\brain\a05d47ef-ad9c-4c9c-8339-6b65914a4812"
img1_path = os.path.join(base_dir, "media__1789675719295.jpg")
img2_path = os.path.join(base_dir, "media__1789675721293.jpg")

print(f"File 1 size: {os.path.getsize(img1_path)}")
print(f"File 2 size: {os.path.getsize(img2_path)}")

img1 = Image.open(img1_path).convert('RGB')
img2 = Image.open(img2_path).convert('RGB')

print(f"Img 1 size: {img1.size}")
print(f"Img 2 size: {img2.size}")

def get_colors(img, name):
    pixels = list(img.getdata())
    counter = Counter(pixels)
    print(f"\nTop colors for {name} (RGB):")
    for color, count in counter.most_common(5):
        print(f"Color: {color}, Count: {count}")

get_colors(img1, "favicon (19295)")
get_colors(img2, "logo (21293)")
