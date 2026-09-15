import xml.etree.ElementTree as ET
import json

tree = ET.parse('deepseek_xml_20260915_8657df.xml')
root = tree.getroot()
ns = {'svg': 'http://www.w3.org/2000/svg'}
paths = root.findall('svg:path', ns)
if not paths:
    paths = root.findall('path')

path_objects = []
for p in paths:
    path_objects.append({
        'd': p.get('d', ''),
        'fill': p.get('fill', ''),
        'transform': p.get('transform', '')
    })

header = """import React from 'react';

export interface GemStarLogoProps {
  className?: string;
  size?: number;
  width?: number | string;
  height?: number | string;
  variant?: 'color' | 'navy' | 'white';
}

/**
 * Official GeM Sovereign Logo
 * Source vector paths derived from deepseek_xml_20260915_8657df.xml
 * Bounding Box: X=[18.3, 780.0], Y=[145.7, 615.0] (W=761.7, H=469.3)
 * Aspect Ratio: ~1.57 : 1 (770 / 490)
 */
interface LogoPath {
  d: string;
  fill: string;
  transform?: string;
}

const LOGO_PATHS: LogoPath[] = """

footer = """;

export const GemStarLogo: React.FC<GemStarLogoProps> = ({
  className = '',
  size = 40,
  width,
  height,
  variant = 'color',
}) => {
  const isWhite = variant === 'white';
  const effectiveHeight = height ?? size;
  const effectiveWidth = width ?? (typeof effectiveHeight === 'number' ? Math.round(effectiveHeight * 1.57) : undefined);

  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width={effectiveWidth}
      height={effectiveHeight}
      viewBox="15 135 770 490"
      className={`select-none shrink-0 transition-transform duration-200 ${className}`}
      aria-label="GeM Official Logo"
      role="img"
    >
      {LOGO_PATHS.map((p, idx) => {
        let fill = p.fill;
        if (isWhite && (fill === '#363939' || fill === '#221F1F')) {
          fill = '#FFFFFF';
        }
        return (
          <path
            key={idx}
            d={p.d}
            fill={fill}
            transform={p.transform || undefined}
          />
        );
      })}
    </svg>
  );
};

export default GemStarLogo;
"""

with open('frontend/src/components/ui/GemStarLogo.tsx', 'w', encoding='utf-8') as f:
    f.write(header + json.dumps(path_objects, indent=2) + footer)

# Update public/gem_star.svg and public/gem_shield.svg
with open('deepseek_xml_20260915_8657df.xml', 'r', encoding='utf-8') as f:
    raw_svg = f.read()

trimmed_svg = raw_svg.replace('viewBox="0 0 800 800"', 'viewBox="15 135 770 490"').replace('width="800" height="800"', 'width="770" height="490"')

with open('frontend/public/gem_star.svg', 'w', encoding='utf-8') as f:
    f.write(trimmed_svg)

with open('frontend/public/gem_shield.svg', 'w', encoding='utf-8') as f:
    f.write(trimmed_svg)

print(f"Generated GemStarLogo.tsx with {len(path_objects)} paths and updated public/ SVGs")
