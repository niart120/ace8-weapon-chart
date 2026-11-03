"""Read-only target audit; only writes its own report under data/local.
Usage: python -B docs/analysis/calculation/investigate_target_attributes.py EXE
"""
import hashlib
import json
import sys
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.stdout.reconfigure(encoding="utf-8")
def read(path):
    return json.loads(path.read_text(encoding="utf-8"))
def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
protected = [ROOT / p for p in [
    "src/data/targets.json", "src/data/weapons.json", "src/data/modifiers.json",
    "data/local/catalog.json", "data/local/npc-evidence.json",
    "data/local/native-constructors.json", "data/local/generation-input.json",
]]
before = {str(p.relative_to(ROOT)): digest(p) for p in protected}
collector = ROOT / "docs/analysis/calculation/collect_npc_evidence.py"
scope = {"__file__": str(collector), "__name__": "target_attribute_inspection"}
exec(compile(collector.read_text(encoding="utf-8").split("\noutput={}")[0], str(collector), "exec"), scope)
b, p, w = scope["b"], scope["p"], scope["w"]

# Follow the actual parent registration used by LiveAIMegafloatPillar.
# The cached Construction record was +0x58 from the FClassParams record.
import struct
old_construction = w.classes["LiveAIMegafloatConstruction"]
b.recover_native("LiveAIMegafloatConstruction", 0x14c51d650)
w.classes["LiveAIMegafloatConstruction"]["getter"] = old_construction["getter"]
p.schemas["LiveAIMegafloatConstruction"] = w.classes["LiveAIMegafloatConstruction"]
assert w.get_parent("LiveAIMegafloatPillar") == "LiveAIMegafloatConstruction"
assert w.get_parent("LiveAIMegafloatConstruction") == "LiveAIBuildingObject"
# FName matching is case-insensitive. Resolve to the actual exported spelling.
# Preserve package paths; only the class-name comparisons use case folding.
source = (scope["ref"] / "scripts/parse_blueprints.py").read_text(encoding="utf-8")
import textwrap
method = textwrap.dedent("    def class_info(self):" + source.split("    def class_info(self):")[1].split("\n\ndef recover_native")[0])
method = method.replace("e['name']==self.path.stem+'_C'", "e['name'].casefold()==(self.path.stem+'_C').casefold()")
method = method.replace("[7,8,9]", "[0,1,2,3,4,5,6,7,8,9]")
method = method.replace("if not z:r.read('i')", "r.value(p.normalized('BlueprintGeneratedClass')[i],z)")
method = method.replace("self.ref(cdo)=='Default__'+self.path.stem+'_C'", "self.ref(cdo).casefold()==('Default__'+self.path.stem+'_C').casefold()")
exec(compile(method, "<case-insensitive class-name lookup>", "exec"), b.__dict__)
b.Asset.class_info = b.class_info

# Native type 33 retains a same-name inner descriptor (OptionalProperty).
# Read the 32-bit presence flag before its value; type 18 is an interface index.
# Serialization reference: UAssetAPI OptionalPropertyData / InterfacePropertyData.
norm_source = (scope["ref"] / "scripts/parse_tables.py").read_text(encoding="utf-8")
norm_method = "def normalized(name):" + norm_source.split("def normalized(name):")[1].split("\nclass Reader:")[0]
exec(compile(norm_method.replace("[22,24]", "[22,24,33]"), "<optional schema>", "exec"), p.__dict__)
scope["original_normalized"] = p.normalized
p.normalized = scope["normalized"]
original_value = b.BReader.value
def read_extra(self, field, zero=False, container=False):
    if field["type"] == 33:
        if zero: return None
        present = self.read("i")
        assert present in [0, 1], (field["name"], present)
        return self.value(field["inner"], container=True) if present else None
    if field["type"] == 18:
        return 0 if zero else self.read("i")
    return original_value(self, field, zero, container)
b.BReader.value = read_extra

# Script struct referenced by EP40's CDO: no own fields, inherits PulldownStructBase.
struct_record = 0x14dd44c28
struct_off = p.pe.get_offset_from_rva(struct_record - p.base)
name_ptr = struct.unpack_from("<Q", p.exe, struct_off + 24)[0]
name_off = p.pe.get_offset_from_rva(name_ptr - p.base)
assert p.exe[name_off:p.exe.index(b"\0", name_off)].decode() == "LiveCinematicsAnimationId"
assert struct.unpack_from("<Q", p.exe, struct_off + 32)[0] == 0
assert struct.unpack_from("<H", p.exe, struct_off + 40)[0] == 0
parent_ctor = struct.unpack_from("<Q", p.exe, struct_off + 8)[0]
assert p.resolve_ctor(parent_ctor) == "PulldownStructBase"
p.schemas["LiveCinematicsAnimationId"] = {"address": hex(struct_record), "properties": [], "super_ctor": hex(parent_ctor)}

def table(name):
    return {r["row"]: r["values"] for r in read(ROOT / "docs/initial/ref/tables" / (name + ".json"))["rows"]}
models, npcs = table("DT_NPC_Model"), table("DT_NPC")
catalog = read(ROOT / "data/local/catalog.json")
identities = {t["id"]: t for t in catalog["targets"]}
# Freeze the reviewed scope so the audit can be rerun after approved updates.
reviewed_ids = {201, 230, 216, 373, 377, 498, 410, 69, 457, 435, 45, 459,
    106, 315, 155, 251, 252, 250, 255, 256, 228, 310, 314, 418, 423, 430,
    420, 422, 429, 500, 501, 419, 421, 503, 426, 264, 237, 238, 505, 463, 462}
targets = [t for t in read(ROOT / "src/data/targets.json") if t["id"] in reviewed_ids]
assert {t["id"] for t in targets} == reviewed_ids and len(targets) == 41
assert all(t["category"] != "EXCLUDED" for t in targets)
missions, selected, mapping = {}, set(), []
for t in targets:
    refs = []
    for source in identities[t["id"]]["sourceRefs"]:
        name, row = source["table"], source["row"]
        mission = None
        if name == "DT_NPC":
            npc = npcs[row]
        else:
            if name not in missions: missions[name] = table(name)
            mission = missions[name][row]
            npc = npcs[mission["NpcId"]]
        model = npc["ModelId"]
        selected.add(model)
        refs.append({**source, "model": model, "minHealth": mission["MinHealth"] if mission else None})
    mapping.append({"id": t["id"], "name": t["name"], "current": {k: t[k] for k in ["isAir", "roleGroup", "standardDamage"]}, "sources": refs})

decoded, results = {}, {}
for model in sorted(selected):
    name = models[model]["BlueprintClass"]["asset"]
    entry = {"blueprint": models[model]["BlueprintClass"], "chain": [], "overrides": {}, "origins": {}, "errors": []}
    while name and name not in w.classes:
        if name in entry["chain"]: raise ValueError("Cyclic class chain")
        entry["chain"].append(name)
        try:
            d = b.decode(name)
            decoded[name] = {k: d[k] for k in ["parent", "error", "consumed", "export_bytes", "uexp_sha256"]}
            asset = b.asset(name)
            decoded[name]["source"] = str(asset.path.relative_to(ROOT))
            decoded[name]["uasset_sha256"] = digest(asset.path)
            attrs = {k: v for k, v in d["properties"].items() if k in ["bIsAir", "GameObjectCategory", "bDisableCategoryDamageRate"]}
            origins = {k: d["origins"][k] for k in attrs}
            decoded[name].update(attributes=attrs, origins=origins)
            decoded[name]["event_properties"] = {k: v for k, v in d["properties"].items() if re.search("Destruct|Health|Damage|Event|Immortal", k)}
            if d["error"] or d["consumed"] != d["export_bytes"]:
                entry["errors"].append({"class": name, "reason": d["error"] or "Incomplete CDO"})
            entry["overrides"] = {**attrs, **entry["overrides"]}
            entry["origins"] = {**origins, **entry["origins"]}
            if "DestructConditions" in d["properties"]:
                decoded[name]["destruct_condition_refs"] = [asset.ref(v) for v in d["properties"]["DestructConditions"]]
            name = d["parent"]
        except Exception as ex:
            entry["errors"].append({"class": name, "reason": f"{type(ex).__name__}: {ex}"})
            break
    while name in w.classes:
        entry["chain"].append(name)
        name = w.get_parent(name)
    results[model] = entry

# Recheck the native writes used to resolve inherited initial values.
native = read(ROOT / "data/local/native-constructors.json")
native_checks = {}
for cls in sorted({c for e in results.values() for c in e["chain"] if native.get(c, {}).get("writes")}):
    rec = native[cls]
    start = int(rec["constructor"], 16)
    end = max(int(v["address"], 16) for v in rec["writes"].values())
    off = p.pe.get_offset_from_rva(start - p.base)
    instructions = list(p.md.disasm(p.exe[off:off + end - start + 32], start))
    for displacement, store in rec["writes"].items():
        ins = next(i for i in instructions if i.address == int(store["address"], 16))
        assert ins.mnemonic == "mov" and ins.operands[0].mem.disp == int(displacement, 16)
        if ins.operands[1].type == p.capstone.x86.X86_OP_IMM:
            assert ins.operands[1].imm == store["value"]
        else:
            register = ins.reg_name(ins.operands[1].reg)
            family = {"si": ["rsi", "esi", "si", "sil"], "r15b": ["r15", "r15d", "r15w", "r15b"], "bpl": ["rbp", "ebp", "bp", "bpl"]}[register]
            writes = [i for i in instructions if i.address < ins.address and any(i.reg_name(r) in family for r in i.regs_access()[1])]
            assert writes and writes[-1].mnemonic == "xor" and store["value"] == 0
            assert writes[-1].op_str.split(", ")[0] == writes[-1].op_str.split(", ")[1]
    native_checks[cls] = {"constructor": rec["constructor"], "writes": rec["writes"],
        "instructions": [f"{i.address:#x} {i.mnemonic} {i.op_str}" for i in instructions if i.mnemonic in ["call", "jmp", "ret", "xor"] or "0x10db" in i.op_str or "0x3ac" in i.op_str]}
for model, e in results.items():
    assert not e["errors"], (model, e["errors"])
    air, category = None, None
    for cls in reversed(e["chain"]):
        writes = native_checks.get(cls, {}).get("writes", {})
        if "0x10db" in writes: air = writes["0x10db"]["value"]
        if "0x3ac" in writes: category = writes["0x3ac"]["value"]
    air = e["overrides"].get("bIsAir", air)
    category = e["overrides"].get("GameObjectCategory", category)
    assert air in [0, 1] and category in range(9)
    e["static_attributes"] = {"isAir": bool(air), "gameObjectCategory": category,
        "roleGroup": {0: "none", 1: "air", 2: "air", 3: "ground", 4: "ground", 5: "ground", 6: "ship", 7: "ship", 8: "category8_neutral"}[category],
        "inheritsLiveAIGameObject": "LiveAIGameObject" in e["chain"]}
for t in mapping:
    values = [results[r["model"]]["static_attributes"] for r in t["sources"]]
    assert all(v == values[0] for v in values), t["id"]
    t["static_attributes"] = values[0]
    t["hasPositiveMinHealth"] = any((r["minHealth"] or 0) > 0 for r in t["sources"])
# Locate the current-build ROLE guard by instructions, not by old addresses.
pattern = bytes.fromhex("0fb68fac030000f30f1005")
locations = [m.start() for m in re.finditer(re.escape(pattern), p.exe)]
role_guards = []
for off in locations:
    addr = p.base + p.pe.get_rva_from_offset(off)
    code = list(p.md.disasm(p.exe[off:off+48], addr))
    if len(code) < 7 or code[2].mnemonic != "cmp" or code[3].mnemonic != "jle": continue
    const = code[1].address + code[1].size + code[1].operands[1].mem.disp
    const_off = p.pe.get_offset_from_rva(const - p.base)
    assert struct.unpack_from("<f", p.exe, const_off)[0] == 100
    role_guards.append({"address": hex(addr), "fallback": 100, "instructions": [f"{i.address:#x} {i.mnemonic} {i.op_str}" for i in code]})
assert role_guards
# NPC role array: one neutral entry, followed by Category05..11 (seven floats).
array_pattern = bytes.fromhex("488b03c704b80000c84248637b088d47018943083b430c")
array_locations = [m.start() for m in re.finditer(re.escape(array_pattern), p.exe)]
assert len(array_locations) == 1
array_offset = array_locations[0]
array_address = p.base + p.pe.get_rva_from_offset(array_offset)
array_code = []
for i in p.md.disasm(p.exe[array_offset:array_offset + 512], array_address):
    array_code.append(i)
    if i.mnemonic == "ret": break
reads = [i.operands[1].mem.disp for i in array_code if i.mnemonic == "mov" and i.op_str.startswith("eax, dword ptr [rsi +")]
assert reads == [0x1c, 0x20, 0x24, 0x28, 0x2c, 0x30, 0x34], reads
role_array = {"address": hex(array_address), "entries": 8,
    "instructions": [f"{i.address:#x} {i.mnemonic} {i.op_str}" for i in array_code]}
out = {"exe": str(Path(sys.argv[1])), "exe_sha256": hashlib.sha256(p.exe).hexdigest(), "protected_sha256": before,
       "input_sha256": {str(path.relative_to(ROOT)): digest(path) for path in [collector,
           ROOT / "docs/initial/ref/tables/DT_NPC_Model.json", ROOT / "docs/initial/ref/tables/DT_NPC.json",
           ROOT / "data/local/current-native/indexes/native_classes.json", ROOT / "data/local/current-native/indexes/native_schema.json",
           ROOT / "docs/initial/ref/scripts/parse_blueprints.py", ROOT / "docs/initial/ref/scripts/parse_tables.py", ROOT / "docs/initial/ref/scripts/inspect_weapons.py"]},
       "targets": mapping, "models": results, "decoded": decoded, "native_checks": native_checks, "current_role_guards": role_guards, "current_role_array": role_array}
assert before == {str(x.relative_to(ROOT)): digest(x) for x in protected}
path = ROOT / "data/local/local003-target-attributes.json"
path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Targets", len(targets), "Models", len(results), "Decoded classes", len(decoded))
