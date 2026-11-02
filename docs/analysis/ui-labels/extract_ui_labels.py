"""Read the supplied localization copies and extract UI label evidence only."""

import hashlib
import json
import re
import runpy
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
REF = ROOT / "docs/initial/ref"
OUTPUT = Path(__file__).with_name("ui_labels.json")
POWER_PART_IDS = {
    2011802, 2014802, 2021802, 2022802, 2032802,
    2038802, 2040802, 2042802, 2058802, 2059802,
}


def main():
    decode = runpy.run_path(str(REF / "scripts/extract_target_names.py"))["decode"]
    source_dir = REF / "raw_guides/Live/Content/Localization/GameData"
    sources = {name: (source_dir / name).read_bytes() for name in ("CP_Cmn.dat", "CP_A.dat")}
    tree = decode(sources["CP_Cmn.dat"])
    strings = decode(sources["CP_A.dat"]).decode("utf-8").split("\0")
    position = 0
    labels = {}

    def integer():
        nonlocal position
        value = struct.unpack_from("<i", tree, position)[0]
        position += 4
        return value

    def visit(prefix=""):
        nonlocal position
        count = integer()
        assert 0 <= count <= len(tree) // 12
        for _ in range(count):
            length = integer()
            assert 0 <= length <= len(tree) - position
            key = prefix + tree[position:position + length].decode("utf-8")
            position += length
            index = integer()
            if index >= 0:
                assert index < len(strings), (key, index)
                assert key not in labels, key
                labels[key] = strings[index]
            visit(key)

    visit()
    assert position == len(tree), (position, len(tree))
    previous = json.loads((REF / "reports/target_display_names.json").read_text(encoding="utf-8"))
    for name, data in sources.items():
        assert hashlib.sha256(data).hexdigest() == previous["source_hashes"][f"raw/{name}"]
    for entry in previous["entries"]:
        assert labels[entry["key"]] == entry["text"], entry["key"]

    part_rows = json.loads((REF / "tables/DT_LiveParts.json").read_text(encoding="utf-8"))["rows"]
    parts = []
    for row in part_rows:
        values = row["values"]
        if values["PartsID"] not in POWER_PART_IDS:
            continue
        parts.append({
            "row": row["row"], "id": values["PartsID"],
            "name_key": values["PartsNameTextID"],
            "name": labels.get(values["PartsNameTextID"]),
            "short_name_key": values["PartsShortNameTextID"],
            "short_name": labels.get(values["PartsShortNameTextID"]),
            "filter": values["Filter"],
            "parameters": values["PartsData"],
        })
    assert {part["id"] for part in parts} == POWER_PART_IDS
    assert len(parts) == len(POWER_PART_IDS)
    assert all(part["name"] and part["short_name"] for part in parts)

    weapon_rows = json.loads((REF / "tables/DT_LiveWeapon.json").read_text(encoding="utf-8"))["rows"]
    weapons = []
    for row in weapon_rows:
        values = row["values"]
        weapons.append({
            "row": row["row"], "id": values["WeaponID"],
            "string_id": values["WeaponStringID"],
            "name_key": values["WeaponNameTextID"],
            "name": labels.get(values["WeaponNameTextID"]),
            "short_name_key": values["WeaponShortNameTextID"],
            "short_name": labels.get(values["WeaponShortNameTextID"]),
            "category": values["Category"],
        })

    category_pattern = re.compile(
        r"^HangarAircrafttype_Name_|^HangarWeaponType_Name_|"
        r"^Hangar.*(?:parts.*(?:filter|category|type)|"
        r"(?:filter|category|type).*parts)", re.IGNORECASE,
    )
    candidates = [{"key": key, "text": value} for key, value in sorted(labels.items())
                  if category_pattern.search(key) and len(value) <= 80]
    result = {
        "scope": "Stored display strings in the supplied Japanese-mode localization. "
                 "Weapon definitions are not an approved app roster or proof of availability.",
        "source_hashes": {str((source_dir / name).relative_to(ROOT)).replace("\\", "/"):
                          hashlib.sha256(data).hexdigest() for name, data in sources.items()},
        "decoder": "docs/initial/ref/scripts/extract_target_names.py:decode",
        "tree_bytes_consumed": position,
        "verified_target_strings": len(previous["entries"]),
        "power_parts": parts,
        "weapon_definitions": weapons,
        "category_label_candidates": candidates,
    }
    OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "tree_bytes": position,
                      "verified_target_strings": len(previous["entries"])}, ensure_ascii=False))
    print("POWER PARTS")
    for part in parts:
        print(f'{part["id"]}: {part["short_name"]!r} / {part["name"]!r}')
    print("WEAPON SHORT NAMES")
    print(json.dumps(sorted({w["short_name"] for w in weapons if w["short_name"]}), ensure_ascii=False))
    print(f"CATEGORY LABEL CANDIDATES: {len(candidates)} (see output JSON)")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
