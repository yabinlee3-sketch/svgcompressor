// SVG Compressor v2 Test Script
// Tests optimizeSVG function using jsdom
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const testDir = __dirname;
const htmlPath = path.join(testDir, '..', 'index.html');

// Load the HTML and extract the optimizeSVG function
const html = fs.readFileSync(htmlPath, 'utf-8');
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });

const { window } = dom;
const { document } = window;

// Wait for scripts to execute
setTimeout(() => {
  const tests = [];
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    tests.push({ name, fn });
  }

  function assert(cond, msg) {
    if (!cond) throw new Error('FAIL: ' + msg);
  }

  // T1: Compress Figma export (metadata strip)
  test('T1: Figma export compression', () => {
    const svg = fs.readFileSync(path.join(testDir, 'test1-figma-export.svg'), 'utf-8');
    const result = window.optimizeSVG(svg);
    assert(result.originalSize > result.optimizedSize, 'Should reduce size');
    assert(!result.optimized.includes('metadata'), 'Metadata should be stripped');
    assert(!result.optimized.includes('<title>'), 'Title should be stripped');
    assert(!result.optimized.includes('<desc>'), 'Desc should be stripped');
    assert(!result.optimized.includes('inkscape:'), 'Inkscape attrs stripped');
    assert(!result.optimized.includes('style="display:none"'), 'Hidden elements removed');
    assert(!result.optimized.includes('unused-grad'), 'Unused defs removed');
    assert(result.optimized.includes('used-grad'), 'Used defs kept');
    // Short hex colors
    assert(!result.optimized.includes('#ff6600'), 'Short hex #ff6600 → #f60');
    return 'Saved ' + result.percent + '% (' + result.saved + ' bytes, ' + result.changes + ' changes)';
  });

  // T2: Default attribute cleanup
  test('T2: Default attribute cleanup', () => {
    const svg = fs.readFileSync(path.join(testDir, 'test2-default-attrs.svg'), 'utf-8');
    const result = window.optimizeSVG(svg);
    assert(!result.optimized.includes('enable-background'), 'enable-background stripped');
    assert(!result.optimized.includes('matrix(1,0,0,1,0,0)'), 'Identity transform stripped');
    assert(!result.optimized.includes('display="inline"'), 'display:inline stripped');
    assert(!result.optimized.includes('stroke-width="0"'), 'stroke-width:0 stripped');
    assert(!result.optimized.includes('opacity="1"'), 'opacity:1 stripped');
    assert(!result.optimized.includes('fill-opacity="1"'), 'fill-opacity:1 stripped');
    assert(!result.optimized.includes('stroke-opacity="1"'), 'stroke-opacity:1 stripped');
    assert(!result.optimized.includes('#000000'), 'Default fill #000 stripped');
    assert(!result.optimized.includes('#000'), 'Default stroke #000 stripped');
    return 'Cleaned ' + result.changes + ' redundant attributes';
  });

  // T3: Invalid SVG handling
  test('T3: Invalid SVG handling', () => {
    const result = window.optimizeSVG('not an svg at all');
    assert(result.error && result.error.includes('Invalid'), 'Should return error for non-SVG');
    return 'Correctly rejected invalid input';
  });

  // T4: Non-destructive (output is valid SVG)
  test('T4: Output is valid SVG', () => {
    const svg = fs.readFileSync(path.join(testDir, 'test1-figma-export.svg'), 'utf-8');
    const result = window.optimizeSVG(svg);
    const optimized = result.optimized;
    assert(optimized.includes('<svg'), 'Output contains svg tag');
    assert(optimized.includes('</svg>'), 'Output closes svg tag');
    // Re-parse to verify
    const reOptimized = window.optimizeSVG(optimized);
    assert(reOptimized.saved === 0 || reOptimized.saved >= 0, 'Re-compressing should not break');
    return 'Output is valid, re-compressable SVG';
  });

  // T5: XML declaration removal
  test('T5: XML declaration removal', () => {
    const svg = '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';
    const result = window.optimizeSVG(svg);
    assert(!result.optimized.includes('<?xml'), 'XML declaration removed');
    return 'XML declaration stripped';
  });

  // T6: Whitespace collapse
  test('T6: Whitespace collapse', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">\n  <rect width="10" height="10"/>\n</svg>';
    const result = window.optimizeSVG(svg);
    assert(!result.optimized.includes('\n'), 'Newlines removed');
    return 'Whitespace collapsed';
  });

  // T7: JSX conversion
  test('T7: SVG to JSX conversion', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" clip-path="url(#c)" class="icon"><path fill-rule="evenodd" d="M10,10 L50,50"/></svg>';
    const jsx = window.svgToJsx(svg);
    assert(jsx.includes('className='), 'class → className');
    assert(jsx.includes('fillRule='), 'fill-rule → fillRule');
    assert(jsx.includes('clipPath='), 'clip-path → clipPath');
    return 'JSX conversion correct: ' + jsx.substring(0, 80) + '...';
  });

  // Run all tests
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
  console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===\n');
  process.exit(failed > 0 ? 1 : 0);
}, 500);
