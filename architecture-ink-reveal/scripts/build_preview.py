#!/usr/bin/env python3
"""Prepare monochrome architectural ink and a standalone browser preview."""
import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path

try:
    import numpy as np
    from PIL import Image, ImageOps
except ImportError as exc:
    raise SystemExit('Pillow und NumPy fehlen. Bitte in einer Projekt-venv installieren: python3 -m pip install pillow numpy') from exc


def runs(row, minimum):
    edges = np.diff(np.r_[False, row, False].astype(np.int8))
    return [(int(a), int(b-1)) for a, b in zip(np.where(edges == 1)[0], np.where(edges == -1)[0]) if b-a >= minimum]


def extract(data, minimum, vertical=False):
    candidates = [(a, y, b, y) for y, row in enumerate(data) for a, b in runs(row, minimum)]
    kept, by_row = [], {}
    for a, y, b, _ in sorted(candidates, key=lambda q: q[2]-q[0], reverse=True):
        nearby = [p for ky in range(y-4, y+5) for p in by_row.get(ky, [])]
        if any(abs(a-ka) <= 18 and abs(b-kb) <= 18 for ka, kb in nearby):
            continue
        kept.append((a, y, b, y))
        by_row.setdefault(y, []).append((a, b))
    return [(y, a, y, b) for a, y, b, _ in kept] if vertical else kept


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--image', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--title', default='Architektur, Linie für Linie.')
    parser.add_argument('--subtitle', default='Erst die Kontur. Dann Tiefe, Schatten und Struktur.')
    parser.add_argument('--duration', default=12.0, type=float)
    parser.add_argument('--mode', choices=['both', 'contours', 'ink'], default='both')
    parser.add_argument('--direction', choices=['top-down', 'bottom-up', 'left-right', 'center-out'], default='top-down')
    parser.add_argument('--loop', action='store_true')
    parser.add_argument('--no-autoplay', action='store_true')
    parser.add_argument('--paper', type=float)
    parser.add_argument('--ink', type=int, default=17)
    parser.add_argument('--background', default='#f5f2e9')
    parser.add_argument('--horizontal-min', type=int, default=70)
    parser.add_argument('--vertical-min', type=int, help='Standard: 3 %% der Bildhöhe, mindestens 24 px')
    parser.add_argument('--ground-y', type=int)
    parser.add_argument('--extra-lines', type=Path, help='JSON-Liste [[x1,y1,x2,y2], …] für schräge Kanten in Quellpixeln')
    args = parser.parse_args()
    if not (0.5 <= args.duration <= 600):
        parser.error('--duration muss zwischen 0.5 und 600 Sekunden liegen.')
    if not 0 <= args.ink <= 64:
        parser.error('--ink muss zwischen 0 und 64 liegen.')
    if args.paper is not None and not 5 <= args.paper <= 255:
        parser.error('--paper muss zwischen 5 und 255 liegen.')
    if min(args.horizontal_min, args.vertical_min or 2) < 2:
        parser.error('Mindestlinienlängen müssen mindestens 2 Pixel betragen.')
    if not re.fullmatch(r'#[0-9a-fA-F]{6}', args.background):
        parser.error('--background muss eine sechsstellige Hexfarbe sein.')
    source = args.image.expanduser().resolve()
    output = args.output.expanduser().resolve()
    if not source.is_file():
        parser.error(f'Quelldatei fehlt: {source}')
    if output.exists() and (not output.is_dir() or any(output.iterdir())):
        parser.error(f'Ausgabeordner ist nicht leer; bestehenden Inhalt erhalten: {output}')
    template = Path(__file__).resolve().parents[1] / 'assets/browser-template'
    if not (template / 'index.html').is_file():
        parser.error('Browser-Template fehlt im Skillpaket.')

    with Image.open(source) as original:
        original = ImageOps.exif_transpose(original).convert('RGBA')
        flattened = Image.new('RGBA', original.size, 'white')
        flattened.alpha_composite(original)
        gray = np.asarray(flattened.convert('L'), dtype=np.float32)
    h, w = gray.shape
    if min(w, h) < 32:
        parser.error('Die Vorlage muss mindestens 32 Pixel pro Seite haben.')
    if args.ground_y is not None and not 0 <= args.ground_y < h:
        parser.error('--ground-y liegt außerhalb des Bildes.')
    paper = args.paper if args.paper is not None else max(5.0, float(np.percentile(gray, 93)))
    level = np.clip(gray * (255.0/(paper-4.0)), 0, 255)
    alpha = np.clip((255.0-level) * (255.0/(255.0-args.ink)), 0, 255)
    rgba = np.full((h, w, 4), args.ink, dtype=np.uint8)
    rgba[:, :, 3] = np.rint(alpha).astype(np.uint8)

    padded = np.pad(gray, 15, mode='edge')
    integral = np.pad(padded, ((1, 0), (1, 0))).cumsum(0, dtype=np.float64).cumsum(1)
    mean = (integral[31:, 31:] - integral[:-31, 31:] - integral[31:, :-31] + integral[:-31, :-31])/961
    binary = gray < (mean-25)
    ground_y, ground_source = args.ground_y, 'manual' if args.ground_y is not None else None
    if ground_y is None:
        # Bodenlinien liegen in der Praxis zwischen ca. 70 und 90 % der Höhe; das Band ist bewusst breiter.
        band = np.arange(int(h*.45), min(h, int(h*.97)+1))
        # Je drei Zeilen zusammen werten: Gestippelte Strand- oder Wasserkanten sind keine durchgehende Federlinie.
        rows = gray < 120
        dark = rows[band] | rows[np.maximum(band-1, 0)] | rows[np.minimum(band+1, h-1)]
        # Gebäudekanten sind oft lang, überspannen aber selten fast die ganze Bildbreite wie eine Bodenlinie.
        span = np.where(dark.any(1), w-1-np.argmax(dark[:, ::-1], 1)-np.argmax(dark, 1), 0)
        lengths = np.where(span >= .85*w, dark.sum(1), 0)
        index = int(np.argmax(lengths))
        if lengths[index] >= .55*w:
            ground_y, ground_source = int(band[index]), 'detected'
    vertical_min = args.vertical_min or max(24, round(h*.03))
    lines = extract(binary, args.horizontal_min) + extract(binary.T, vertical_min, True)
    lines = [list(p) for p in lines if not (ground_y is not None and p[1] == p[3] and abs(p[1]-ground_y) < 5)]
    extra = []
    if args.extra_lines:
        extra = json.loads(args.extra_lines.expanduser().read_text(encoding='utf-8'))
        if not all(len(p) == 4 and 0 <= p[0] < w and 0 <= p[2] < w and 0 <= p[1] < h and 0 <= p[3] < h for p in extra):
            parser.error('--extra-lines: jede Linie braucht [x1,y1,x2,y2] innerhalb des Bildes.')
        lines += [[int(v) for v in p] for p in extra]
    lines.sort(key=lambda p: (min(p[1], p[3]), p[0]))
    metadata = {'w': w, 'h': h, 'v': hashlib.sha256(source.read_bytes()).hexdigest()[:8],
                'ground': [0, ground_y, w-1, ground_y] if ground_y is not None else None,
                'groundSource': ground_source, 'lines': lines}
    config = {'title': args.title, 'subtitle': args.subtitle, 'duration': args.duration*1000,
              'mode': args.mode, 'direction': args.direction, 'loop': args.loop,
              'autoplay': not args.no_autoplay, 'background': args.background,
              'ink': '#'+f'{args.ink:02x}'*3}
    shutil.copytree(template, output, dirs_exist_ok=True)
    assets = output / 'assets'
    assets.mkdir(exist_ok=True)
    shutil.copy2(source, assets / ('source'+source.suffix.lower()))
    Image.fromarray(rgba).save(assets / 'drawing.png')
    (assets / 'drawing.json').write_text(json.dumps(metadata), encoding='utf-8')
    (output / 'config.js').write_text('window.ARCHITECTURE_CONFIG = '+json.dumps(config, ensure_ascii=False)+';\n', encoding='utf-8')
    result = {'output': str(output), 'width': w, 'height': h, 'paper': paper,
              'ground': ground_y, 'ground_source': ground_source, 'lines': len(lines),
              'vertical_lines': sum(1 for p in lines if p[0] == p[2]), 'vertical_min': vertical_min,
              'extra_lines': len(extra),
              'alpha_range': [int(rgba[:, :, 3].min()), int(rgba[:, :, 3].max())]}
    # Lokale Pfade nur auf der Konsole ausgeben, nicht in die veröffentlichbare Vorschau schreiben.
    report = {k: v for k, v in result.items() if k != 'output'}
    (assets / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
