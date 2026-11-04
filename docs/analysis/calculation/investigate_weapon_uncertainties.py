"""Read-only local_004 investigation. Never executes game code or regenerates data.

Usage: python -B -X utf8 docs/analysis/calculation/investigate_weapon_uncertainties.py EXE
Requires the existing reference parser/native cache and extracted local004-raw assets.
Writes only data/local/local004-weapon-evidence-latest.json; preserves the initial report.
Extraction recipe is in local_004.
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


# Reuse only parser initialization, including case-insensitive FName handling.
# The target audit's table traversal, assertions, and output are not executed.
bootstrap = ROOT / "docs/analysis/calculation/investigate_target_attributes.py"
scope = {"__file__": str(bootstrap), "__name__": "weapon_uncertainty_inspection"}
exec(compile(bootstrap.read_text(encoding="utf-8").split("\ndef table(")[0],
             str(bootstrap), "exec"), scope)
b, p, w = scope["b"], scope["p"], scope["w"]
before = {key.replace("\\", "/"): value for key, value in scope["before"].items()}
raw = ROOT / "data/local/local004-raw"
current = {f.stem: f for f in raw.rglob("*.uasset")}
b.paths.update(current)

xref_path = ROOT / "docs/initial/ref/scripts/code_xrefs.py"
x = {"__file__": str(xref_path), "__name__": "weapon_native_inspection", "p": p}
source = xref_path.read_text(encoding="utf-8").split("if __name__=='__main__':")[0]
source = source.replace("data=Path('Game/Binaries/Win64/AceCombat8.exe').read_bytes()", "data=p.exe")
exec(compile(source, str(xref_path), "exec"), x)
cap = p.capstone.x86


def data_at(address, size):
    pos = p.pe.get_offset_from_rva(address - p.base)
    return p.exe[pos:pos + size]


def pointer(address):
    return struct.unpack("<Q", data_at(address, 8))[0]


def direct(address, size):
    return list(p.md.disasm(data_at(address, size), address))


def rendered(instructions):
    return [f"{i.address:#x} {i.mnemonic} {i.op_str}" for i in instructions]


def native_function(address):
    code = x["disasm_full"](address)
    if not code:  # Small leaf functions have no .pdata entry.
        for i in direct(address, 1024):
            code.append(i)
            if i.mnemonic in ["ret", "jmp"]:
                break
        assert code[-1].mnemonic in ["ret", "jmp"]
    return code


# Decode constant stores into a Python dictionary; no game instructions run.
# The registration thunk redirects to this relocated, readable constant block.
thunk = native_function(0x147dcc980)
assert thunk[0].mnemonic == "jmp" and thunk[0].operands[0].imm == 0x15c7b8650
registers, memory, origins = {}, {}, {}
aliases = {"eax": "a", "ax": "a", "rax": "a", "ecx": "c", "cx": "c", "rcx": "c"}
constant_code = direct(0x15c7b8650, 0x263)
for i in constant_code:
    if i.mnemonic == "jmp":
        assert i.operands[0].imm == 0x147dccbe0
        break
    dst, src = i.operands
    if i.mnemonic == "mov":
        value = src.imm if src.type == cap.X86_OP_IMM else registers[aliases[i.reg_name(src.reg)]]
        if dst.type == cap.X86_OP_REG:
            registers[aliases[i.reg_name(dst.reg)]] = value
        else:
            assert not dst.mem.index
            base = i.address + i.size if dst.mem.base == cap.X86_REG_RIP else registers[aliases[i.reg_name(dst.mem.base)]]
            address = base + dst.mem.disp
            for n, byte in enumerate(value.to_bytes(dst.size, "little")):
                memory[address + n], origins[address + n] = byte, hex(i.address)
    elif i.mnemonic == "lea":
        assert not src.mem.index
        base = i.address + i.size if src.mem.base == cap.X86_REG_RIP else registers[aliases[i.reg_name(src.mem.base)]]
        registers[aliases[i.reg_name(dst.reg)]] = base + src.mem.disp
    else:
        raise AssertionError(i.mnemonic)

individual = {}
key = None
for i in native_function(0x147dccbe0):
    if i.mnemonic != "mov" or len(i.operands) != 2:
        continue
    dst, src = i.operands
    if dst.type != cap.X86_OP_MEM or src.type != cap.X86_OP_IMM:
        continue
    if dst.mem.base == cap.X86_REG_RBP and dst.mem.disp == 0x20:
        key = src.imm
    elif dst.mem.base in [cap.X86_REG_RAX, cap.X86_REG_RDX] and dst.mem.disp == 4 and dst.size >= 2:
        assert key is not None
        individual[key] = {"power_label": src.imm & 0xffff, "store": hex(i.address)}

mapping = []
for wid in [8, 26, 104, 105]:
    case, group = None, 0
    if 1 <= wid <= 104:
        index = data_at(0x147dcf97c + wid - 1, 1)[0]
        case = p.base + struct.unpack("<I", data_at(0x147dcf940 + index * 4, 4))[0]
        instruction = direct(case, 7)[0]
        assert instruction.mnemonic == "mov" and instruction.operands[0].mem.disp == -2
        group = instruction.operands[1].imm & 0xff
    address = 0x14e343700 + group * 26 + 2
    label = memory.get(address, 0) + 256 * memory.get(address + 1, 0)
    mapping.append({"weapon_id": wid, "group": group, "case": hex(case) if case else None,
                    "power_label": label, "group_label_store": origins.get(address),
                    "individual": individual.get(wid)})
assert [(v["group"], v["power_label"]) for v in mapping] == [(3, 235), (6, 124), (6, 124), (0, 0)]
assert individual[26]["power_label"] == 167 and 105 not in individual

tables = {name: p.parse_table(path) for name, path in current.items()
          if name in ["DT_LiveParts", "DT_LiveWeapon", "DT_LiveAircraft", "DT_WeaponSettings"] or name.startswith("DT_PlayerParameter_")}
parts = [{"row": row["row"], "id": row["values"]["PartsID"], "effects": row["values"]["PartsData"]}
         for row in tables["DT_LiveParts"]["rows"]
         if any(effect["ParameterLabel"] in [124, 167] for effect in row["values"]["PartsData"])]
assert len(parts) == 1 and parts[0]["id"] == 2032802
assert parts[0]["effects"] == [
    {"ParameterLabel": 124, "SpecialConditionLabel": 0, "OperationType": 1, "ParameterValue": 1.2000000476837158},
    {"ParameterLabel": 0, "SpecialConditionLabel": 0, "OperationType": 0, "ParameterValue": 0},
]

blueprints = []
for name in ["BP_plwp_sffs_a0", "BP_plwp_sffs_r0", "BP_SFFS_Child_Bomb",
             "BP_wp_8aam_a0", "BP_wp_8aam_r0", "BP_wp_8aam", "BP_wp_msl_BaseClass"]:
    decoded = b.decode(name + "_C")
    assert not decoded.get("error") and decoded["consumed"] == decoded["export_bytes"], name
    asset = b.asset(name + "_C")
    props = decoded["properties"]
    blueprints.append({"name": name, "parent": decoded["parent"], "bytes": decoded["consumed"],
                       "properties": {key: props[key] for key in ["WeaponID", "Damage", "ChildClass", "ChildSpawner"] if key in props},
                       "child_class": asset.ref(props["ChildClass"]) if "ChildClass" in props else None,
                       "function_exports": [e["name"] for e in asset.exports if asset.ref(e["cls"]) == "Function"]})

aircraft_asset = b.asset("DT_LiveAircraft")
aircraft = []
for row in tables["DT_LiveAircraft"]["rows"]:
    values = row["values"]
    parameter = aircraft_asset.ref(values["PlayerParameter"])
    params = tables[parameter]["rows"]
    assert len(params) == 1
    weapons = {k: v for k, v in params[0]["values"].items() if k.startswith("SpWeaponID")}
    assert len(weapons) == 4
    aircraft.append({"row": row["row"], "plane": values["PlaneStringID"],
                     "class": values["Reference"]["asset"], "parameter": parameter, "weapons": weapons})
assert len(aircraft) == 36 and all(8 not in a["weapons"].values() for a in aircraft)
weapon_settings = [{"row": row["row"], "weapon_id": row["values"]["WeaponID"]}
                   for row in tables["DT_WeaponSettings"]["rows"]]
assert len(weapon_settings) == 6 and all(row["weapon_id"] != 8 for row in weapon_settings)
online_fcs = b.asset("BP_FCS_8AAM_r0_00_C")
online_8aam_refs = [v["name"] for v in online_fcs.imports if "8aam" in v["name"].lower()]
assert "BP_wp_8aam_C" in online_8aam_refs

player_classes = []
for name in sorted(current):
    if not name.startswith("BP_PlayerPlane_"):
        continue
    asset = b.asset(name + "_C")
    decoded = b.decode(name + "_C")
    assert not decoded.get("error") and decoded["consumed"] == decoded["export_bytes"], name
    player_classes.append({"name": name + "_C", "parent": decoded["parent"],
                           "bytes": decoded["consumed"], "names_8aam": [n for n in asset.names if "8aam" in n.lower()],
                           "weapon_classes": [v["name"] for v in asset.imports if v["class_name"] == "BlueprintGeneratedClass" and "wp_" in v["name"].lower()]})
assert len(player_classes) == 37 and not any(v["names_8aam"] for v in player_classes)
assert {v["class"] for v in aircraft} <= {v["name"] for v in player_classes}

old_assets = {f.stem: f for f in (ROOT / "docs/initial/ref/raw").rglob("*.uasset")}
hashes = []
for name, path in sorted(current.items()):
    for suffix in [".uasset", ".uexp"]:
        source = path.with_suffix(suffix)
        prior = old_assets.get(name)
        prior_hash = digest(prior.with_suffix(suffix)) if prior else None
        hashes.append({"path": source.relative_to(raw).as_posix(), "sha256": digest(source),
                       "reference_sha256": prior_hash,
                       "matches_reference": digest(source) == prior_hash if prior_hash else None})

# Function hashes and short instruction excerpts permit review against this EXE.
# Full disassembly is kept in the ignored local report, not in published data.
functions = {}
for address in [0x147f69ae0, 0x147f60360, 0x147f602e0, 0x147f2cd00,
                0x147dc5d10, 0x147dc6030, 0x147de2de0, 0x147dcf680,
                0x147f2cd80, 0x147f10220, 0x147f10710, 0x147f1b780, 0x147f25990, 0x147f1f8d0]:
    code = native_function(address)
    functions[hex(address)] = {"sha256_instruction_bytes": hashlib.sha256(b"".join(i.bytes for i in code)).hexdigest(),
                              "instructions": rendered(code)}
slots = {}
for name, table in [("LiveSFFSBomb", 0x14ca1d8e0), ("LiveBomb", 0x14c5b7c70), ("LiveChildSpawnerComponent", 0x14c5fee28)]:
    offsets = [0x4a8, 0x4b8] if name == "LiveChildSpawnerComponent" else [0x810, 0x820, 0x840, 0x850, 0x890]
    slots[name] = {hex(offset): hex(pointer(table + offset)) for offset in offsets}
assert slots["LiveSFFSBomb"]["0x840"] == "0x147f2cd00"
assert slots["LiveSFFSBomb"]["0x890"] == "0x147f2cd80"
assert slots["LiveBomb"]["0x820"] == "0x147f1b780"
assert slots["LiveChildSpawnerComponent"]["0x4b8"] == "0x147f10710"

after = {path: digest(ROOT / path) for path in before}
assert after == before
# Approved implementation changes may differ from the initial investigation.
# The before/after comparison above protects all seven inputs during this run.
report = {"exe_sha256": hashlib.sha256(p.exe).hexdigest(), "mapping": mapping, "parts": parts,
          "blueprints": blueprints, "aircraft": aircraft, "player_classes": player_classes,
          "weapon_settings": weapon_settings, "online_fcs_imports": online_8aam_refs,
          "tables": {name: {k: v for k, v in table.items() if k not in ["source", "rows"]} for name, table in tables.items()},
          "asset_hashes": hashes, "vtable_slots": slots, "native_functions": functions,
          "container_search": read(ROOT / "data/local/local004-asset-locations.json"),
          "protected_sha256": after, "runtime_measurement": False}
output = ROOT / "data/local/local004-weapon-evidence-latest.json"
output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"output": str(output.relative_to(ROOT)), "aircraft_rows": len(aircraft),
                  "player_classes": len(player_classes), "protected_files_unchanged": len(after)}, ensure_ascii=False))
