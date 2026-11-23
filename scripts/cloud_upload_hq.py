import re, os, json, urllib.request, urllib.parse, base64, time, glob, hashlib

m = re.search(r'CLOUDINARY_URL="?([^"\n]+)', open(os.path.expanduser("~/.bashrc")).read())
_, rest = m.group(1).split("://")
creds, cloud = rest.split("@")
key, secret = creds.split(":")
auth = base64.b64encode(f"{key}:{secret}".encode()).decode()

def api_get(ep, params):
    q = urllib.parse.urlencode(params)
    req = urllib.request.Request(f"https://api.cloudinary.com/v1_1/{cloud}/{ep}?{q}",
                                 headers={"Authorization": "Basic " + auth})
    return json.load(urllib.request.urlopen(req))

def api_post(ep, fields):
    req = urllib.request.Request(f"https://api.cloudinary.com/v1_1/{cloud}/{ep}",
                                 data=urllib.parse.urlencode(fields).encode(),
                                 headers={"Authorization": "Basic " + auth})
    try:
        return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        return {"__error__": e.code, "body": e.read().decode()[:200]}

# 1) purge partial copies in too-much-but-not-enough
r = api_get("resources/image/upload", {"prefix": "too-much-but-not-enough", "max_results": 500})
pubs = [x["public_id"] for x in r.get("resources", [])]
print("purging partial copies:", len(pubs))
for pid in pubs:
    res = api_post("image/destroy", {"public_id": pid, "invalidate": "true"})
    if res.get("__error__"):
        print("purge fail", pid, res)
    time.sleep(0.25)

# 2) upload originals with signed multipart
files = sorted(glob.glob("/media/dargonar/bkp_1t_new/proyectos/demasiado-pero-no-suficiente/done-hq/*.jpg"))
print("uploading:", len(files))

def sign(params):
    to_sign = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
    return hashlib.sha1(f"{to_sign}{secret}".encode()).hexdigest()

ok, fail = 0, []
for f in files:
    name = os.path.basename(f)
    ts = str(int(time.time()))
    fields = {"public_id": name, "folder": "too-much-but-not-enough", "timestamp": ts,
              "api_key": key, "signature": sign({"public_id": name, "folder": "too-much-but-not-enough", "timestamp": ts})}
    boundary = f"----b{ts}{ok}"
    parts = []
    for k, v in fields.items():
        parts += [f"--{boundary}", f'Content-Disposition: form-data; name="{k}"', "", v]
    parts += [f"--{boundary}", f'Content-Disposition: form-data; name="file"; filename="{name}"',
              "Content-Type: image/jpeg", "", None, f"--{boundary}--", ""]
    body = b""
    for x in parts:
        if x is None:
            body += open(f, "rb").read() + b"\r\n"
        else:
            body += x.encode() + b"\r\n"
    req = urllib.request.Request(
        f"https://api.cloudinary.com/v1_1/{cloud}/image/upload", data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    try:
        res = json.load(urllib.request.urlopen(req))
        ok += 1
    except urllib.error.HTTPError as e:
        fail.append((name, e.code, e.read().decode()[:150]))
    if ok % 20 == 0:
        print("progress:", ok, flush=True)
    time.sleep(0.3)

print("uploaded:", ok, "failed:", len(fail))
for x in fail[:10]:
    print("FAIL", x)
