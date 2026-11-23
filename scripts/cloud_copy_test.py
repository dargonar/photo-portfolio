import re, os, json, urllib.request, urllib.parse, base64, sys

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

def post(ep, params, is_json=False):
    body = json.dumps(params).encode() if is_json else urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(f"https://api.cloudinary.com/v1_1/{cloud}/{ep}", data=body,
                                 headers={"Authorization": "Basic " + auth,
                                          "Content-Type": "application/json" if is_json else "application/x-www-form-urlencoded"})
    try:
        return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        return {"__error__": e.code, "body": e.read().decode()[:300]}

# find one asset id
r = get("resources/image/upload", {"prefix": "muestra_fda_2026/pablotutino/fotos_proyecto/001_01", "max_results": 5})
asset = r["resources"][0]
print("asset:", asset["public_id"], asset["asset_id"])
# try copy endpoint
res = post(f"assets/{asset['asset_id']}/copy", {"to_folder": "too-much-but-not-enough"}, is_json=True)
print(json.dumps(res)[:500])
