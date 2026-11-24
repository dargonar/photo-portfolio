"""Paso 5: layout editorial real para 'too much but not enough'.

- dims de las 98 fotos desde Cloudinary (para decidir align).
- rows: dipticos de a 2 fotos en orden; si una foto es landscape, align bottom.
- intro (prose: titulo + texto + agradecimientos) como fila sola, columna derecha 50%.
- credits (tabla rol/nombre) cerca del final.
"""
import re, os, json, urllib.request, urllib.parse, base64

m = re.search(r'CLOUDINARY_URL="?([^"\n]+)', open(os.path.expanduser("~/.bashrc")).read())
_, rest = m.group(1).split("://")
creds, cloud = rest.split("@")
key, secret = creds.split(":")
auth = base64.b64encode(f"{key}:{secret}".encode()).decode()

def get(ep, params):
    q = urllib.parse.urlencode(params)
    req = urllib.request.Request(f"https://api.cloudinary.com/v1_1/{cloud}/{ep}?{q}",
                                 headers={"Authorization": "Basic " + auth})
    return json.load(urllib.request.urlopen(req))

r = get("resources/image/upload", {"prefix": "too-much-but-not-enough", "max_results": 500,
                                   "fields": "public_id,width,height"})
photos = [(x["public_id"].split("/")[-1] + ".jpg", x["width"], x["height"])
          for x in r["resources"] if not x["public_id"].endswith("foto_perfil")]
photos.sort(key=lambda p: p[0])
print("fotos:", len(photos))

CFG = "/home/dargonar/workspace/photo-portfolio/src/data/config.json"
cfg = json.load(open(CFG))
serie = next(s for s in cfg["series"] if s["serie_slug"] == "too-much-but-not-enough")
cover = serie["layout"].get("cover") or serie["images"][0]["data"]["filename"]
# mantener orden de images del config (coincide con sorted cloudinary)
fns = [i["data"]["filename"] for i in serie["images"] if i["type"] == "photo"]
dims = {fn + (".jpg" if not fn.endswith(".jpg") else ""): (w, h) for fn, w, h in photos}

# parejas en el orden original, de a dos, empezando por foto02 (cover excluida)
rest = [f for f in fns if f != cover]
rows = []
i = 0
while i < len(rest):
    pair = rest[i:i+2]
    cells = []
    for fn in pair:
        w, h = dims.get(fn, (1000, 1000))
        cell = {"photo": fn}
        if w > h:
            cell["align"] = "bottom"
        cells.append(cell)
    rows.append({"cells": cells})
    i += 2
# intro despues del primer diptico
rows.insert(1, {"cells": [{"text": "intro"}]})

# credits como anteultima fila, la ultima foto queda sola al final si sobra
if rows[-1]["cells"][0].get("photo") and len(rows[-1]["cells"]) == 1:
    pass  # ultima fila single queda como cierre
rows.insert(-1, {"cells": [{"text": "credits"}]})

serie["layout"]["rows"] = rows
serie["layout"]["text_slots"] = {
    "intro": {
        "layout": "prose",
        "title": "Too Much But Not Enough",
        "title_es": "Demasiado pero no suficiente",
        "content_md": "PLACEHOLDER — texto del proyecto. Sobre la serie: contexto, proceso, decision estetica. Reemplazar con el texto definitivo.\n\nPLACEHOLDER — agradecimientos.",
        "content_md_es": "PLACEHOLDER — texto del proyecto en espanol.\n\nPLACEHOLDER — agradecimientos.",
        "align": "left",
    },
    "credits": {
        "layout": "credits",
        "title": "Credits",
        "title_es": "Creditos",
        "items": [
            {"role": "Photography", "name": "Pablo Tutino"},
            {"role": "Design", "name": "—"},
            {"role": "Models", "name": "—"},
        ],
    },
}

json.dump(cfg, open(CFG, "w"), ensure_ascii=False, indent=2)
lands = sum(1 for row in rows for c in row["cells"] if c.get("align") == "bottom")
print(f"rows: {len(rows)} (dipticos: {sum(1 for r in rows if len(r['cells'])==2 and 'photo' in r['cells'][0])}, landscapes dock-bottom: {lands})")
