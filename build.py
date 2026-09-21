#!/usr/bin/env python3
"""Inline css/style.css, js/app.js and assets/images/*.png into a single
dist/index.html — no external files needed to open it (fonts + confetti
still load from CDN).

Usage:  python3 build.py
"""
import base64, pathlib, re

root = pathlib.Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf-8")
css  = (root / "css/style.css").read_text(encoding="utf-8")
js   = (root / "js/app.js").read_text(encoding="utf-8")

# inline every local image as a base64 data URI (png + jpg/jpeg)
MIME = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'}

def inline_image(match):
    src = match.group(1)
    if src.startswith(("http://", "https://", "data:")):
        return match.group(0)
    path = root / src
    ext = path.suffix.lower()
    mime = MIME.get(ext, 'application/octet-stream')
    data = base64.b64encode(path.read_bytes()).decode("ascii")
    return match.group(0).replace(src, f"data:{mime};base64,{data}")

html = re.sub(r'src="([^"]+\.(?:png|jpe?g))"', inline_image, html)

html = html.replace('<link rel="stylesheet" href="css/style.css">',
                    "<style>\n" + css + "\n</style>")
html = html.replace('<script src="js/app.js"></script>',
                    "<script>\n" + js + "\n</script>")

out = root / "dist"
out.mkdir(exist_ok=True)
(out / "index.html").write_text(html, encoding="utf-8")
print("built dist/index.html  (%.1f KB)" % ((out / "index.html").stat().st_size / 1024))
