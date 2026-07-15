# SVG Compressor v2 Test Plan

## Test Setup
Serve `index.html` locally and test in browser.

## Test Cases

### T1: Folder Drag (PH #1 - Murat)
1. Create a test folder with 3+ SVG files
2. Drag folder onto dropzone
3. **Expect**: All SVGs loaded, thumbnails shown, batch compressed
4. **Expect**: Thumbnail grid rendered with correct count

### T2: Side-by-Side Preview (existing)
1. Upload multiple SVGs
2. Click "Side by Side" button
3. **Expect**: Original left, Optimized right panel
4. **Expect**: Clicking file item switches preview

### T3: Overlay Compare (PH #2 - Erdem)
1. Upload SVGs
2. Click "Overlay Compare"
3. **Expect**: Overlay view with split slider visible
4. Drag slider handle → split moves
5. **Expect**: Labels "Original" / "Optimized" visible

### T4: Privacy Badge (PH #3 - Nuran)
1. Load page
2. **Expect**: "🔒 100% Local · Zero Upload" badge visible in header

### T5: Thumbnail Grid
1. Upload 2+ SVGs
2. **Expect**: Thumbnail grid appears with each file
3. Click thumbnail → file item highlighted, preview updated

### T6: Folder Hint
1. Load page
2. **Expect**: "📂 Drop a folder..." hint visible in dropzone

### T7: Batch Download (existing regression)
1. Upload 3 SVGs
2. Click "Download All"
3. **Expect**: All files zipped and downloaded

### T8: Single File Flow (regression)
1. Upload 1 SVG
2. **Expect**: Compresses, preview works, download works

### T9: Non-SVG Skip
1. Upload mix of SVGs + PNG
2. **Expect**: PNG skipped, SVGs processed

### T10: Free Limit (regression)
1. Clear localStorage
2. Upload 4+ SVGs
3. **Expect**: Limited to 3, toast message shown
