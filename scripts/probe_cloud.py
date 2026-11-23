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

out = get("resources/image/upload", {"prefix": "muestra_fda_2026/pablotutino", "max_results": 500, "fields": "public_id,asset_folder"})
ids = sorted(r["public_id"] for r in out["resources"])
print("total:", len(ids))
for i in ids:
    print(i)
