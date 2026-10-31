# bodhilabs.si

Static landing page for Bodhi Labs. No build framework; the repo root is the deploy root.

## Deploy (GitHub Pages)

The site is served by GitHub Pages from the `main` branch, root directory. Every push to `main` redeploys within about a minute. `CNAME` holds the custom domain; `.nojekyll` tells Pages to serve files as they are.

DNS at the registrar: four `A` records on the bare domain to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `CNAME` for `www` to `wewake2.github.io`. In the repo, Settings → Pages: source "Deploy from a branch", `main`, `/ (root)`, custom domain `bodhilabs.si`, "Enforce HTTPS" on once the certificate is issued.

`.htaccess` is kept for a possible move to Apache hosting; GitHub ignores it.

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
