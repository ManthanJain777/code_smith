import xml.etree.ElementTree as ET
import re

tree = ET.parse('deepseek_xml_20260915_8657df.xml')
root = tree.getroot()
paths = root.findall('{http://www.w3.org/2000/svg}path') or root.findall('path')

min_x, min_y, max_x, max_y = 9999, 9999, -9999, -9999

# Group 1: Colored emblem shapes
emblem_x_min, emblem_x_max = 9999, -9999
emblem_y_min, emblem_y_max = 9999, -9999

# Group 2: Text shapes
text_x_min, text_x_max = 9999, -9999
text_y_min, text_y_max = 9999, -9999

for p in paths:
    t = p.get('transform', '')
    m = re.search(r'translate\(([^,]+),\s*([^)]+)\)', t)
    tx, ty = (float(m.group(1)), float(m.group(2))) if m else (0.0, 0.0)
    d = p.get('d', '')
    fill = p.get('fill', '')
    coords = re.findall(r'[-+]?\d*\.?\d+', d)
    nums = [float(c) for c in coords]
    for i in range(0, len(nums)-1, 2):
        px = nums[i] + tx
        py = nums[i+1] + ty
        min_x = min(min_x, px)
        max_x = max(max_x, px)
        min_y = min(min_y, py)
        max_y = max(max_y, py)
        if fill in ['#363939', '#221F1F']:
            text_x_min = min(text_x_min, px)
            text_x_max = max(text_x_max, px)
            text_y_min = min(text_y_min, py)
            text_y_max = max(text_y_max, py)
        else:
            emblem_x_min = min(emblem_x_min, px)
            emblem_x_max = max(emblem_x_max, px)
            emblem_y_min = min(emblem_y_min, py)
            emblem_y_max = max(emblem_y_max, py)

print(f"Overall: X=[{min_x}, {max_x}], Y=[{min_y}, {max_y}] -> W={max_x - min_x}, H={max_y - min_y}")
print(f"Emblem:  X=[{emblem_x_min}, {emblem_x_max}], Y=[{emblem_y_min}, {emblem_y_max}] -> W={emblem_x_max - emblem_x_min}, H={emblem_y_max - emblem_y_min}")
print(f"Text:    X=[{text_x_min}, {text_x_max}], Y=[{text_y_min}, {text_y_max}] -> W={text_x_max - text_x_min}, H={text_y_max - text_y_min}")
