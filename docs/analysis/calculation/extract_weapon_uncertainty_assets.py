"""Extract only local_004 evidence into data/local; game inputs remain read-only.

The encryption key is read from --key-file, passed to retoc without a shell, and
never included in logs/reports/errors. Requires the user's existing retoc tool.
"""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--game", type=Path, required=True)
parser.add_argument("--key-file", type=Path, required=True)
args = parser.parse_args()
key = args.key_file.read_text(encoding="utf-8").strip()
if not re.fullmatch(r"(?:0x)?[0-9a-fA-F]{64}", key):
    raise ValueError("The key file must contain one hexadecimal key")
retoc = ROOT / "data/local/tools/retoc/retoc.exe"
paks = args.game / "Game/Content/Paks"
output = ROOT / "data/local/local004-raw"


def run(*arguments):
    result = subprocess.run([str(retoc), "--aes-key", key, *map(str, arguments)],
                            capture_output=True, text=True, encoding="utf-8")
    # Do not expose the argv-bearing CalledProcessError or unfiltered tool logs.
    if result.returncode:
        raise RuntimeError("retoc failed; encrypted tool arguments are omitted")
    return result


def write(name, value):
    (ROOT / "data/local" / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


protected = ["src/data/targets.json", "src/data/weapons.json", "src/data/modifiers.json",
             "data/local/catalog.json", "data/local/generation-input.json",
             "data/local/npc-evidence.json", "data/local/native-constructors.json"]
before = {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in protected}
baseline_path = ROOT / "data/local/local004-protected-before.json"
# Preserve the initial investigation snapshot across subsequently approved updates.
# Non-mutation is checked against this invocation's own snapshot below.
if not baseline_path.exists():
    write(baseline_path.name, before)
locations = []
for container in sorted(paks.glob("pakchunk*.utoc")):
    result = run("list", container, "--path")
    lines = result.stdout.splitlines()
    (ROOT / f"data/local/local004-{container.stem}-files.txt").write_text(result.stdout, encoding="utf-8")
    locations.append({"container": container.name,
                      "utoc_sha256": hashlib.sha256(container.read_bytes()).hexdigest(),
                      "listed_lines": len(lines),
                      "selected": [line for line in lines if re.search(r"8aam|sffs|weaponset|weaponpreset|weaponload|equipweapon", line, re.I)]})
assert len(locations) == 6
write("local004-asset-locations.json", locations)

logs = []
filters = ["Blueprints/Weapons/BOMB/SFFS", "Blueprints/Weapons/BOMB/BP_wp_Bomb_BaseClass",
           "8aam", "BP_FCS_8AAM", "BP_wp_msl_BaseClass", "/BP_PlayerPlane_",
           "Datatables/Player/Parameter/", "Datatables/Player/DT_LiveAircraft",
           "Datatables/Information/DT_LiveWeapon", "Datatables/Information/DT_LiveParts",
           "Datatables/Player/DT_WeaponSettings"]
for term in filters:
    result = run("to-legacy", paks, output, "--filter", term, "--no-shaders", "--no-script-objects")
    summary = re.search(r"Extracted (\d+) \((\d+) failed\)", result.stdout + result.stderr)
    if not summary or int(summary[2]):
        raise RuntimeError("Asset extraction was incomplete; raw tool logs are omitted")
    logs.append({"filter": term, "extracted": int(summary[1]), "failed": int(summary[2])})
write("local004-extraction.json", logs)
assert before == {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest() for name in protected}
print(json.dumps({"containers": len(locations), "assets": sum(v["extracted"] for v in logs),
                  "output": output.relative_to(ROOT).as_posix()}))
