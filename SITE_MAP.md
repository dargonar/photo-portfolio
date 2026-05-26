# Pablo Tutino — Photography Portfolio

## Stack
Next.js 15 · Tailwind CSS 4 · Framer Motion · PT Mono · Dark theme (#000 bg)

---

## Screens

### 1. Home — Carousel
Full-screen image carousel. One photo per serie, auto-cycling with fade transition.
- **Header**: fixed, black/80 blur. Left: "Pablo Tutino". Center: category links (desktop). Right: NRD icon + ES/EN + INFO
- **Footer overlay** (bottom-left): serie name + year in small mono text
- **Mobile**: hamburger → fullscreen menu (NRD + lang / separator / categories / separator / INFO)

### 2. Category — Grid
Lists all series within a category as 2×2 (mobile) or 4×1 (desktop) thumbnail grids.
- **Breadcrumb**: category name, small uppercase tracking-widest
- **Each serie**: 4 thumbnails in a grid row. First thumb has overlay with serie name + year. Hover: slight scale

### 3. Serie — Masonry Gallery
All photos of a serie in a responsive masonry layout (1/2/3 columns).
- **Breadcrumb**: category › serie name — year (small, uppercase)
- **Photos**: click opens lightbox

### 4. Serie Lightbox
Full-screen overlay: header (serie title + close) · content (photo fills space, prev/next arrows overlay) · footer (horizontal thumbnail strip).
- Keyboard: ← → Esc
- **Mobile**: photo = full width, arrows on top of image

---

## Shared Components

- **Header**: PT Mono, text-lg. Mobile: hamburger fullscreen menu. Nerd toggle = icon with border (off: invert filter, on: white bg)
- **Footer**: Instagram SVG icon, centered
- **Nerd Mode**: EXIF overlay on gallery thumbnails (iso, aperture, shutter, focal, flash, editor)
- **i18n**: EN/ES toggle, browser auto-detect. Keys in config.json (serie_name / serie_name_es)
- **Page transitions**: Framer Motion fade (opacity 0→1)

## Categories & Series

| Category | Series |
|----------|--------|
| Intimate | B&W (18), Street-Theatre (13), Knots (6) |
| Projects | ADHD (6), El Nono (6) |
| Body-Dialogues | Night Speed (15), Water-Soluble Oil (47), Inhabiting the Recovery (14), Light BDSM (13), Skin Landscape (23) |

## Design Notes
- Terminal/data aesthetic. Black bg, white text, PT Mono
- Minimal UI, photography is the focus
- No scrollbars visible (4px custom)
- Static export (Netlify)
