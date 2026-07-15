// Standalone SVG compressor test - extracts functions from HTML and runs with Node.js DOMParser
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Extract JS from the HTML
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) { console.log('No script found in HTML'); process.exit(1); }

// Evaluate the JS in a VM with DOMParser support
const vm = require('vm');
const ctx = {
  DOMParser: (class { parseFromString() { throw new Error('noop'); } }).bind(null),
  XMLSerializer: (class { serializeToString() { return ''; } }).bind(null),
  Blob: (class { constructor() {} }),
  document: {
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    createElement() { return { style: {} }; },
    body: { classList: { contains() { return false; }, add() {}, remove() {} }, addEventListener() {}, appendChild() {} },
    documentElement: { classList: { contains() { return false; }, add() {}, remove() {} } }
  },
  matchMedia() { return { matches: false, addEventListener() {} }; },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  navigator: { clipboard: { writeText() { return Promise.resolve(); } }, sendBeacon() { return false; } },
  fetch() { return Promise.resolve({ ok: true, json() { return Promise.resolve({}); } }); },
  window: global,
  setTimeout: setTimeout,
  URL: {
    createObjectURL() { return 'blob:test'; },
    revokeObjectURL() {}
  },
  JSZip: undefined,
  console: console,
  toast() {},
  track() {},
};

ctx.window = ctx;

// Create a proper DOMParser environment
const { window: jsdomWindow } = new JSDOM('<html><body></body></html>', { url: 'http://localhost' });
ctx.DOMParser = jsdomWindow.DOMParser;
ctx.XMLSerializer = jsdomWindow.XMLSerializer;
ctx.Blob = jsdomWindow.Blob;

const script = vm.createScript(scriptMatch[1]);
script.runInNewContext(ctx);

// Now test
const tests = [];
let passed = 0, failed = 0;

function test(name, fn) { tests.push({ name, fn }); }
function assert(cond, msg) { if (!cond) throw new Error('FAIL: ' + msg); }

function fmt(b) { if (!b) return '0 B'; if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'; return (b / 1048576).toFixed(1) + ' MB'; }

// T1: Figma export compression
test('T1: Figma export - metadata, comments, hidden elements stripped', () => {
  const svg = fs.readFileSync(path.join(__dirname, 'test1-figma-export.svg'), 'utf-8');
  const result = ctx.optimizeSVG(svg);
  assert(result.originalSize > result.optimizedSize, 'Should reduce size');
  assert(!result.optimized.includes('<metadata'), 'Metadata stripped');
  assert(!result.optimized.includes('<title>'), 'Title stripped');
  assert(!result.optimized.includes('<desc>Test'), 'Desc stripped');
  assert(!result.optimized.includes('inkscape:'), 'Editor attrs stripped');
  assert(!result.optimized.includes('display:none'), 'Hidden elements removed');
  assert(!result.optimized.includes('unused-grad'), 'Unused defs removed');
  assert(result.optimized.includes('used-grad'), 'Used defs kept');
  assert(!result.optimized.includes('<!--'), 'Comments stripped');
  return `Saved ${result.percent}% (${fmt(result.saved)}, ${result.changes} changes)`;
});

// T2: Default attribute cleanup
test('T2: Default/redundant attribute cleanup', () => {
  const svg = fs.readFileSync(path.join(__dirname, 'test2-default-attrs.svg'), 'utf-8');
  const result = ctx.optimizeSVG(svg);
  assert(!result.optimized.includes('enable-background'), 'enable-background stripped');
  assert(!result.optimized.includes('matrix(1,0,0,1,0,0)'), 'Identity transform stripped');
  assert(!result.optimized.includes('display="inline"'), 'display:inline stripped');
  assert(!result.optimized.includes('stroke-width="0"'), 'stroke-width:0 stripped');
  return `Cleaned ${result.changes} redundant attributes, saved ${result.percent}%`;
});

// T3: Invalid input
test('T3: Invalid SVG returns error', () => {
  const result = ctx.optimizeSVG('not an svg');
  assert(result.error, 'Should return error');
  return 'Correctly rejected: ' + result.error;
});

// T4: Output is valid SVG
test('T4: Output is re-compressable SVG', () => {
  const svg = fs.readFileSync(path.join(__dirname, 'test1-figma-export.svg'), 'utf-8');
  const r1 = ctx.optimizeSVG(svg);
  const r2 = ctx.optimizeSVG(r1.optimized);
  assert(r2.saved === 0 || r2.saved >= 0, 'Re-compress should not error');
  return 'Re-compression OK (stable: ' + r2.percent + '% additional savings)';
});

// T5: XML declaration
test('T5: XML declaration removal', () => {
  const svg = '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';
  const result = ctx.optimizeSVG(svg);
  assert(!result.optimized.includes('<?xml'), 'XML declaration removed');
  return 'XML declaration stripped';
});

// T6: JSX conversion
test('T6: SVG to JSX conversion', () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="icon" clip-path="url(#c)"><path fill-rule="evenodd"/></svg>';
  const jsx = ctx.svgToJsx(svg);
  assert(jsx.includes('className='), 'class → className');
  assert(jsx.includes('fillRule='), 'fill-rule → fillRule');
  assert(jsx.includes('clipPath='), 'clip-path → clipPath');
  return 'JSX: ' + jsx.substring(0, 100);
});

// T7: Minimal SVG (no crash)
test('T7: Minimal SVG - no crash', () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>';
  const result = ctx.optimizeSVG(svg);
  assert(result.optimized, 'Should produce output');
  assert(!result.error, 'Should not error');
  return 'Minimal SVG OK, saved ' + result.percent + '%';
});

// T8: Decimal precision trim
test('T8: Decimal precision trimming', () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100.000000 100.000000"><circle cx="50.123456" cy="50.123456" r="25.123456"/></svg>';
  const result = ctx.optimizeSVG(svg);
  assert(!result.optimized.includes('100.000000'), 'viewBox precision trimmed');
  assert(!result.optimized.includes('50.123456'), 'coordinate precision trimmed');
  return 'Decimal precision trimmed';
});

console.log('\n=== SVG Compressor v2 Test Suite ===\n');
for (const t of tests) {
  try {
    const detail = t.fn();
    console.log('  ✅ ' + t.name);
    console.log('     ' + detail);
    passed++;
  } catch (e) {
    console.log('  ❌ ' + t.name);
    console.log('     ' + e.message);
    failed++;
  }
}
console.log('\n=== Results: ' + passed + '/' + tests.length + ' passed ===\n');
process.exit(failed > 0 ? 1 : 0);
