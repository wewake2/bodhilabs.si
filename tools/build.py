"""Inline brand/tokens.css and css/site.css into index.html so the page renders without a blocking
stylesheet request. Run after editing either CSS file:  python3 tools/build.py
The source files stay the source of truth; the inlined block is regenerated every time."""
import re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html_path = os.path.join(ROOT, "index.html")
html = open(html_path).read()

def minify(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{};:,>])\s*", r"\1", css)
    return css.replace(";}", "}").strip()

tokens = open(os.path.join(ROOT, "brand", "tokens.css")).read()
site = open(os.path.join(ROOT, "css", "site.css")).read().replace('url("../', 'url("')
block = "<style>" + minify(tokens) + minify(site) + "</style>"

LINKS = '<link rel="stylesheet" href="brand/tokens.css">\n<link rel="stylesheet" href="css/site.css">'
START, END = "<!-- css:inline -->", "<!-- /css:inline -->"
if LINKS in html:
    html = html.replace(LINKS, f"{START}\n{block}\n{END}")
elif START in html:
    html = re.sub(re.escape(START) + ".*?" + re.escape(END), lambda m: f"{START}\n{block}\n{END}", html, flags=re.S)
else:
    sys.exit("index.html has neither the stylesheet links nor an inline block")
open(html_path, "w").write(html)
print(f"inlined {len(block)/1024:.1f} KB of CSS into index.html")
