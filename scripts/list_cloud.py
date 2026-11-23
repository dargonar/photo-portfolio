import os, json, urllib.request, urllib.parse, base64, sys, re

if not os.environ.get("CLOUDINARY_URL"):
    m = re.search(r'CLOUDINARY_URL="?([^"\n]+)', open(os.path.expanduser("~/.bashrc")).read())
    if m:
        os.environ["CLOUDINARY_URL"] = m.group(1)
url = os.environ["CLOUDINARY_URL"]
_, rest = url.split("://")
creds, cloud = rest.split("@")
key, secret = creds.split(":")
auth = base64.b64encode(f"{key}:{secret}".encode()).decode()

def api(endpoint, params):
    req = urllib.request.Request(
        f"https://api.cloudinary.com/v1_1/{cloud}/{endpoint}",
        data=urllib.parse.urlencode(params).encode(),
        headers={"Authorization": "Basic " + auth},
    )
    try:
        return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        print("ERROR", e.code, e.read().decode()[:300], file=sys.stderr)
        sys.exit(1)

folder = sys.argv[1] if len(sys.argv) > 1 else "muestra_fda_2026/pablotutino/fotos_proyecto"
res = api("resources/by_folder", {"folder": folder, "max_results": 500})
ids = sorted(r["public_id"] for r in res["resources"])
print("total:", len(ids))
for i in ids:
    print(i)
