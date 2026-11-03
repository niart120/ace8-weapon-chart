"""Read-only follow-up for the twelve deferred MEGAFLOAT targets.
Usage: python -B docs/analysis/calculation/investigate_megafloat.py EXE
Requires the existing reference tables, extracted assets and matching EXE.
Writes only data/local/local003-megafloat.json; never launches the game.
"""
import hashlib
import json
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.stdout.reconfigure(encoding="utf-8")

def read(path):
    return json.loads(path.read_text(encoding="utf-8"))

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

protected = [ROOT / x for x in [
    "data/local/catalog.json", "data/local/npc-evidence.json",
    "data/local/native-constructors.json", "data/local/generation-input.json",
    "src/data/targets.json", "src/data/weapons.json", "src/data/modifiers.json",
]]
before = {str(x.relative_to(ROOT)): digest(x) for x in protected}
path = ROOT / "docs/analysis/calculation/investigate_target_attributes.py"
scope = {"__file__": str(path), "__name__": "megafloat_inspection"}
exec(compile(path.read_text(encoding="utf-8").split("\ndef table(")[0], str(path), "exec"), scope)
b, p, w = scope["b"], scope["p"], scope["w"]

# Use PE unwind groups for complete functions, including split function bodies.
xref_path = ROOT / "docs/initial/ref/scripts/code_xrefs.py"
source = xref_path.read_text(encoding="utf-8").split("if __name__=='__main__':")[0]
source = source.replace("data=Path('Game/Binaries/Win64/AceCombat8.exe').read_bytes()", "data=p.exe")
c = {"__file__": str(xref_path), "__name__": "megafloat_xrefs", "p": p}
exec(compile(source, str(xref_path), "exec"), c)

ids = {418, 423, 430, 420, 422, 429, 500, 501, 419, 421, 503, 426}
evidence = read(ROOT / "docs/analysis/calculation/TARGET_ATTRIBUTE_EVIDENCE.json")
delivery = {t["id"]: t for t in read(ROOT / "src/data/targets.json")}
targets = [t for t in evidence["targets"] if t["id"] in ids]
assert len(targets) == 12
assert sum(len(t["sources"]) for t in targets) == 43

# Recheck HP and normal-missile durability from the original tables, rather
# than inferring HP from the user's recollection of one-hit destructions.
table_paths = {}
def table(name):
    path = ROOT / "docs/initial/ref/tables" / (name + ".json")
    table_paths[str(path.relative_to(ROOT))] = digest(path)
    return {r["row"]: r["values"] for r in read(path)["rows"]}

def f32(value):
    return struct.unpack("<f", struct.pack("<f", value))[0]

npcs, model_rows, durability = table("DT_NPC"), table("DT_NPC_Model"), table("DT_NPC_WeaponDurability")
missile = next(v for v in table("DT_LiveWeapon").values() if v["WeaponID"] == 2)
column = f"Category{missile['WeaponDurabilityCategory']:02d}"
assert column == "Category01"
weapon_path = ROOT / "docs/initial/ref/tables/blueprint_weapons.json"
table_paths[str(weapon_path.relative_to(ROOT))] = digest(weapon_path)
base_damage = next(v for v in read(weapon_path) if v["blueprint"] == "BP_plwp_msl_a0_C")["effective_properties"]["Damage"]
assert base_damage == 40
role_rows = table("DT_CategoryDamageRateForPlayerDataTable")
role_rates = {str(v["AttackCategory"]): v["Category08"] for v in role_rows.values()}
numeric = {}
for t in targets:
    records = []
    for source in t["sources"]:
        row = table(source["table"])[source["row"]]
        mission = None if source["table"] == "DT_NPC" else row
        npc = npcs[mission["NpcId"]] if mission else row
        model = model_rows[npc["ModelId"]]
        hp_parts = [model["MaxHealth"], npc["MaxHealthDifference"], mission["MaxHealthDifference"] if mission else 0]
        hp = max(0, int(f32(f32(f32(hp_parts[0]) + f32(hp_parts[1])) + f32(hp_parts[2]))))
        durability_id = mission["WeaponDurabilityId"] if mission and mission["WeaponDurabilityId"] != "None" else npc["WeaponDurabilityId"]
        percent = durability[durability_id][column]
        multiplier = f32(f32(percent) * f32(0.01))
        assert hp == delivery[t["id"]]["hp"]
        assert multiplier == delivery[t["id"]]["damageMultipliers"]["standardMissile"]
        records.append({**source, "model_npc_mission_hp": hp_parts, "resolved_hp": hp,
            "durability_id": durability_id, "missile_percent": percent, "missile_multiplier": multiplier})
    assert all(v["missile_multiplier"] == records[0]["missile_multiplier"] for v in records)
    numeric[str(t["id"])] = {"sources": records, "missile_damage_no_parts": {
        role: f32(f32(f32(base_damage) * f32(f32(percent) * f32(0.01))) * records[0]["missile_multiplier"])
        for role, percent in role_rates.items()}}

# A conditional boundary illustration, NOT evidence that Sleep starts at HP1.
mgp = next(v for v in read(ROOT / "data/local/catalog.json")["weapons"] if v["name"] == "MGP")
mgp_base = next(v for v in read(weapon_path) if v["blueprint"] == mgp["blueprint"])["effective_properties"]["Damage"]
mgp_weapon = next(v for v in table("DT_LiveWeapon").values() if v["WeaponID"] == mgp["weaponId"])
mgp_col = f"Category{mgp_weapon['WeaponDurabilityCategory']:02d}"
mgp_percent = durability["MGFPillar_WPDur_000"][mgp_col]
mgp_damage = f32(f32(mgp_base) * f32(f32(mgp_percent) * f32(0.01)))
boundary_examples = []
for hp in [100, 200]:
    health, hits, hp1 = hp * 10, 0, None
    while health > 0:
        health = max(0, int(f32(f32(f32(health * f32(0.1)) - mgp_damage) * f32(10))))
        hits += 1
        if hp1 is None and health <= 10:
            hp1 = hits
    boundary_examples.append({"hp": hp, "hits_to_hp0": hits, "hits_to_hp1_if_that_were_the_goal": hp1})
mgp_example = {"conditional_only": True, "blueprint": mgp["blueprint"], "base_damage": mgp_base,
    "durability_column": mgp_col, "durability_percent": mgp_percent, "role_percent": 100,
    "no_parts_damage": mgp_damage, "examples": boundary_examples}
models = {mid: evidence["models"][mid] for t in targets for mid in sorted({s["model"] for s in t["sources"]})}
model_identity = {mid: {k: model_rows[mid][k] for k in [
    "BlueprintClass", "GameObjectDisplayName01", "BriefingDisplayNameID", "MaxHealth"]} for mid in models}
deck_assemblies = {}
for npc_id in ["Megafloat_Deck_01", "Megafloat_Deck_Cannon_01"]:
    npc = npcs[npc_id]
    assert len(npc["ChildNPCId"]) == len(npc["ChildNPCComponentNames"])
    deck_assemblies[npc_id] = {"model": npc["ModelId"], "display_name": npc["GameObjectDisplayName02"],
        "children": [{"component": component, "npc": child, "model": npcs[child]["ModelId"]}
            for component, child in zip(npc["ChildNPCComponentNames"], npc["ChildNPCId"])]}
blueprint_names = sorted({name for m in models.values() for name in m["chain"] if name not in w.classes})
interesting = {"bInitialInvincible", "bInitialMarkerHide", "MaxHealth", "MinHealth",
    "bIsInvincible", "bIsInvincibleInducedExplosion", "bShowHUDBox", "bIsContainer",
    "bIsIgnoreScoreBoard", "bShouldRecordForDebriefing", "FreeFlightInitialEventName",
    "DestructConditions", "PillarDestructDelayRange", "DestructInfos[0]", "DeckFieldMeshName",
    "RunwayMeshNames[0]", "RunwayMeshNames[1]", "RunwayMeshNames[2]", "RunwayMeshNames[3]"}
decoded = {}

def reference_chain(asset, index):
    names = []
    while index:
        obj = asset.imports[-index - 1] if index < 0 else asset.exports[index - 1]
        names.append(obj["name"])
        index = obj["outer"]
    return list(reversed(names))

conditions = {}
for name in blueprint_names:
    d = b.decode(name)
    assert d["error"] is None and d["consumed"] == d["export_bytes"], (name, d["error"])
    a = b.asset(name)
    decoded[name] = {k: d[k] for k in ["parent", "consumed", "export_bytes", "uexp_sha256"]}
    decoded[name].update({"source": str(a.path.relative_to(ROOT)), "uasset_sha256": digest(a.path),
        "properties": {k: v for k, v in d["properties"].items() if k in interesting},
        "origins": {k: v for k, v in d["origins"].items() if k in interesting},
        "function_exports": [e["name"] for e in a.exports if a.ref(e["cls"]) == "Function"],
        "identity_component_exports": [e["name"] for e in a.exports if e["name"] in [
            "Elevator_SM_GEN_VARIABLE", "MainCannon_GEN_VARIABLE", "MainCannon_Core_GEN_VARIABLE"]],
        "identity_mesh_imports": [e["name"] for e in a.imports if e["name"].startswith(
            ("SM_MGF_Elevator", "SM_MGF_Pillar", "SK_MGF_Pillar", "SM_MGF_UpperDeck"))]})
    for index in d["properties"].get("DestructConditions", []):
        e = a.exports[index - 1]
        cls = a.ref(e["cls"])
        reader = a.export_reader(e)
        fields = b.fields(cls)
        values = {}
        for i, zero in reader.header():
            values[fields[i]["name"]] = reader.value(fields[i], zero)
        assert reader.read("I") == 0 and reader.p == e["size"]
        conditions[name + ":" + e["name"]] = {"class": cls, "export_index": index,
            "uexp_offset": e["offset"], "consumed": reader.p, "size": e["size"],
            "template": reference_chain(a, e["template"]), "serialized_overrides": values}

# Child condition objects inherit the parent Blueprint's subobject, not just
# the native zero/default values. This is material for Deck_Cannon.
parent_bp = "BP_Megafloat_Deck_C"
child_bp = "BP_Megafloat_Deck_Cannon_C"
for key, rec in conditions.items():
    if key.startswith(parent_bp + ":"):
        effective = {**({"ThresholdDamage": 1} if rec["class"].endswith("Pillar") else {}),
            **rec["serialized_overrides"]}
    else:
        assert key.startswith(child_bp + ":")
        parent_key = parent_bp + ":" + key.split(":", 1)[1]
        assert rec["template"][-2:] == ["Default__" + parent_bp, key.split(":", 1)[1]]
        effective = {**conditions[parent_key]["effective_known_values"], **rec["serialized_overrides"]}
    rec["effective_known_values"] = effective

native = read(ROOT / "data/local/native-constructors.json")
slots = [0x918, 0x928, 0x930, 0x938, 0x970, 0x9c0, 0x9d0, 0xa38, 0xa40]
native_tables = {}
for name in ["LiveAIBuildingObject", "LiveAIMegafloatConstruction", "LiveAIMegafloatDeck",
             "LiveAIMegafloatPillar", "LiveAIMegafloatCorePillar", "LiveAIMegafloatShutter"]:
    rec = native[name]
    va = int(rec["vtable"], 16)
    off = p.pe.get_offset_from_rva(va - p.base)
    native_tables[name] = {"constructor": rec["constructor"], "vtable": rec["vtable"],
        "slots": {hex(s): hex(struct.unpack_from("<Q", p.exe, off + s)[0]) for s in slots}}
    assert native_tables[name]["slots"]["0xa38"] == "0x147c5b410"
    assert native_tables[name]["slots"]["0xa40"] == "0x147c82f70"
    assert native_tables[name]["slots"]["0x928"] == "0x147c84080"

# Addresses belong to the hash-checked current build; none are old-build VAs.
functions = {
    "construction_constructor": 0x147e607e0,
    "construction_initial_invincibility": 0x147e608d0,
    "construction_damage_state": 0x147e60a00,
    "building_invincibility": 0x147c5b8a0,
    "building_take_damage": 0x147c5b410,
    "npc_take_damage": 0x147c82df0,
    "common_take_damage": 0x147d0fde0,
    "minimum_health": 0x147c84080,
    "pillar_reset": 0x147e65380,
    "pillar_death": 0x147e65410,
    "pillar_marker": 0x147e65610,
    "pillar_sleep_enter": 0x147e66bf0,
    "deck_condition_dispatch": 0x147e62d60,
    "deck_condition_num": 0x147e64670,
    "deck_condition_line": 0x147e64890,
    "deck_condition_pillar": 0x147e64d00,
    "deck_count_pillars": 0x147e5e3c0,
    "deck_collapse_start": 0x147e62e70,
    "deck_propagate_damage": 0x147e630d0,
    "shutter_setup": 0x147e65d40,
}
code = {}
for label, addr in functions.items():
    ins = c["disasm_full"](addr)
    assert ins and ins[0].address == addr, (label, hex(addr))
    code[label] = {"address": hex(addr), "instructions": [f"{i.address:#x} {i.mnemonic} {i.op_str}" for i in ins],
        "code_sha256": hashlib.sha256(b"".join(bytes(i.bytes) for i in ins)).hexdigest()}
# This constructor initializes the enum ThresholdDamage to Minor=1.
a = 0x157bc12f0
off = p.pe.get_offset_from_rva(a - p.base)
assert p.exe[off:off + 4] == bytes.fromhex("c6432c01")
threshold_default = {"address": hex(a), "bytes": "c6432c01", "value": 1}
tag_va = 0x14cbfb690
tag_off = p.pe.get_offset_from_rva(tag_va - p.base)
excluded_tag = p.exe[tag_off:tag_off + 100].decode("utf-16le").split("\0")[0]
assert excluded_tag == "IgnoreDestroyCount"
assert any("[rbx + 0x3b8], xmm0" in i for i in code["pillar_reset"]["instructions"])
assert any("jmp 0x147c82df0" in i for i in code["building_take_damage"]["instructions"])
assert any("call 0x147d0fde0" in i for i in code["npc_take_damage"]["instructions"])
out = {"exe_sha256": hashlib.sha256(p.exe).hexdigest(), "protected_sha256": before,
    "numeric_source_sha256": table_paths,
    "normal_missile": {"weapon_id": 2, "blueprint": "BP_plwp_msl_a0_C", "base_damage": base_damage,
        "durability_column": column, "role_column_for_category4": "Category08", "role_percent": role_rates},
    "numeric_recheck": numeric,
    "conditional_mgp_boundary": mgp_example,
    "model_identity": model_identity, "deck_assemblies": deck_assemblies,
    "targets": [{**{k: v for k, v in t.items() if k != "hasPositiveMinHealth"},
        "hasPositiveMinHealthInSourceTables": t["hasPositiveMinHealth"],
        "current": {k: delivery[t["id"]][k] for k in ["hp", "isAir", "roleGroup", "standardDamage"]}} for t in targets],
    "model_chains": {k: v["chain"] for k, v in models.items()}, "decoded": decoded,
    "conditions": conditions, "threshold_native_default": threshold_default,
    "pillar_count_excluded_tag": {"address": hex(tag_va), "value": excluded_tag},
    "native_tables": native_tables, "code": code,
    "enums": {k: v for k, v in read(ROOT / "data/local/current-native/indexes/native_enums.json").items() if "Megafloat" in k}}
assert before == {str(x.relative_to(ROOT)): digest(x) for x in protected}
(ROOT / "data/local/local003-megafloat.json").write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Targets", len(targets), "models", len(models), "Blueprints", len(decoded),
      "condition objects", len(conditions), "native functions", len(code), "protected files unchanged")
