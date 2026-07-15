// Extract and test optimizeSVG + svgToJsx + fmt functions
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');

// Extract function bodies
function extractFn(src, name) {
  const start = src.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('Function ' + name + ' not found');
  let depth = 0, i = start;
  let inString = false, strChar = '';
  for (; i < src.length; i++) {
    const ch = src[i];
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === strChar) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = true; strChar = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) break; }
  }
  return src.substring(start, i + 1);
}

// Extract and combine
const fmtFn = extractFn(html, 'fmt');
const optFn = extractFn(html, 'optimizeSVG');
const jsxFn = extractFn(html, 'svgToJsx');

const srcCode = `${fmtFn}\n${optFn}\n${jsxFn}`;

// Create evaluation context with jsdom APIs
const { window } = new JSDOM('<html><body></body></html>');
const ctx = {
  DOMParser: window.DOMParser,
  XMLSerializer: window.XMLSerializer,
  Blob: window.Blob,
  console: console,
};
vm = require('vm');
vm.runInNewContext(srcCode, ctx);

// Now test
const tests = []; let passed = 0, failed = 0;
function test(name, fn) { tests.push({ name, fn }); }
function assert(cond, msg) { if (!cond) throw new Error('FAIL: ' + msg); }

test('T1: Figma export - strip metadata/comments/editor attrs', () => {
  const svg = fs.readFileSync(path.join(__dirname, 'test1-figma-export.svg'), 'utf-8');
  const r = ctx.optimizeSVG(svg);
  assert(r.originalSize > r.optimizedSize, 'Size reduced');
  assert(!r.optimized.includes('<metadata'), 'Metadata stripped');
  assert(!r.optimized.includes('<title>'), 'Title stripped');
  assert(!r.optimized.includes('<desc>'), 'Desc stripped');
  assert(!r.optimized.includes('inkscape:'), 'Editor attrs stripped');
  assert(!r.optimized.includes('display:none'), 'Hidden elements removed');
  assert(!r.optimized.includes('unused-grad'), 'Unused defs removed');
  assert(r.optimized.includes('used-grad'), 'Used defs kept');
  assert(!r.optimized.includes('#ff6600'), 'Short hex #ff6600→#f60');
  return `Saved ${r.percent}% (${ctx.fmt(r.saved)}, ${r.changes} changes)`;
});

test('T2: Default attribute cleanup', () => {
  const svg = fs.readFileSync(path.join(__dirname, 'test2-default-attrs.svg'), 'utf-8');
  const r = ctx.optimizeSVG(svg);
  assert(!r.optimized.includes('enable-background'), 'enable-background stripped');
  assert(!r.optimized.includes('matrix(1,0,0,1,0,0)'), 'Identity matrix stripped');
  assert(!r.optimized.includes('display="inline"'), 'display:inline stripped');
  assert(r.changes > 0, 'Multiple changes made');
  return `Cleaned ${r.changes} attributes, saved ${r.percent}%`;
});

test('T3: Invalid SVG returns error', () => {
  const r = ctx.optimizeSVG('not svg');
  assert(r.error, 'Should return error');
  return 'Correctly rejected: ' + r.error;
});

test('T4: Output re-compressable', () => {
  const svg = fs.readFileSync(path.join(__dirname, 'test1-figma-export.svg'), 'utf-8');
  const r1 = ctx.optimizeSVG(svg);
  const r2 = ctx.optimizeSVG(r1.optimized);
  assert(!r2.error, 'Second pass should not error');
  return `Stable output (+${Math.abs(r2.percent)}% extra in 2nd pass)`;
});

test('T5: XML declaration stripped', () => {
  const svg = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';
  const r = ctx.optimizeSVG(svg);
  assert(!r.optimized.includes('<?xml'), 'XML stripped');
  return 'XML declaration removed';
});

test('T6: JSX conversion', () => {
  const svg = '<svg class="icon" clip-path="url(#c)" stroke-width="2"><path fill-rule="evenodd"/></svg>';
  const jsx = ctx.svgToJsx(svg);
  assert(jsx.includes('className='), 'class → className');
  assert(jsx.includes('clipPath='), 'clip-path → clipPath');
  assert(jsx.includes('fillRule='), 'fill-rule → fillRule');
  assert(jsx.includes('strokeWidth='), 'stroke-width → strokeWidth');
  return 'JSX: ' + jsx.substring(0, 90);
});

test('T7: No crash on minimal SVG', () => {
  const r = ctx.optimizeSVG('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>');
  assert(r.optimized, 'Output exists');
  assert(!r.error, 'No error');
  return 'Minimal SVG OK';
});

test('T8: Decimal trimming', () => {
  const svg = '<svg viewBox="0 0 100.000000 100.000000"><circle cx="50.123456" r="10.222222"/></svg>';
  const r = ctx.optimizeSVG(svg);
  assert(!r.optimized.includes('100.000000'), 'viewBox precision');
  assert(!r.optimized.includes('50.123456'), 'Coord precision');
  return 'Precision trimmed: ' + r.optimized.substring(0, 100);
});

console.log('\n=== SVG Compressor v2 — Test Suite ===\n');
for (const t of tests) {
  try {
    const d = t.fn();
    console.log('  ✅ ' + t.name);
    console.log('     ' + d);
    passed++;
  } catch (e) {
    console.log('  ❌ ' + t.name);
    console.log('     ' + e.message);
    failed++;
  }
}
console.log('\n=== ' + passed + '/' + tests.length + ' passed ===\n');
process.exit(failed > 0 ? 1 : 0);
