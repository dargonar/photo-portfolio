import re, os, json, urllib.request, urllib.parse, base64, time

m = re.search(r'CLOUDINARY_URL="?([^"\n]+)', open(os.path.expanduser("~/.bashrc")).read())
_, rest = m.group(1).split("://")
creds, cloud = rest.split("@")
key, secret = creds.split(":")
auth = base64.b64encode(f"{key}:{secret}".encode()).decode()

def post(ep, fields):
    req = urllib.request.Request(f"https://api.cloudinary.com/v1_1/{cloud}/{ep}",
                                 data=urllib.parse.urlencode(fields).encode(),
                                 headers={"Authorization": "Basic " + auth})
    try:
        return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        return {"__error__": e.code, "body": e.read().decode()[:200]}

def get(ep, params):
    q = urllib.parse.urlencode(params)
    req = urllib.request.Request(f"https://api.cloudinary.com/v1_1/{cloud}/{ep}?{q}",
                                 headers={"Authorization": "Basic " + auth})
    return json.load(urllib.request.urlopen(req))

r = get("resources/image/upload", {"prefix": "too-much-but-not-enough", "max_results": 500})
pubs = [x["public_id"] for x in r["resources"]]
print("to rename:", len(pubs))
ok, fail = 0, 0
for pid in pubs:
    base = pid.rsplit(".", 1)
    if len(base) != 2 or not base[1].lower() in ("jpg", "jpeg", "png"):
        continue  # ya sin extension
    res = post("image/rename", {"from_public_id": pid, "to_public_id": base[0], "overwrite": "false"})
    if res.get("__error__"):
        print("FAIL", pid, res["__error__"], res["body"][:120])
        fail += 1
    else:
        ok += 1
    time.sleep(0.2)
print("renamed:", ok, "failed:", fail)
