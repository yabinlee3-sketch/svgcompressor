import { readFileSync, writeFileSync } from 'fs';

const PATH = 'C:\\Users\\ybl\\Documents\\Codex\\2026-07-09\\skill\\svgcompressor\\index.html';
let html = readFileSync(PATH, 'utf8');

console.log('Read', html.length, 'chars');
console.log('Has test_pro:', html.includes('test_pro=1'));

// SVG icons as strings
const icon = (svg) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`;
const I = {
  lock: icon('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
  bolt: icon('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
  chart: icon('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'),
  folder: icon('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>'),
  download: icon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
  refresh: icon('<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'),
  star: icon('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', 16, 16),
  moon: icon('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>', 18, 18),
  sun: icon('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>', 18, 18),
};
function icon(svg, w = 20, h = 20) { return `<svg width="${w}" height="${h}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${svg}</svg>`; }

// 1. Replace feature icons (match any non-ASCII before </div>)
html = html.replace(
  /<div class="icon">[^<]*<\/div>\s*<h3>100% Private<\/h3>/,
  `<div class="icon">${I.lock}</div><h3>100% Private</h3>`
);
html = html.replace(
  /<div class="icon">[^<]*<\/div>\s*<h3>Lightning Fast<\/h3>/,
  `<div class="icon">${I.bolt}</div><h3>Lightning Fast</h3>`
);
html = html.replace(
  /<div class="icon">[^<]*<\/div>\s*<h3>Up to 70% Smaller<\/h3>/,
  `<div class="icon">${I.chart}</div><h3>Up to 70% Smaller</h3>`
);

// 2. Replace drop zone icon
html = html.replace(
  /<div class="icon">[^<]*<\/div>\s*<h2>Drop your SVG files here<\/h2>/,
  `<div class="icon">${I.folder}</div><h2>Drop your SVG files here</h2>`
);

// 3. Theme button - replace emoji with icon
html = html.replace(/<button class="theme-btn"[^>]*>[^<]*Dark<\/button>/, `<button class="theme-btn" onclick="toggleTheme()">${I.moon} Dark</button>`);
html = html.replace(/<button class="theme-btn"[^>]*>[^<]*Light<\/button>/, `<button class="theme-btn" onclick="toggleTheme()">${I.sun} Light</button>`);

// 4. Download and Reset buttons
html = html.replace(/[^\x20-\x7F]+Download All/, I.download + ' Download All');
html = html.replace(/[^\x20-\x7F]+Start Over/, I.refresh + ' Start Over');

// 5. Remove corrupted text from paid button (replace with clean version)
html = html.replace(/[^\x20-\x7F]+Get Pro/, I.star + ' Get Pro');

console.log('Icon replacements done');

// 6. Add CSS improvements
const css = `
.hero h1{font-size:2.8rem;letter-spacing:-.5px}
.drop-zone{background:linear-gradient(135deg,var(--bg-card),var(--bg));border-radius:18px;transition:all .3s}
.drop-zone:hover,.drop-zone.dragover{transform:scale(1.01)}
.feature{border-radius:14px;transition:all .3s}
.feature:hover{transform:translateY(-4px)}
.stat-card,.preview-card,.file-item{border-radius:12px}
.paid-teaser{position:relative;overflow:hidden}
.modal .btn-buy{border-radius:10px}
@media(max-width:640px){.hero h1{font-size:2rem}}
`;
html = html.replace('</style>', css + '\n</style>');

console.log('CSS improvements added');

// 7. Add test payment mechanism (before pro=success check)
const testScript = `if(window.location.search.includes("test_pro=1")){localStorage.setItem("svgpro","true");window.history.replaceState({},"","/");toast("Test: Pro activated")}`;
const proCheck = "if(window.location.search.includes('pro=success'))";
if (html.includes(proCheck)) {
  html = html.replace(proCheck, testScript + '\n' + proCheck);
  console.log('Test payment mechanism added');
} else {
  console.log('WARNING: pro=success check not found');
}

// Write
writeFileSync(PATH, html, 'utf8');
console.log('Written', html.length, 'bytes');
console.log('Has test_pro:', html.includes('test_pro=1'));
console.log('Has CSS:', html.includes('2.8rem'));
console.log('Has SVG icons:', html.includes('lock') && html.includes('bolt'));
console.log('BOM:', html.charCodeAt(0) === 0xFEFF);
*** End of File
