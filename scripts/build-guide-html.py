#!/usr/bin/env python3
"""Renders docs/ENGINEERING_GUIDE.md into a standalone, self-contained HTML
page served by the website at /engineering-guide.

The page is intentionally NOT indexed: it carries robots noindex meta tags, it
is not in any sitemap, and server.js also sends an X-Robots-Tag: noindex header
for the /engineering-guide path. It is not linked from the site nav.

Mermaid code fences are converted to <pre class="mermaid"> blocks rendered
client-side via the Mermaid CDN; the architecture PNG/SVG are copied alongside.

Requires: python3 -m pip install markdown
Run from the repo root: python3 scripts/build-guide-html.py
"""
import os
import re
import shutil

import markdown

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "docs", "ENGINEERING_GUIDE.md")
OUT_DIR = os.path.join(ROOT, "public", "engineering-guide")
OUT_HTML = os.path.join(OUT_DIR, "index.html")
# Files copied next to the generated page. The guide references them by ABSOLUTE
# /engineering-guide/<file> URLs: the page is served at /engineering-guide with no
# trailing slash, so a relative "./x.svg" would resolve against the parent and
# 404. Anything the markdown links (not just images) has to be listed here, or
# the link 404s while the markdown still looks correct.
ASSETS = [
    "system-architecture.png",
    "system-architecture.svg",
    "document-receipt-workflow.svg",
    "document-receipt-workflow.md",
    "CLIO-IMPORT-RUNBOOK.md",
]

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>KWVRS Engineering Guide (internal)</title>
<!-- Internal documentation: keep out of search engines. -->
<meta name="robots" content="noindex, nofollow, noarchive" />
<meta name="googlebot" content="noindex, nofollow" />
<style>
  :root {{
    --navy:#14223d; --navy-light:#2a3a5c; --amber:#b8731f; --amber-light:#d4922e;
    --ink:#1f2937; --muted:#6b7280; --line:#e5e7eb; --bg:#ffffff; --code-bg:#f6f8fa;
  }}
  * {{ box-sizing:border-box; }}
  html {{ scroll-behavior:smooth; }}
  body {{
    margin:0; color:var(--ink); background:var(--bg);
    font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,Helvetica,Arial,sans-serif;
  }}
  .banner {{
    background:var(--navy); color:#fff; padding:10px 20px; font-size:13px;
    position:sticky; top:0; z-index:10;
  }}
  .banner strong {{ color:var(--amber-light); }}
  .wrap {{ max-width:920px; margin:0 auto; padding:32px 24px 96px; }}
  h1,h2,h3,h4 {{ font-family:"Source Serif 4",Georgia,serif; color:var(--navy); line-height:1.25; }}
  h1 {{ font-size:2rem; margin:.4em 0 .3em; border-bottom:3px solid var(--amber-light); padding-bottom:.25em; }}
  h2 {{ font-size:1.5rem; margin:2.2em 0 .5em; border-bottom:1px solid var(--line); padding-bottom:.2em; }}
  h3 {{ font-size:1.18rem; margin:1.8em 0 .4em; }}
  h4 {{ font-size:1rem; margin:1.4em 0 .3em; color:var(--navy-light); }}
  a {{ color:var(--amber); text-decoration:none; }}
  a:hover {{ text-decoration:underline; }}
  p,li {{ color:var(--ink); }}
  blockquote {{
    margin:1.2em 0; padding:.6em 1em; border-left:4px solid var(--amber-light);
    background:#fbf6ee; color:#5a4a2e; border-radius:0 6px 6px 0;
  }}
  code {{
    font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
    background:var(--code-bg); padding:.12em .4em; border-radius:4px; font-size:.88em;
  }}
  pre {{ background:var(--code-bg); border:1px solid var(--line); border-radius:8px; padding:14px 16px; overflow:auto; }}
  pre code {{ background:none; padding:0; }}
  pre.mermaid {{ background:#fff; border:1px solid var(--line); text-align:center; }}
  table {{ border-collapse:collapse; width:100%; margin:1.2em 0; font-size:.92rem; display:block; overflow-x:auto; }}
  th,td {{ border:1px solid var(--line); padding:8px 10px; text-align:left; vertical-align:top; }}
  th {{ background:var(--navy); color:#fff; font-weight:600; }}
  tr:nth-child(even) td {{ background:#fafbfc; }}
  img {{ max-width:100%; height:auto; border:1px solid var(--line); border-radius:8px; }}
  hr {{ border:none; border-top:1px solid var(--line); margin:2.4em 0; }}
  .toc-note {{ color:var(--muted); font-size:.85rem; }}
  @media (max-width:600px) {{ .wrap {{ padding:20px 14px 64px; }} h1 {{ font-size:1.6rem; }} }}
</style>
</head>
<body>
<div class="banner">Internal engineering documentation &middot; <strong>not indexed</strong> &middot; do not share publicly. Source of truth: <code>docs/ENGINEERING_GUIDE.md</code> in the repo.</div>
<div class="wrap">
{content}
</div>
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  mermaid.initialize({{ startOnLoad:true, theme:"neutral" }});
</script>
</body>
</html>
"""


def main() -> None:
    with open(SRC, encoding="utf-8") as fh:
        text = fh.read()

    md = markdown.Markdown(
        extensions=["tables", "fenced_code", "toc", "sane_lists", "attr_list"],
        output_format="html5",
    )
    html = md.convert(text)

    # Convert highlighted mermaid code fences into Mermaid-renderable blocks.
    html = re.sub(
        r'<pre><code class="language-mermaid">(.*?)</code></pre>',
        lambda m: '<pre class="mermaid">' + m.group(1) + "</pre>",
        html,
        flags=re.DOTALL,
    )

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT_HTML, "w", encoding="utf-8") as fh:
        fh.write(TEMPLATE.format(content=html))
    print(f"wrote {OUT_HTML}")

    for asset in ASSETS:
        src = os.path.join(ROOT, "docs", asset)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(OUT_DIR, asset))
            print(f"copied {asset}")


if __name__ == "__main__":
    main()
