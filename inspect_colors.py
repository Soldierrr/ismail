import os
import cv2
import numpy as np

base_dir = r"C:\Users\ismai\.gemini\antigravity-ide\brain\a05d47ef-ad9c-4c9c-8339-6b65914a4812"
img1_path = os.path.join(base_dir, "media__1789675719295.jpg")
img2_path = os.path.join(base_dir, "media__1789675721293.jpg")

print(f"File 1 size: {os.path.getsize(img1_path)}")
print(f"File 2 size: {os.path.getsize(img2_path)}")

img1 = cv2.imread(img1_path)
img2 = cv2.imread(img2_path)

print(f"Img 1 shape: {img1.shape if img1 is not None else 'None'}")
print(f"Img 2 shape: {img2.shape if img2 is not None else 'None'}")

# Print the most common colors to understand the palette
def get_colors(img, name):
    if img is None: return
    # reshape to list of pixels
    pixels = img.reshape(-1, 3)
    # unique colors and counts
    colors, counts = np.unique(pixels, axis=0, return_counts=True)
    # sort by count
    sorted_idx = np.argsort(-counts)
    print(f"\nTop colors for {name} (BGR):")
    for i in range(5):
        if i < len(sorted_idx):
            idx = sorted_idx[i]
            print(f"Color: {colors[idx]}, Count: {counts[idx]}")

get_colors(img1, "favicon (19295)")
get_colors(img2, "logo (21293)")
