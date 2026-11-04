"""Read-only local_004 follow-up: campaign equipment and aircraft-tree coverage.

Usage: python -B -X utf8 docs/analysis/calculation/investigate_8aam_availability.py EXE
Requires local004-raw and local004-8aam-followup-raw (extraction filters in local_004).
Only writes data/local/local004-8aam-availability-latest.json; preserves the initial report.
Never executes game code.
"""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.stdout.reconfigure(encoding="utf-8")
bootstrap = ROOT / "docs/analysis/calculation/investigate_target_attributes.py"
scope = {"__file__": str(bootstrap), "__name__": "eight_aam_availability"}
exec(compile(bootstrap.read_text(encoding="utf-8").split("\ndef table(")[0],
             str(bootstrap), "exec"), scope)
b, p = scope["b"], scope["p"]
before = {key.replace("\\", "/"): value for key, value in scope["before"].items()}
files = {}
for directory in ["local004-raw", "local004-8aam-followup-raw"]:
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


weapon_names = {r["values"]["WeaponID"]: r["values"]["WeaponStringID"]
                for r in table("DT_LiveWeapon")}
aircraft = []
aircraft_asset = b.Asset(files["DT_LiveAircraft"])
for row in table("DT_LiveAircraft"):
    v = row["values"]
    parameter = aircraft_asset.ref(v["PlayerParameter"])
    rows = table(parameter)
    assert len(rows) == 1, parameter
    ids = [rows[0]["values"][f"SpWeaponID{i}"] for i in range(1, 5)]
    aircraft.append({"row": row["row"], "plane_id": v["PlaneID"], "plane": v["PlaneStringID"],
                     "parameter": parameter, "weapon_ids": ids,
                     "weapons": [weapon_names[i] for i in ids if i]})
assert len(aircraft) == 36 and len({a["parameter"] for a in aircraft}) == 35
assert not any(8 in a["weapon_ids"] for a in aircraft)

nodes = table("DT_LiveMenuAircraftTreeNodeDataTable")
extra = table("DT_LiveMenuAircraftTreeExNodeDataTable")
table("DT_LiveMenuAircraftTreeLineDataTable")
tree_ids = [r["values"]["ReferenceID"] for r in nodes if r["values"]["NodeType"] == 0]
extra_ids = [r["values"]["ReferenceID"] for r in extra]
by_id = {a["plane_id"]: a for a in aircraft}
assert len(tree_ids) == 32 and len(extra_ids) == 2
assert all(i in by_id for i in tree_ids + extra_ids)
assert len(set(tree_ids + extra_ids)) == 34
parts = {r["values"]["PartsID"] for r in table("DT_LiveParts")}
assert all(r["values"]["NodeType"] in [0, 1] for r in nodes)
assert all(r["values"]["ReferenceID"] in parts for r in nodes if r["values"]["NodeType"] == 1)

wingmen = table("DT_WingmanAircraft")
assert len(wingmen) == 34
assert all(8 not in [r["values"]["EquipSpWeapon1st"], r["values"]["EquipSpWeapon2nd"]]
           for r in wingmen)
# These two names are misleading for equipment: ability IDs and chain damage.
table("DT_OnlineAircraftParam")
table("DT_Mission027_Weapons")

settings = {}
for name in ["DA_LiveMenuAircraftSettings", "DA_LiveMenuAircraftTreePageSettings"]:
    asset = b.Asset(files[name])
    assert len(asset.exports) == 1
    export = asset.exports[0]
    reader = asset.export_reader(export)
    fields = b.fields(asset.ref(export["cls"]))
    values = {}
    for index, zero in reader.header():
        field = fields[index]
        values[field["name"]] = reader.value(field, zero)
    assert reader.read("I") == 0 and reader.p == export["size"]
    settings[name] = {"values": values, "consumed": reader.p, "export_bytes": export["size"]}

used = set(tables) | set(settings)
hashes = {str(f.relative_to(ROOT)).replace("\\", "/"): hashlib.sha256(f.read_bytes()).hexdigest()
          for name in sorted(used) for f in [files[name], files[name].with_suffix(".uexp")]}
assert before == {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in before}
report = {"exe_sha256": hashlib.sha256(p.exe).hexdigest(), "aircraft": aircraft,
          "tree_aircraft_ids": tree_ids, "extra_aircraft_ids": extra_ids,
          "tree_aircraft_count": len(tree_ids + extra_ids), "tree_parts_count": len(nodes) - len(tree_ids),
          "campaign_8aam_assignments": [], "wingman_8aam_assignments": [],
          "tables": tables, "settings": settings, "asset_sha256": hashes,
          "protected_sha256": before, "runtime_measurement": False}
output = ROOT / "data/local/local004-8aam-availability-latest.json"
output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"aircraft_rows": len(aircraft), "tree_aircraft": len(tree_ids + extra_ids),
                  "tables": len(tables), "settings": len(settings), "protected_unchanged": len(before)}))
