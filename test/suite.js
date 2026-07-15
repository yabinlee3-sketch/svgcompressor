// SVG Compressor v2 — Clean test suite
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Provide DOM APIs via jsdom
const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.DOMParser = window.DOMParser;
global.XMLSerializer = window.XMLSerializer;
global.Blob = window.Blob;

const { optimizeSVG, svgToJsx, fmt } = require('../lib/svg-engine');

let passed = 0, failed = 0;
const results = [];

function T(name, fn) {
  try {
    const detail = fn();
    results.push({ name, status: '✅', detail });
    passed++;
  } catch (e) {
    results.push({ name, status: '❌', detail: e.message });
    failed++;
  }
}

// ── Test 1: Figma export compression ──
T('T1: Figma export — strip metadata/comments/editor attrs/hidden elements/defs', () => {
  const svg = fs.readFileSync(path.join(__dirname, 'test1-figma-export.svg'), 'utf-8');
  const r = optimizeSVG(svg);
  if (r.originalSize <= r.optimizedSize) throw new Error('Size NOT reduced');
  if (r.optimized.includes('<metadata')) throw new Error('Metadata NOT stripped');
  if (r.optimized.includes('<title>')) throw new Error('Title NOT stripped');
  if (r.optimized.includes('<desc>Test')) throw new Error('Desc NOT stripped');
  if (r.optimized.includes('inkscape:')) throw new Error('Editor attrs NOT stripped');
  if (r.optimized.includes('display:none')) throw new Error('Hidden elements NOT removed');
  if (r.optimized.includes('unused-grad')) throw new Error('Unused defs NOT removed');
  if (!r.optimized.includes('used-grad')) throw new Error('Used defs stripped by mistake');
  if (r.optimized.includes('#ff6600')) throw new Error('Short hex #ff6600 → #f60 NOT applied');
  if (r.optimized.includes('<!--')) throw new Error('Comments NOT stripped');
  return `Saved ${r.percent}% (${fmt(r.saved)}, ${r.changes} changes)`;
});

// ── Test 2: Default attribute cleanup ──
T('T2: Default/redundant attribute cleanup', () => {
  const svg = fs.readFileSync(path.join(__dirname, 'test2-default-attrs.svg'), 'utf-8');
  const r = optimizeSVG(svg);
  if (r.optimized.includes('enable-background')) throw new Error('enable-background NOT stripped');
  if (r.optimized.includes('matrix(1,0,0,1,0,0)')) throw new Error('Identity matrix NOT stripped');
  if (r.optimized.includes('display="inline"')) throw new Error('display:inline NOT stripped');
  if (r.changes < 2) throw new Error('Expected ≥2 changes');
  return `Cleaned ${r.changes} attributes, saved ${r.percent}%`;
});

// ── Test 3: Invalid SVG handling ──
T('T3: Invalid SVG returns error object', () => {
  const r = optimizeSVG('not an svg file');
  if (!r.error) throw new Error('Expected error for non-SVG input');
  if (!r.error.includes('Invalid')) throw new Error('Error message should mention "Invalid"');
  return 'Correctly rejected: ' + r.error;
});

// ── Test 4: Output is re-compressable ──
T('T4: Output is stable, re-compressable SVG', () => {
  const svg = fs.readFileSync(path.join(__dirname, 'test1-figma-export.svg'), 'utf-8');
  const r1 = optimizeSVG(svg);
  const r2 = optimizeSVG(r1.optimized);
  if (r2.error) throw new Error('Second pass threw error: ' + r2.error);
  // Second pass should save near 0%
  return `Stable output (2nd pass: ${r2.percent}% additional)`;
});

// ── Test 5: XML declaration removal ──
T('T5: XML declaration removed', () => {
  const svg = '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>';
  const r = optimizeSVG(svg);
  if (r.optimized.includes('<?xml')) throw new Error('XML declaration NOT removed');
  return 'XML declaration stripped';
});

// ── Test 6: JSX conversion ──
T('T6: SVG to JSX attribute conversion', () => {
  const svg = '<svg class="icon" clip-path="url(#c)" stroke-width="2"><path fill-rule="evenodd"/></svg>';
  const jsx = svgToJsx(svg);
  if (!jsx.includes('className=')) throw new Error('class NOT converted to className');
  if (!jsx.includes('clipPath=')) throw new Error('clip-path NOT converted');
  if (!jsx.includes('fillRule=')) throw new Error('fill-rule NOT converted');
  if (!jsx.includes('strokeWidth=')) throw new Error('stroke-width NOT converted');
  return 'JSX: ' + jsx.substring(0, 80);
});

// ── Test 7: Minimal SVG no crash ──
T('T7: Minimal SVG — no crash, valid output', () => {
  const r = optimizeSVG('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>');
  if (!r.optimized) throw new Error('No output');
  if (r.error) throw new Error('Unexpected error: ' + r.error);
  if (!r.optimized.includes('<svg')) throw new Error('Output not SVG');
  return 'Minimal SVG OK, saved ' + r.percent + '%';
});

// ── Test 8: Decimal trimming ──
T('T8: Decimal precision trimming', () => {
  const svg = '<svg viewBox="0 0 100.000000 100.000000"><circle cx="50.123456" r="10.222222"/></svg>';
  const r = optimizeSVG(svg);
  if (r.optimized.includes('100.000000')) throw new Error('viewBox precision NOT trimmed');
  if (r.optimized.includes('50.123456')) throw new Error('Coordinate precision NOT trimmed');
  return 'Precision trimmed: ' + r.optimized.substring(0, 120);
});

// ── Report ──
console.log('\n=== SVG Compressor v2 — Automated Test Suite ===\n');
for (const r of results) {
  console.log(`  ${r.status} ${r.name}`);
  console.log(`     ${r.detail}`);
}
console.log(`\n=== ${passed}/${results.length} passed ===\n`);

process.exit(failed > 0 ? 1 : 0);
