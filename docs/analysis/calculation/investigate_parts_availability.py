"""Read-only campaign parts audit against freshly extracted local006 assets.
Usage: python -B -X utf8 docs/analysis/calculation/investigate_parts_availability.py EXE
Requires extract_parts_audit_assets.py; writes only data/local/local006-parts-audit.json.
Does not execute game code. Current-native indexes and original parser tools are local prerequisites.
"""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.stdout.reconfigure(encoding="utf-8")
bootstrap = ROOT / "docs/analysis/calculation/investigate_target_attributes.py"
scope = {"__file__": str(bootstrap), "__name__": "parts_availability"}
exec(compile(bootstrap.read_text(encoding="utf-8").split("\ndef table(")[0],
             str(bootstrap), "exec"), scope)
b, p = scope["b"], scope["p"]
before = {key.replace("\\", "/"): value for key, value in scope["before"].items()}
files = {}
for directory in ["local006-raw"]:
    files.update({f.stem: f for f in (ROOT / "data/local" / directory).rglob("*.uasset")})
b.paths.update(files)

# This native coordinate uses custom binary serialization, not a property header.
# Check reflected field widths/offsets before reading the two signed integers.
original_value = p.Reader.value


def value(self, field, zero=False, container=False):
    if field["type"] == 25 and p.resolve_ctor(field["ctor"]) == "IntVector2":
        shape = [(f["name"], f["type"], f["offset"]) for f in p.normalized("IntVector2")]
        assert shape == [("X", 3, 0), ("Y", 3, 4)], shape
        return [0, 0] if zero else [self.read("i"), self.read("i")]
    return original_value(self, field, zero, container)


p.Reader.value = value
tables = {}


def table(name):
    if name not in tables:
        tables[name] = p.parse_table(files[name])
    return tables[name]["rows"]


for name in sorted(files):
 if name.startswith("DT_"): table(name)
settings={}
for name in sorted(files):
 if not name.startswith("DA_"): continue
 asset=b.Asset(files[name]); export=asset.exports[0]
 reader=asset.export_reader(export); fields=b.fields(asset.ref(export["cls"]))
 values={}
 for index,zero in reader.header():
  field=fields[index]; values[field["name"]]=reader.value(field,zero)
 assert reader.read("I")==0 and reader.p==export["size"],name
 settings[name]={"class":asset.ref(export["cls"]),"values":values,"consumed":reader.p,"export_bytes":export["size"]}
enums_path=ROOT/"data/local/current-native/indexes/native_enums.json"
enums=json.loads(enums_path.read_text(encoding="utf-8"))
labels=next(v for v in enums.values() if v.get("83")=="GunPower")
parts=json.loads((ROOT/"data/local/catalog.json").read_text(encoding="utf-8"))["parts"]
weapons=json.loads((ROOT/"src/data/weapons.json").read_text(encoding="utf-8"))
source_parts={row["values"]["PartsID"]:row for row in table("DT_LiveParts")}
nodes={row["values"]["NodeID"]:row["values"] for row in table("DT_LiveMenuAircraftTreeNodeDataTable")}
# Graph reachability is structural, not a proof of runtime unlock/purchase success.
paths={0:[0]}
queue=[0]
for nid in queue:
 for target in nodes[nid]["DstReferenceNodeIDs"]:
  assert target in nodes,target
  if target not in paths: paths[target]=paths[nid]+[target];queue.append(target)
audit=[]
for part in parts:
 source=source_parts[part["sourceId"]]
 hits=[n for n in nodes.values() if n["NodeType"]==1 and n["ReferenceID"]==part["sourceId"]]
 beneficiaries=[]
 for weapon in weapons:
  if weapon["category"]=="UNUSED":continue
  components=[v for v in weapon.values() if isinstance(v,dict) and "partMultipliers" in v]
  if any(part["key"] in component["partMultipliers"] for component in components):beneficiaries.append(weapon["name"])
 audit.append({**part,"source_row":source["row"],"source_values":source["values"],
  "effects":[{**v,"label_name":labels[str(v["ParameterLabel"])]} for v in source["values"]["PartsData"]],
  "nodes":[{**n,"unlock_name":enums["ELiveMenuAircraftTreeNodeUnlockTriggers"][str(n["UnlockTrigger"])],"root_path":paths.get(n["NodeID"])} for n in hits],
  "published_beneficiaries":beneficiaries})
# Broader search: outgoing damage labels, not incoming damage, radius, quantity, or reload.
power_rows=[{"id":sid,"row":row["row"],"effects":[{**v,"label_name":labels[str(v["ParameterLabel"])]} for v in row["values"]["PartsData"]]}
 for sid,row in source_parts.items() if any("Power" in labels[str(v["ParameterLabel"])] for v in row["values"]["PartsData"])]
assert len(audit)==10 and sum(bool(v["nodes"]) for v in audit)==9
assert all(n["root_path"] for v in audit for n in v["nodes"])
assert {r["id"] for r in power_rows}=={v["sourceId"] for v in parts}
assert all(t["consumed_bytes"]==t["export_bytes"]-4 for t in tables.values())
baseline=json.loads((ROOT/"docs/initial/ref/tables/DT_LiveParts.json").read_text(encoding="utf-8"))
report={"tables":tables,"settings":settings,"audit":audit,"power_rows":power_rows,
 "parts_rows_equal_baseline":baseline["rows"]==tables["DT_LiveParts"]["rows"],
 "enum_sha256":hashlib.sha256(enums_path.read_bytes()).hexdigest(),
 "exe_sha256":hashlib.sha256(p.exe).hexdigest(),"protected_sha256":before,"runtime_measurement":False}
report["asset_sha256"]={str(f.relative_to(ROOT)).replace("\\","/"):hashlib.sha256(f.read_bytes()).hexdigest() for path in files.values() for f in [path,path.with_suffix(".uexp")]}
assert before=={name:hashlib.sha256((ROOT/name).read_bytes()).hexdigest() for name in before}
(ROOT/"data/local/local006-parts-audit.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"tables":len(tables),"settings":len(settings),"parts":len(audit),"purchase_nodes":sum(len(a["nodes"]) for a in audit),"power_rows":len(power_rows),"protected_unchanged":len(before)}))
