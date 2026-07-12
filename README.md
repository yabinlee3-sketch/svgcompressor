# SVG Compressor

Online SVG compression tool. 100% browser-based — your files never leave your device.

## Features
- Drag & drop SVG optimization
- Remove editor metadata (Illustrator, Inkscape, Sketch, Figma)
- Remove empty elements, unused attributes
- Minify colors and trim decimal precision
- Before/after preview with size comparison
- Batch process multiple files
- Dark/light theme

## Tech Stack
- Vanilla HTML/CSS/JS (zero dependencies)
- Browser-native SVG processing (DOMParser + XMLSerializer)
- No server, no upload, no database
- Hosted on Cloudflare Pages

## Monetization
- Free: unlimited single-file optimization
- Pro ($4.99 one-time): batch 50+ files, SVG→JSX, max compression
- Payments via LemonSqueezy

## Deployment
```bash
npm start
npm run deploy
```

## Roadmap
- Core SVG optimizer with drag-drop (MVP)
- Batch processing (multi-file)
- Pro version with LemonSqueezy payments
- SVG → JSX/React converter
- Second tool: CSS minifier
- SEO for long-tail keywords

## License
MIT
