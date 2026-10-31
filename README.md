# bodhilabs.si

Static landing page for Bodhi Labs. No build framework; the repo root is the deploy root.

## Deploy (Hostinger)

Upload everything except `content/`, `tools/`, `brand/reference/` and the markdown files to `public_html/`. The `.htaccess` sets compression, cache headers, and hides working files if they are uploaded anyway.

Before the first deploy, replace the Calendly placeholder in `index.html` (`https://calendly.com/bodhilabs/intro`) and add `bodhilabs.si` at plausible.io so the analytics script has somewhere to report.

## Layout

| Path | What |
|---|---|
| `index.html` | The page. CSS is inlined by `tools/build.py`; do not edit the inline block by hand. |
| `css/site.css`, `brand/tokens.css` | Source of truth for styles. After editing either, run `python3 tools/build.py`. |
| `js/hero.js` | Hero canvas: points settle into three rows, pairs resolve into one accent point. Pauses off-screen, static under reduced motion. |
| `js/site.js` | Section reveals and Plausible events on the calls to action. |
| `brand/` | Logo SVGs, tokens, `SPEC.md` (the one-page brand spec), `make_logo.py` (regenerates the outlined wordmark and mark). |
| `fonts/` | Newsreader 400 (opsz 72), Inter 400/500, Geist Mono 500. Instanced from the variable fonts and subset to Latin; OFL licences alongside. |
| `og/` | Open Graph image and touch icon, plus the HTML they are rendered from. |
| `content/copy.md` | Approved page copy and the decisions log. The page follows this file. |

## Regenerating assets

- Logo: `python3 brand/make_logo.py <dir with Newsreader.ttf and GeistMono.ttf> brand/logo` (needs `fonttools`, `uharfbuzz`).
- OG image: open `og/og.html` in Chrome at 1200×630 and screenshot, or `chrome --headless=new --window-size=1200,630 --screenshot=og/og.png og/og.html`.
- Fonts: see `tools/` history; instanced with `fontTools.varLib.instancer`, subset with `pyftsubset` to `U+0020-00FF` plus punctuation.

## Writing rule

No em-dashes or double dashes anywhere in page content, labels, or metadata.
