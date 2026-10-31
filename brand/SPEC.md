# Bodhi Labs — brand spec

One page. Everything a designer or developer needs to use the identity without asking.

## Name and meaning

**Bodhi** — awakening, clarity. **.si** — superintelligence, the direction the company is building toward. The domain is the name; the wordmark sets it as `bodhi` in the display face and `.si` in the mono face, in the accent colour.

## Positioning

Bodhi Labs builds the data layer that AI systems depend on, and the AI workflows that run on it — structuring unstructured and sensitive data, resolving identities across fragmented records, and building the evaluation and federated environments that prove the results — for research labs, commerce companies, frontier AI teams, and organisations putting AI to work for the first time, in India and the US.

Triad: **Structure. Resolve. Prove.** The three verbs are the three services, the three main sections of the site, and the three bars of the mark.

## Logo

Files in `brand/logo/`. All glyphs are outlined paths; no fonts required.

| File | Use |
|---|---|
| `bodhi-lockup-{color,mono,reversed}.svg` | Mark + wordmark. Site header, documents, decks. |
| `bodhi-wordmark-{color,mono,reversed}.svg` | Wordmark alone. Where the mark would be redundant. |
| `bodhi-mark-{color,mono,reversed}.svg` | Mark alone, 24-unit grid. Anything under 120px wide. |
| `favicon.svg` | Mark on a paper tile. Holds up on dark tab bars. |
| `bodhi-avatar.svg` | Square social avatar. |

- **Wordmark:** Newsreader, weight 460, optical size 72. `.si` in Geist Mono 500 at 80.4% of the display size, which matches x-heights exactly (Newsreader 0.426 em, Geist Mono 0.530 em). Period pulled back 0.11 em to cancel the mono cell's left-side air.
- **Mark:** three bars. The middle bar is two segments joined by one square point — two records resolved into one. Only the point carries the accent.
- **Clear space:** the mark's height on all sides.
- **Minimum size:** lockup 120 px wide, wordmark 90 px, mark 16 px.
- **Colour:** `color` on paper, `reversed` on deep, `mono` on photographs or any other ground. Never recolour.
- **Never** set the wordmark in live type.
- Regenerate with `brand/make_logo.py <fonts_dir> brand/logo` (needs fonttools + uharfbuzz; fonts are Newsreader and Geist Mono variable TTFs from google/fonts, both OFL).

## Colour — "Dawn"

From Sanzo Wada, *A Dictionary of Color Combinations*, via the dblodorn digitisation (CMYK → sRGB; the repo notes not every value is faithful to print). Backgrounds are Ivory Buff tinted toward white. Full token file: `brand/tokens.css`. Reference table: `brand/reference/sanzo-wada-colors.txt`.

| Token | Hex | Wada name | Contrast |
|---|---|---|---|
| `--bg` | `#f9f4e2` | Ivory Buff · 72% white | — |
| `--bg-2` | `#f4eac7` | Ivory Buff · 45% white | — |
| `--ink` | `#362304` | Vandyke Brown | 13.6:1 on bg, AAA |
| `--ink-2` | `#706934` | Light Brownish Olive | 5.1:1 on bg, AA |
| `--accent` | `#a93400` | Burnt Sienna | 6.0:1 on bg, AA |
| `--accent-2` | `#b85e00` | Raw Sienna | 4.1:1 — fills, ≥18px text, UI only |
| `--line` | `#c0b490` | Ecru | hairlines only |
| `--deep` | `#150d02` | Vandyke Brown · 62% black | band background |
| `--deep-text` | `#ebd999` | Ivory Buff | 13.7:1 on deep, AAA |
| `--deep-ink-2` | `#c0b490` | Ecru | 9.3:1 on deep, AAA |
| `--deep-accent` | `#ffb852` | Cream Yellow | 11.2:1 on deep, AAA |
| `--deep-line` | `#4a3a1a` | — | hairlines on deep only |

The site is **light by default**. Deep is a band (the Prove section, the footer), not a theme toggle. The accent appears in: `.si`, the mark's point, the periods in the triad headline, links, the primary button. Nowhere else.

## Type

All OFL, self-hosted, no third-party request.

| Role | Face | Setting |
|---|---|---|
| Display | Newsreader 400, opsz 72 | Hero `clamp(2.5rem, 1.6rem + 3.2vw, 4.25rem)`, H2 `clamp(1.75rem, 1.2rem + 1.6vw, 2.5rem)`, line-height 1.05, tracking −0.01em |
| Body | Inter 400/500 | 17px / 1.55, measure 65ch |
| Numerals, labels | Geist Mono 400/500 | Numbers tabular; labels 12px uppercase +0.08em |

Scale ratio 1.25 from 17px. Numbers (500M+, 1.5 PB, 3.5 mo) are always mono.

## Layout

- Container 72rem, gutter `max(16px, safe-area)`, 4px spacing base.
- Nothing is rounded except buttons and chips (4px).
- Hairlines (`--line`) separate sections. No cards with shadows.
- Section labels are mono: `01 · Structure`, `02 · Resolve`, `03 · Prove`. Numbered because the triad is an order: structure first, resolve on top of it, prove last.

## Motion

- Micro (hover, focus, toggles): 180ms, `cubic-bezier(0.22, 1, 0.36, 1)`.
- Reveal (section entrance): 700ms, opacity and transform only, from a visible resting state.
- Hero: one 2D canvas, points drifting into structure, under 10 KB, paused under `prefers-reduced-motion`, static SVG fallback.
- No parallax, no scroll-jacking, no WebGL.

## Voice

Plain-spoken, "we", confident, sparse. Written for a technical buyer. Every claim ties to a number or a named method. No: cutting-edge, leverage, seamless, unlock, revolutionize, next-gen.

## Writing rule

No em-dashes or double dashes anywhere in page content, labels, or metadata. Use a full stop, comma, colon, parentheses, or a middle dot in labels.
