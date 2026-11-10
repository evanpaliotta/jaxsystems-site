#!/usr/bin/env python3
"""Update public HTML asset versions after editing CSS or JavaScript."""
import hashlib
import re
from pathlib import Path

public = Path(__file__).resolve().parents[1] / 'public'
assets = ('site.css', 'workshop.css', 'site.js', 'workshop.js')
for page in public.glob('*.html'):
    text = page.read_text()
    for asset in assets:
        digest = hashlib.sha256((public / asset).read_bytes()).hexdigest()[:12]
        pattern = r'((?:href|src)=")' + re.escape(asset) + r'(?:\?v=[a-f0-9]+)?("\s|">)'
        text, count = re.subn(pattern, lambda m: m.group(1) + asset + '?v=' + digest + m.group(2), text)
        if count != 1:
            raise SystemExit(f'{page.name}: expected one reference to {asset}; found {count}')
    page.write_text(text)
