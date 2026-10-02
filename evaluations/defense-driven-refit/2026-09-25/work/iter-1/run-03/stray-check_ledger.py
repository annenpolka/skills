import sys, yaml, collections
d = yaml.safe_load(open(sys.argv[1]))
items = d["items"]
ids = [i["id"] for i in items]
assert len(ids) == len(set(ids)), "dup ids"
req = ["id","scope","layer","origin","question","current_answer","grounding","evidence","gap","resolution","verification","final_answer","admitted_limit","depends_on"]
err = []
for it in items:
    for k in req:
        if k not in it: err.append((it["id"], "missing", k))
    v = it["verification"]
    if v["status"] == "pending" and it["final_answer"] is not None: err.append((it["id"], "pending with final_answer"))
    if v["status"] == "done" and v["artifact_version"] != it["scope"]["version"]: err.append((it["id"], "version mismatch"))
    if v["status"] == "pending" and (v["result"] is not None or v["artifact_version"] is not None): err.append((it["id"], "pending with result"))
    g = it["grounding"] or []
    if not g and not it["admitted_limit"]: err.append((it["id"], "no grounding/limit"))
    for dep in it["depends_on"]:
        if dep not in ids: err.append((it["id"], "bad dep", dep))
    if it["layer"] not in ["構造","境界","手続き","細部"]: err.append((it["id"],"layer"))
    if it["origin"] not in ["deviation","impact","counterexample","asked"]: err.append((it["id"],"origin"))
    if it["question"] not in ["無いと何が壊れる","なぜこの形","どの前提","誰の要求","どう反証"]: err.append((it["id"],"question"))
    if it["resolution"]["action"] not in ["narrow","investigate","change","remove_or_align","defer"]: err.append((it["id"],"action"))
    for e in it["evidence"]:
        for k in e: 
            if k not in ["test","type","execution_result","characterization_test"]: err.append((it["id"],"evidence kind",k))
    for e in g:
        for k in e:
            if k not in ["requirement","measurement","existing_contract","convention","freedom"]: err.append((it["id"],"grounding kind",k))
# cycle check
graph = {i["id"]: i["depends_on"] for i in items}
state = {}
def dfs(n, path):
    if state.get(n) == 1: err.append(("cycle", path+[n])); return
    if state.get(n) == 2: return
    state[n] = 1
    for m in graph[n]: dfs(m, path+[n])
    state[n] = 2
for n in graph: dfs(n, [])
print("errors:", err)
print("count:", len(items), collections.Counter(i["origin"] for i in items), collections.Counter(i["verification"]["status"] for i in items), collections.Counter(i["layer"] for i in items))
# line count per item (required fields only)
lines = open(sys.argv[1]).read().split("\n")
cur=None; cnt=collections.Counter()
for l in lines:
    s=l.strip()
    if s.startswith("- id:"): cur=s.split(":")[1].strip()
    if cur and s and not s.startswith("#"): cnt[cur]+=1
print("max lines/item:", max(cnt.values()), [k for k,v in cnt.items() if v>20])
