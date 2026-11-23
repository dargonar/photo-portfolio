"""Genera la entrada del proyecto piloto 'too much but not enough' en config.json.

- Reemplaza la serie 'adhd' (el proyecto renombrado) por 'too-much-but-not-enough'.
- 98 fotos desde Cloudinary folder too-much-but-not-enough (public_id = filename sin ext).
- layout: {} → opt-in al nuevo render editorial con defaults (hero + filas full-width).
- Carousel home: primeras fotos del nuevo proyecto.
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

r = get("resources/image/upload", {"prefix": "too-much-but-not-enough", "max_results": 500})
fns = sorted(x["public_id"].split("/")[-1] for x in r["resources"] if x["public_id"] != "too-much-but-not-enough/foto_perfil")
print("fotos cloudinary:", len(fns))

CFG = "/home/dargonar/workspace/photo-portfolio/src/data/config.json"
cfg = json.load(open(CFG))

SLUG = "too-much-but-not-enough"
new_serie = {
    "serie_name": "Too Much But Not Enough",
    "serie_name_es": "Demasiado pero no suficiente",
    "serie_slug": SLUG,
    "year": "2025",
    "category_slug": "projects",
    "carousel_transition": "fade",
    "show_thumbnails": True,
    "show_lightbox_title": True,
    "show_lightbox_footer": True,
    "layout": {},
    "images": [
        {"type": "photo",
         "data": {"filename": fn, "title": fn, "description": "", "exif_date": "",
                  "location": "", "iso": 0, "aperture_f": 0, "shutter_speed": "",
                  "focal_mm": 0, "flash": False, "editor": ""}}
        for fn in fns
    ],
}

# reemplaza adhd (mismo proyecto renombrado)
idx = next((i for i, s in enumerate(cfg["series"]) if s["serie_slug"] == "adhd"), None)
if idx is None:
    raise SystemExit("serie 'adhd' no encontrada; aborto")
old_slug = cfg["series"][idx]["serie_slug"]
cfg["series"][idx] = new_serie

# carousel: primeras 5 fotos del proyecto nuevo (desktop y mobile)
car = cfg["pages"]["home"]["carousel"]
car["images"] = [{"filename": fn, "serie_slug": SLUG} for fn in fns[:5]]
car["images_mobile"] = [{"filename": fn, "serie_slug": SLUG} for fn in fns[:5]]

json.dump(cfg, open(CFG, "w"), ensure_ascii=False, indent=2)
print("config.json actualizado: adhd ->", SLUG, "| carousel:", len(car["images"]))
