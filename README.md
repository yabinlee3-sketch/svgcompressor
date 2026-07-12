# SVG Compressor

> **Free online SVG optimizer. 100% browser-based, no uploads needed.**

[![Live Demo](https://img.shields.io/badge/demo-svgcompressor.pages.dev-6c5ce7)](https://svgcompressor.pages.dev/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Compress Figma, Illustrator and Sketch SVG exports by 30-70% in one click.** All processing happens in your browser — your files never leave your device.

## Features

- **100% browser-side** — no uploads, no servers, no privacy concerns
- **30%+ compression** — tested on real Figma/Illustrator exports
- **Removes:** metadata, comments, hidden elements, unused gradients, editor attributes
- **Shortens** hex colors, collapses groups, trims decimal precision
- **Free tier:** 3 files per batch
- **Pro ($4.99 lifetime):** Unlimited files, SVG to JSX conversion, max compression

## How to Use

1. Open https://svgcompressor.pages.dev/
2. Drag SVG files onto the drop zone
3. Download optimized files
4. (Optional) Upgrade to Pro for unlimited usage

## Tech Stack

- **Frontend:** Vanilla JS, DOMParser
- **Optimization:** Custom SVGO-like DOM optimizer (7+ optimization steps)
- **Payments:** Lemon Squeezy (license key via email)
- **Backend:** Cloudflare Workers (key verification, webhook handling)
- **Storage:** Cloudflare Workers KV
- **Auth:** License key (no account needed)

## Directory Structure

```
├── index.html           # Main app (single HTML file)
├── blog/                # SEO blog articles
├── worker/              # Cloudflare Worker
│   └── src/index.js     # API endpoints
├── _headers             # Security headers
├── _redirects           # URL redirects
├── sitemap.xml          # SEO sitemap
└── robots.txt           # Crawler rules
```
