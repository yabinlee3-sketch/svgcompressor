# -*- coding: utf-8 -*-
"""Rebuild SVG Compressor index.html with clean encoding, better UI, and payment test."""
import re, os

PATH = r'C:\Users\ybl\Documents\Codex\2026-07-09\skill\svgcompressor\index.html'

with open(PATH, 'r', encoding='utf-8') as f:
    html = f.read()

print(f'Read {len(html)} chars')

# STEP 1: Remove all emoji/corrupted chars and replace with SVG icons
# Define reliable SVG icon replacements
icons = {
    'lock': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    'bolt': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    'chart': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    'folder': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    'download': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    'refresh': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
    'rocket': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
    'star': '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'check': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    'moon': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    'sun': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
}

# Fix theme button text (replace emoji with text)
html = html.replace('\uD83C\uDF19 Dark', icons['moon'] + ' Dark')
html = html.replace('\u2600\uFE0F Dark', icons['moon'] + ' Dark')
html = html.replace('\u2600\uFE0F Light', icons['sun'] + ' Light')

# Fix feature icons
html = html.replace('\uD83D\uDD12', icons['lock'])
html = html.replace('\u26A1', icons['bolt'])
html = html.replace('\uD83D\uDCC9', icons['chart'])

# Fix other icons
html = html.replace('\uD83D\uDCC2', icons['folder'])

# Fix download button
html = html.replace('\u2B07 Download All', icons['download'] + ' Download All')
html = html.replace('\u2B07\xa0Download All', icons['download'] + ' Download All')

# Fix reset button
html = html.replace('\uD83D\uDD04 Start Over', icons['refresh'] + ' Start Over')

# STEP 2: Add CSS improvements
css_add = '''
/* DESIGN IMPROVEMENTS */
.hero h1{font-size:2.8rem;letter-spacing:-.5px;line-height:1.15}
.drop-zone{background:linear-gradient(135deg,var(--bg-card),var(--bg));border-radius:16px;transition:all .3s}
.drop-zone:hover,.drop-zone.dragover{border-color:var(--accent);background:linear-gradient(135deg,var(--bg-hover),var(--bg-card))}
.feature{border-radius:16px}
.feature:hover{transform:translateY(-4px)}
.preview-card,.stat-card,.file-item{border-radius:12px;transition:all .2s}
.file-item:hover{background:var(--bg-hover)}
.btn-paid{font-weight:700;transition:all .2s}
.btn-paid:hover{transform:translateY(-2px)}
.modal .btn-buy{border-radius:10px}
.paid-teaser{position:relative;overflow:hidden}
.paid-teaser::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(255,255,255,.05) 0,transparent 70%);animation:spin 8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:640px){.hero h1{font-size:2rem}}
'''
html = html.replace('</style>', css_add + '\n</style>')

# STEP 3: Add test payment URL parameter
test_js = (
    'if(window.location.search.includes("test_pro=1")){'
    'localStorage.setItem("svgpro","true");'
    'window.history.replaceState({},"","/");'
    'console.log("Test: Pro activated")'
    '}'
)
# Find pro=success detection and append test code
success_check = "if(window.location.search.includes('pro=success'))"
if success_check in html:
    html = html.replace(success_check, test_js + '\n' + success_check)
    print('Test payment mechanism added')

# STEP 4: Write back clean
with open(PATH, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'Written {len(html)} bytes')
print(f'Test pro: {"test_pro=1" in html}')
print(f'CSS improvements: {"DESIGN IMPROVEMENTS" in html}')
print(f'SVG icons: {"svg" in html}')
print(f'BOM: {html.startswith(chr(0xFEFF))}')
*** End File
