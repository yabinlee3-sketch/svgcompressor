import { readFileSync, writeFileSync } from 'fs';
const path = 'C:\\Users\\ybl\\Documents\\Codex\\2026-07-09\\skill\\svgcompressor\\index.html';
let h = readFileSync(path, 'utf8');

function S(svg, w=20, h=20) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>`;
}

const lock = S('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>');
const bolt = S('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>');
const chart = S('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>');
const folder = S('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>');
const moon = S('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>', 18, 18);
const sun = S('<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>', 18, 18);
const star = S('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>', 16, 16);

// DIRECT replacements - match exact HTML patterns
h = h.replaceAll('?/div><h3>100% Private', lock + '</div><h3>100% Private');
h = h.replaceAll('?/div><h3>Lightning Fast', bolt + '</div><h3>Lightning Fast');
h = h.replaceAll('?/div><h3>Up to 70% Smaller', chart + '</div><h3>Up to 70% Smaller');
h = h.replaceAll('?/div><h2>Drop your SVG files', folder + '</div><h2>Drop your SVG files');

// Theme button - fix messed up text
h = h.replaceAll('>(S)?Light<', '>' + sun + ' Light<');
h = h.replaceAll("'(S)?Light'", "'" + sun + " Light'");
h = h.replaceAll("'?Dark'", "'" + moon + " Dark'");
h = h.replaceAll("' Dark'", "'" + moon + " Dark'");

// Feature spans
h = h.replaceAll('">?Batch optimize', '">' + star + ' Batch optimize');
h = h.replaceAll('">?Max compression', '">' + star + ' Max compression');

// Buttons
h = h.replaceAll('"?Get Pro ?$4.99', '"' + star + ' Get Pro $4.99');
h = h.replaceAll('?Get Pro ?', star + ' Get Pro ');
h = h.replaceAll('?Get Pro', star + ' Get Pro');

// Clean remaining single ? characters (leftover from emoji cleanup)
// Only clean ? that are isolated/standalone, not part of text
h = h.replaceAll(' ?', ' ');
h = h.replaceAll('?<', '<');
h = h.replaceAll('>?', '>');
h = h.replaceAll('"?', '"');

writeFileSync(path, h, 'utf8');
console.log('Fixed. Size:', h.length);
console.log('Has lock:', h.includes('lock'));
console.log('Has moon:', h.includes('moon'));
console.log('Has (S):', h.includes('(S)'));
console.log('Has ? stray:', h.includes('?/div') || h.includes('"?Get'));
