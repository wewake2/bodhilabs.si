"""Generate Bodhi Labs logo SVGs: outlined wordmark (Newsreader + Geist Mono) and the three-strokes mark.
Usage: make_logo.py <fonts_dir> <out_dir>
"""
import sys, os
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FONTS, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

INK, ACC = "#362304", "#a93400"          # Vandyke Brown, Burnt Sienna
REV_INK, REV_ACC = "#ebd999", "#ffb852"  # Ivory Buff, Cream Yellow (on --deep)
BG = "#f9f4e2"

EM = 100.0  # display em in SVG units

def shape(path, text, variations, scale):
    """Return list of (glyphname, x, y) in SVG units (y up) and total advance, using HarfBuzz positions."""
    blob = hb.Blob.from_file_path(path)
    face = hb.Face(blob)
    font = hb.Font(face)
    font.set_variations(variations)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    tt = TTFont(path)
    names = tt.getGlyphOrder()
    gs = tt.getGlyphSet(location=variations)
    out, x = [], 0.0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        out.append((gs, gs[names[info.codepoint]], (x + pos.x_offset) * scale, pos.y_offset * scale))
        x += pos.x_advance
    return out, x * scale

def to_path(glyphs, x0, baseline_y):
    """Outline glyphs into one SVG path string, flipping y, placing baseline at baseline_y."""
    cmds = []
    for gs, glyph, gx, gy in glyphs:
        pen = SVGPathPen(gs)   # glyph set resolves components
        tp = TransformPen(pen, (glyph_scale, 0, 0, -glyph_scale, x0 + gx, baseline_y - gy))
        glyph.draw(tp)
        cmds.append(pen.getCommands())
    return " ".join(cmds)

def bounds(glyphs, x0, baseline_y):
    bp = None
    for gs, glyph, gx, gy in glyphs:
        if bp is None:
            bp = BoundsPen(gs)
        tp = TransformPen(bp, (glyph_scale, 0, 0, -glyph_scale, x0 + gx, baseline_y - gy))
        glyph.draw(tp)
    return bp.bounds

# --- wordmark -------------------------------------------------------------
news = os.path.join(FONTS, "Newsreader.ttf")
mono = os.path.join(FONTS, "GeistMono.ttf")
NEWS_VAR = {"wght": 460, "opsz": 72}
MONO_VAR = {"wght": 500}

xh_news = 852 / 2000          # from OS/2
xh_mono = 530 / 1000
mono_em = EM * xh_news / xh_mono   # 80.4 units — matches x-heights exactly

glyph_scale = EM / 2000
bodhi, adv_bodhi = shape(news, "bodhi", NEWS_VAR, EM / 2000)
bodhi_path = to_path(bodhi, 0, 0)
bx0, by0, bx1, by1 = bounds(bodhi, 0, 0)   # y0 is top (negative), y1 is bottom (descender) in SVG coords

glyph_scale = mono_em / 1000
si, adv_si = shape(mono, ".si", MONO_VAR, mono_em / 1000)
# Optical gap: Geist Mono's '.' is centered in a 600-unit cell, so the cell carries ~0.2em of air on its
# left. Pull the mono group back so the period sits a normal word-space from the 'i'.
gap = -EM * 0.11
si_x0 = adv_bodhi + gap
si_path = to_path(si, si_x0, 0)
sx0, sy0, sx1, sy1 = bounds(si, si_x0, 0)

asc = -by0                 # ascender height of b/d/h above baseline
desc = by1                 # should be ~0 for 'bodhi' (no descenders) — check
word_w = sx1
print(f"bodhi advance {adv_bodhi:.1f}, bounds x[{bx0:.1f},{bx1:.1f}] y[{by0:.1f},{by1:.1f}]  ascender {asc:.1f}")
print(f".si  bounds x[{sx0:.1f},{sx1:.1f}] y[{sy0:.1f},{sy1:.1f}]  mono em {mono_em:.1f}")

# --- mark: three strokes ---------------------------------------------------
# Drawn on a 24-unit grid, scaled so its height equals the wordmark ascender.
def mark_shapes(scale, ox, oy, ink, acc):
    """Three bars; the middle one is two segments joined by a square point (the resolved record)."""
    t = 3.0 * scale   # stroke
    r = t / 2
    def bar(x0, x1, cy, fill):
        return (f'<rect x="{ox + x0*scale:.2f}" y="{oy + cy*scale - r:.2f}" '
                f'width="{(x1-x0)*scale:.2f}" height="{t:.2f}" rx="{r:.2f}" fill="{fill}"/>')
    def dot(cx, cy, fill):
        return (f'<rect x="{ox + cx*scale - r:.2f}" y="{oy + cy*scale - r:.2f}" '
                f'width="{t:.2f}" height="{t:.2f}" rx="{r*0.35:.2f}" fill="{fill}"/>')
    return "\n".join([
        bar(2, 22, 4.5, ink),            # Structure
        bar(2, 9.0, 12, ink),            # Resolve: two segments…
        dot(12, 12, acc),                #   …joined at one point
        bar(15.0, 22, 12, ink),
        bar(2, 22, 19.5, ink),           # Prove
    ])

MARK_GRID = 24.0
mark_h = asc                      # match ascender
mark_scale = mark_h / (MARK_GRID - 3.0)   # grid rows span 3..21 → 18 units of ink height
mark_w = 20 * mark_scale + 3 * mark_scale  # bars 2..22 plus stroke

def svg(w, h, body, pad=0.0):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad:.2f} {-pad:.2f} {w+2*pad:.2f} {h+2*pad:.2f}" '
            f'width="{w+2*pad:.2f}" height="{h+2*pad:.2f}" role="img" aria-label="Bodhi Labs">\n{body}\n</svg>\n')

def write(name, content):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(content)
    print("wrote", name)

pad = EM * 0.08
variants = {"color": (INK, ACC), "mono": (INK, INK), "reversed": (REV_INK, REV_ACC)}

for v, (ink, acc) in variants.items():
    # wordmark alone — translate so top of ascender is at y=0
    body = (f'<g transform="translate(0,{asc:.2f})">\n'
            f'<path fill="{ink}" d="{bodhi_path}"/>\n'
            f'<path fill="{acc}" d="{si_path}"/>\n</g>')
    write(f"bodhi-wordmark-{v}.svg", svg(word_w, asc, body, pad))

    # mark alone (grid-aligned 24x24 box, ink spans rows 3..21)
    ms = 1.0
    body = mark_shapes(ms, 0, 0, ink, acc)
    write(f"bodhi-mark-{v}.svg", svg(24, 24, body))

    # lockup: mark + wordmark, mark top aligned to ascender, baseline aligned to bar 3's bottom
    gap_lock = asc * 0.42
    # grid x=2 → svg x=0 (left edge of bars); grid y=3 → svg y=0 (top of first bar)
    mbody = mark_shapes(mark_scale, -2.0 * mark_scale, -3.0 * mark_scale, ink, acc)
    # bar 3 bottom = (19.5 + 1.5)*s = 21*s = (24-3)*s = asc ✓ ; bars span grid x 2..22 → 20 units wide
    wx = 20 * mark_scale + gap_lock
    body = (f'{mbody}\n<g transform="translate({wx:.2f},{asc:.2f})">\n'
            f'<path fill="{ink}" d="{bodhi_path}"/>\n'
            f'<path fill="{acc}" d="{si_path}"/>\n</g>')
    write(f"bodhi-lockup-{v}.svg", svg(wx + word_w, asc, body, pad))

# favicon: mark on a rounded paper tile so it holds up on dark tab bars
tile = (f'<rect width="24" height="24" rx="5" fill="{BG}"/>\n' + mark_shapes(1.0, 0, 0, INK, ACC))
write("favicon.svg", svg(24, 24, tile))

# social/avatar: mark centred on paper, square
av = (f'<rect width="64" height="64" fill="{BG}"/>\n' + mark_shapes(1.75, 11, 11, INK, ACC))
write("bodhi-avatar.svg", svg(64, 64, av))
