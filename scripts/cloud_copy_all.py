import re, os, json, urllib.request, urllib.parse, base64, time, sys

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

def upload_file(params):
    req = urllib.request.Request(f"https://api.cloudinary.com/v1_1/{cloud}/image/upload",
                                 data=urllib.parse.urlencode(params).encode(),
                                 headers={"Authorization": "Basic " + auth})
    try:
        return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        return {"__error__": e.code, "body": e.read().decode()[:200]}

SRC_PREFIX = "muestra_fda_2026/pablotutino"
DST_FOLDER = "too-much-but-not-enough"

# paginate all source assets
ids, cursor = [], None
while True:
    p = {"prefix": SRC_PREFIX, "max_results": 500, "fields": "public_id"}
    if cursor: p["next_cursor"] = cursor
    r = get("resources/image/upload", p)
    ids += [x["public_id"] for x in r["resources"]]
    cursor = r.get("next_cursor")
    if not cursor: break
print("to copy:", len(ids))

ok, fail = 0, []
for pid in ids:
    name = pid.split("/")[-1]
    is_pdf = name.lower().endswith(".pdf")
    url = f"https://res.cloudinary.com/{cloud}/image/upload/{pid}"
    res = upload_file({"file": url, "public_id": name, "folder": DST_FOLDER, "overwrite": "false"})
    if res.get("__error__"):
        fail.append((pid, res["__error__"]))
    else:
        ok += 1
    if ok % 20 == 0: print("progress:", ok, flush=True)
    time.sleep(0.3)

print("copied:", ok, "failed:", len(fail))
for f in fail[:10]: print("FAIL", f)
