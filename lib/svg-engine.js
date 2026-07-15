// SVG Compressor - standalone compression engine
// Extracted for testability
// @ts-nocheck

function fmt(b) {
  if (!b) return '0 B';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

function optimizeSVG(t) {
  try {
    let d = new DOMParser().parseFromString(t, 'image/svg+xml'),
      s = d.documentElement;
    if (s.tagName !== 'svg') return { error: 'Invalid SVG' };
    let n = new Blob([t]).size,
      c = 0;

    // Remove comments
    function rmComments(e) {
      for (let i = e.childNodes.length - 1; i >= 0; i--) {
        let ch = e.childNodes[i];
        if (ch.nodeType === 8) { e.removeChild(ch); c++; }
        else if (ch.nodeType === 1) rmComments(ch);
      }
    }
    rmComments(s);

    // Remove metadata/title/desc
    function rmMeta(e) {
      var rm = [];
      for (let ch of e.children) {
        rmMeta(ch);
        if (ch.tagName === 'metadata' || ch.tagName === 'title' || ch.tagName === 'desc')
          rm.push(ch);
      }
      for (let el of rm) { e.removeChild(el); c++; }
    }
    rmMeta(s);

    // Remove hidden/display:none elements
    function rmHidden(e) {
      for (let i = e.children.length - 1; i >= 0; i--) {
        rmHidden(e.children[i]);
        var st = e.children[i].getAttribute('style');
        if (st && (st.indexOf('display:none') >= 0 || st.indexOf('visibility:hidden') >= 0)) {
          e.removeChild(e.children[i]); c++;
        } else if (
          e.children[i].getAttribute('display') === 'none' ||
          e.children[i].getAttribute('visibility') === 'hidden'
        ) {
          e.removeChild(e.children[i]); c++;
        }
      }
    }
    rmHidden(s);

    // Remove empty elements
    function rmEmpty(e) {
      for (let ch of [...e.children]) {
        rmEmpty(ch);
        let h = ch.children.length > 0,
          t = ch.textContent.trim().length > 0,
          a = [...ch.attributes].some(
            at => at.name !== 'xmlns' && !at.name.startsWith('xmlns:')
          );
        if (!h && !t && !a && ch.parentNode) {
          ch.parentNode.removeChild(ch); c++;
        }
      }
    }
    rmEmpty(s);

    // Remove editor attributes aggressively
    var ed = ['inkscape','illustrator','sketch','figma','sodipodi','corel','adobe','freehand','xaml'];
    function rmEditor(e) {
      if (!e.attributes) return;
      var rm = [];
      for (var a of e.attributes) {
        var l = a.name.toLowerCase(),
          v = a.value.toLowerCase();
        if (ed.some(function(p) { return l.startsWith(p) || l.indexOf(':' + p) >= 0; }))
          rm.push(a.name);
        if (
          (l === 'fill' && (v === '#000' || v === '#000000')) ||
          (l === 'stroke' && (v === '#000' || v === '#000000')) ||
          (l === 'stroke-width' && (v === '0' || v === '0px')) ||
          (l === 'opacity' && v === '1') ||
          (l === 'fill-opacity' && v === '1') ||
          (l === 'stroke-opacity' && v === '1') ||
          (l === 'transform' && v === 'matrix(1,0,0,1,0,0)') ||
          (l === 'display' && v === 'inline') ||
          (l === 'enable-background') ||
          ed.some(function(p) { return l.indexOf(p) >= 0; })
        )
          rm.push(a.name);
      }
      for (var i = 0; i < rm.length; i++) { e.removeAttribute(rm[i]); c++; }
      for (var ch of e.children) rmEditor(ch);
    }
    rmEditor(s);

    // Remove unused defs (gradients/filters)
    function rmDefs(e) {
      var defs = e.querySelector('defs');
      if (!defs) return;
      var used = {};
      function scan(el) {
        if (el === defs) return;
        if (el.attributes) {
          for (var i = 0; i < el.attributes.length; i++) {
            var val = el.attributes[i].value;
            var m = val.match(/url\(#([^)]+)\)/g);
            if (m) { for (var j = 0; j < m.length; j++) { used[m[j].slice(5, -1)] = true; } }
          }
        }
        for (var k = 0; k < el.children.length; k++) scan(el.children[k]);
      }
      scan(e);
      for (var i = defs.children.length - 1; i >= 0; i--) {
        var ch = defs.children[i];
        var id = ch.getAttribute('id');
        if (id && !used[id]) { defs.removeChild(ch); c++; }
      }
    }
    rmDefs(s);

    // Shorten hex colors
    function minColors(e) {
      if (!e.attributes) return;
      for (var a of e.attributes) {
        var v = a.value.trim().toLowerCase();
        if (/^#[0-9a-f]{6}$/i.test(v) && v[1] === v[2] && v[3] === v[4] && v[5] === v[6]) {
          a.value = '#' + v[1] + v[3] + v[5]; c++;
        }
      }
      for (var ch of e.children) minColors(ch);
    }
    minColors(s);

    // Remove empty <g> groups
    function collapse(e) {
      if (
        e.tagName === 'g' && e.children.length === 1 && e.attributes.length === 0
      ) {
        var ch = e.children[0];
        e.parentNode.insertBefore(ch, e);
        e.parentNode.removeChild(e); c++;
        return;
      }
      for (var i = e.children.length - 1; i >= 0; i--) collapse(e.children[i]);
    }
    collapse(s);

    // Trim decimal precision
    function trimDec(e) {
      if (!e.attributes) return;
      for (var a of e.attributes) {
        var nm = a.name,
          prec = (nm === 'viewBox' || nm === 'd' || nm === 'transform' || nm === 'points') ? 4 : 2;
        a.value = a.value.replace(/(\d+\.\d{4,})/g, function(m) {
          var n = parseFloat(m);
          return isNaN(n) ? m : parseFloat(n.toFixed(prec)).toString();
        });
      }
      for (var ch of e.children) trimDec(ch);
    }
    trimDec(s);

    // Final serialization with aggressive cleanup
    var o = new XMLSerializer().serializeToString(s)
      .replace(/<\?xml[^>]*\?>/g, '')
      .replace(/ xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/g, '')
      .replace(/ xmlns=""| xmlns:(\w+)=""/g, '')
      .replace(/ xml:\w+="[^"]*"/g, '')
      .replace(/[a-zA-Z]+:\w+="[^"]*"/g, '')
      .replace(/>\s+</g, '><')
      .trim();
    var ns = new Blob([o]).size;
    return {
      original: t,
      optimized: o,
      originalSize: n,
      optimizedSize: ns,
      saved: n - ns,
      percent: n > 0 ? Math.round((n - ns) / n * 100) : 0,
      changes: c,
    };
  } catch (er) {
    var os = new Blob([t]).size;
    return {
      original: t, optimized: t, originalSize: os, optimizedSize: os,
      saved: 0, percent: 0, changes: 0, error: er.message,
    };
  }
}

function svgToJsx(t) {
  var m = {
    class: 'className',
    'clip-path': 'clipPath',
    'clip-rule': 'clipRule',
    'fill-rule': 'fillRule',
    'fill-opacity': 'fillOpacity',
    'stroke-opacity': 'strokeOpacity',
    'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'stroke-miterlimit': 'strokeMiterlimit',
    'stop-color': 'stopColor',
    'stop-opacity': 'stopOpacity',
    'font-family': 'fontFamily',
    'font-size': 'fontSize',
    'font-weight': 'fontWeight',
    'text-anchor': 'textAnchor',
    'xmlns:xlink': '',
  };
  var r = t;
  for (var k in m) {
    var v = m[k];
    if (v) r = r.replace(new RegExp(k + '=', 'g'), v + '=');
    else r = r.replace(new RegExp(k, 'g'), '');
  }
  r = r.replace(/ xmlns:?\w*="[^"]*"/g, '');
  return r;
}

module.exports = { optimizeSVG, svgToJsx, fmt };
