"""Audit all catalog models and weapon definitions without changing generation inputs.
Usage: python -B docs/analysis/calculation/audit_role_scope.py EXE
"""
import collections
import hashlib
import json
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[3]
sys.stdout.reconfigure(encoding="utf-8")
def read(path): return json.loads(path.read_text(encoding="utf-8"))
protected = [ROOT / x for x in ["data/local/catalog.json", "data/local/npc-evidence.json", "data/local/native-constructors.json", "src/data/targets.json", "src/data/weapons.json", "src/data/modifiers.json"]]
before = {str(x.relative_to(ROOT)): hashlib.sha256(x.read_bytes()).hexdigest() for x in protected}
path = ROOT / "docs/analysis/calculation/investigate_target_attributes.py"
scope = {"__file__": str(path), "__name__": "role_scope_probe"}
exec(compile(path.read_text(encoding="utf-8").split("\ndef table(")[0], str(path), "exec"), scope)
b, p, w = scope["b"], scope["p"], scope["w"]

# FName also applies to imported parent names (CH-47 Cp/CP).
# Resolve only a unique spelling match; do not guess a missing asset.
class AssetPaths(dict):
    def __missing__(self, key):
        matches = [v for k, v in self.items() if k.casefold() == key.casefold()]
        if len(matches) != 1: raise KeyError(key)
        return matches[0]
b.paths = AssetPaths(b.paths)
def table(name): return {x["row"]:x["values"] for x in read(ROOT / "docs/initial/ref/tables" / (name + ".json"))["rows"]}
catalog = read(ROOT / "data/local/catalog.json")
models = table("DT_NPC_Model")
npcs = table("DT_NPC")
native = read(ROOT / "data/local/native-constructors.json")
results, decoded = {}, {}
for mid, attrs in catalog["modelAttributes"].items():
    name = models[mid]["BlueprintClass"]["asset"]
    chain, overrides, errors = [], {}, []
    while name and name not in w.classes:
        if name in chain: raise ValueError("Cyclic Blueprint chain")
        chain.append(name)
        try:
            d = b.decode(name)
            decoded[name] = {k:d[k] for k in ["parent", "error", "consumed", "export_bytes", "uexp_sha256"]}
            values = {k:v for k,v in d["properties"].items() if k in ["GameObjectCategory", "bIsAir", "bDisableCategoryDamageRate"]}
            decoded[name]["attributes"] = values
            decoded[name]["origins"] = {k:d["origins"][k] for k in values}
            if d["error"] or d["consumed"] != d["export_bytes"]: errors.append({"class":name, "reason":d["error"] or "Incomplete CDO"})
            overrides = {**values, **overrides}
            name = d["parent"]
        except Exception as ex:
            errors.append({"class":name, "reason":f"{type(ex).__name__}: {ex}"})
            break
    while name in w.classes:
        chain.append(name)
        name = w.get_parent(name)
    if chain[-1] != "Object": errors.append({"reason":"Native inheritance incomplete"})
    category, air = None, None
    if not errors:
        for cls in reversed(chain):
            writes = native.get(cls, {}).get("writes", {})
            if "0x3ac" in writes: category = writes["0x3ac"]["value"]
            if "0x10db" in writes: air = writes["0x10db"]["value"]
        category = overrides.get("GameObjectCategory",category)
        air = overrides.get("bIsAir",air)
    results[mid] = {"blueprint":models[mid]["BlueprintClass"], "chain":chain, "overrides":overrides, "errors":errors,
        "category":category,"isAir":bool(air) if air is not None else None,"catalog_category":attrs["category"],"catalog_roleGroup":attrs["roleGroup"]}
# Reuse the instruction-level checks, but apply them to every native class
# reached by this larger audit rather than only the original 41 targets.
check_source = path.read_text(encoding="utf-8").split("# Recheck the native writes used to resolve inherited initial values.\n")[1].split("\nfor model, e in results.items():")[0]
check_scope = {**scope, "results": results, "read": read}
exec(compile(check_source, str(path), "exec"), check_scope)
native_checks = check_scope["native_checks"]
missions, target_models = {}, []
for t in read(ROOT / "src/data/targets.json"):
    record = next(x for x in catalog["targets"] if x["id"] == t["id"])
    mids = set()
    for ref in record["sourceRefs"]:
        if ref["table"] == "DT_NPC": npc=npcs[ref["row"]]
        else:
            if ref["table"] not in missions: missions[ref["table"]]=table(ref["table"])
            npc=npcs[missions[ref["table"]][ref["row"]]["NpcId"]]
        mids.add(npc["ModelId"])
    target_models.append({"id":t["id"],"name":t["name"],"display_category":t["category"],"roleGroup":t["roleGroup"],"models":sorted(mids)})
blueprints={x["blueprint"]:x for x in read(ROOT / "docs/initial/ref/tables/blueprint_weapons.json")}
weapons=[]
for definition in catalog["weapons"]:
    name=definition["blueprint"];chain=[];reason=None
    while name in blueprints:
        chain.append(name);name=blueprints[name]["parent"]
    while name in w.classes:
        chain.append(name);name=w.get_parent(name)
    if not chain or chain[-1]!="Object":reason="Missing weapon definition/parent"
    weapons.append({"id":definition["id"],"name":definition["name"],"category":definition["category"],"chain":chain,"error":reason})
# Current-build NPC modifier, independently checked around the uniquely located
# ROLE guard at 0x147c831f4. The loader rejects other executable hashes.
start, end = 0x147c82f70, 0x147c83353
off = p.pe.get_offset_from_rva(start - p.base)
code = list(p.md.disasm(p.exe[off:off + end - start], start))
assert code[-1].mnemonic == "ret"
assert any(i.address == 0x147c831f4 and i.op_str == "ecx, byte ptr [rdi + 0x3ac]" for i in code)
player_class = w.classes["LivePlayerPlane"]["getter"]
assert any(i.address == 0x147c83006 and i.op_str == player_class for i in code)
modifier = {"start": hex(start), "end": hex(end), "player_class_getter": player_class,
    "instructions": [f"{i.address:#x} {i.mnemonic} {i.op_str}" for i in code]}
counts=collections.Counter(str(v["category"]) if not v["errors"] else "unresolved" for v in results.values())
report={"exe_sha256":hashlib.sha256(p.exe).hexdigest(),"models":results,"decoded":decoded,"native_checks":native_checks,"targets":target_models,"weapons":weapons,
 "category_counts":dict(counts),"npc_modifier":modifier,"game_object_enum":read(ROOT/'data/local/current-native/indexes/native_enums.json')["ELiveGameObjectCategory"]}
assert before=={str(x.relative_to(ROOT)):hashlib.sha256(x.read_bytes()).hexdigest() for x in protected}
(ROOT / "data/local/local003-role-scope.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Models",len(results),"CDOs",len(decoded),"categories",dict(counts))
print("Weapon chains",collections.Counter(x["error"] or "complete" for x in weapons))
