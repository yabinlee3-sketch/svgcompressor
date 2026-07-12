# -*- coding: utf-8 -*-
import os, re

path = r'C:\Users\ybl\Documents\Codex\2026-07-09\skill\svgcompressor\index.html'

with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

print(f"Read {len(html)} chars")

# Remove BOM if present
if html.startswith('\ufeff'):
    html = html[1:]
    print("BOM removed")

# 1. Fix garbled emoji - replace with inline SVG icons that can't garble
replacements = [
    # Remove corrupted emoji in feature icons (use SVG instead)
    # The emoji that got garbled
]

# 2. Replace common corrupted patterns
# Pattern: corrupted chars before "Batch optimize"
corrupted = re.findall(r'[^\x20-\x7E\n\r\t<>"\'=&;:.(){}[\]/\\@#%^_`~|+*,-]', html)
print(f"Found {len(corrupted)} non-ASCII chars")

# 3. Improve CSS - add modern design
css_improvements = '''
/* ===== DESIGN IMPROVEMENTS ===== */
.hero h1{font-size:2.8rem;letter-spacing:-0.5px}
.drop-zone{border-radius:16px;border:2px dashed var(--border);background:linear-gradient(135deg,var(--bg-card),var(--bg));transition:all 0.3s}
.drop-zone:hover,.drop-zone.dragover{border-color:var(--accent);transform:scale(1.01);background:linear-gradient(135deg,var(--bg-hover),var(--bg-card))}
.feature{border-radius:16px;transition:all 0.3s}
.feature:hover{transform:translateY(-4px);box-shadow:0 8px 32px rgba(108,92,231,0.15)}
.stat-card{border-radius:16px}
.btn-download,.btn-select,.btn-buy{border-radius:10px;font-weight:600;transition:all 0.2s}
.btn-download:hover,.btn-select:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(108,92,231,0.3)}
.preview-card{border-radius:16px}
.preview-body{border-radius:0 0 16px 16px}
.modal{border-radius:20px;backdrop-filter:blur(8px)}
.file-item{border-radius:12px;transition:all 0.2s}
.file-item:hover{background:var(--bg-hover)}
.paid-teaser{border-radius:20px}
.footer a:hover{text-decoration:underline}
@media(max-width:640px){.hero h1{font-size:2rem}}
'''

# Insert CSS improvements before </style>
html = html.replace('/* faq */', css_improvements + '\n/* faq */')

# 4. Add test payment mechanism - URL parameter to simulate Pro
test_script = '''
// Test payment redirect (simulate /?pro=success)
if(window.location.search.includes('test_pro=1')){localStorage.setItem('svgpro','true');window.history.replaceState({},'','/');console.log('Test: Pro activated')}
if(window.location.search.includes('test_reset=1')){localStorage.removeItem('svgpro');window.history.replaceState({},'','/');console.log('Test: Pro reset')}
'''

# Insert after the pro=success detection
test_marker = "window.location.search.includes('pro=success')"
if test_marker in html:
    html = html.replace(test_marker + "{", test_marker + "{localStorage.setItem('svgpro_test','1');")
    # Actually append test script
    html = html.replace(
        "if(window.location.search.includes('pro=success'))",
        test_script + "\nif(window.location.search.includes('pro=success'))"
    )
    print("Test payment mechanism added")
else:
    print("WARNING: pro=success marker not found")

# 5. Write back with clean UTF-8
with open(path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Write complete")
print(f"Final size: {len(html)} bytes")
print(f"BOM after write: {html.startswith(chr(0xFEFF))}")
*** End of File
