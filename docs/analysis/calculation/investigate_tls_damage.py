"""Read-only local_005 TLS analysis; does not run game code or regenerate data.

Usage: python -B -X utf8 docs/analysis/calculation/investigate_tls_damage.py EXE
Requires reference parsers/native cache and extracted data/local/local005-raw.
Writes data/local/local005-tls-evidence-latest.json only. See local_005 for extraction.
"""
import hashlib
import json
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.stdout.reconfigure(encoding="utf-8")

# Reuse parser initialization and constant-store decoding only. The local_004
# asset traversal, report generation and writes below `mapping = []` do not run.
bootstrap = ROOT / "docs/analysis/calculation/investigate_weapon_uncertainties.py"
scope = {"__file__": str(bootstrap), "__name__": "tls_readonly_bootstrap"}
exec(compile(bootstrap.read_text(encoding="utf-8").split("\nmapping = []")[0],
             str(bootstrap), "exec"), scope)
b, p, w, cap = (scope[k] for k in ["b", "p", "w", "cap"])
native_function, data_at, pointer = (scope[k] for k in ["native_function", "data_at", "pointer"])
digest, rendered = scope["digest"], scope["rendered"]
raw = ROOT / "data/local/local005-raw"
current = {f.stem: f for f in raw.rglob("*.uasset")}
b.paths.update(current)


def instruction(address):
    return scope["direct"](address, 15)[0]


def expect(address, mnemonic, operand):
    i = instruction(address)
    assert i.mnemonic == mnemonic and operand in i.op_str, rendered([i])


def f32(value):
    return struct.unpack("<f", struct.pack("<f", value))[0]


names = ["BP_plwp_tls_x0", "BP_wp_tls_BaseClass"]
fields = ["WeaponID", "Damage", "SlipDamage", "DamageStartDelay", "DamageInterval",
          "WeaponWarmUpTime", "LifeTime", "DamageDistance", "DamageRadiusCampaign"]
blueprints = []
for name in names:
    decoded = b.decode(name + "_C")
    assert not decoded.get("error") and decoded["consumed"] == decoded["export_bytes"]
    asset = b.asset(name + "_C")
    functions = [e["name"] for e in asset.exports if asset.ref(e["cls"]) == "Function"]
    assert not functions
    blueprints.append({"name": name, "parent": decoded["parent"],
                       "cdo_bytes": decoded["consumed"], "function_exports": functions,
                       "properties": {k: decoded["properties"][k] for k in fields if k in decoded["properties"]}})
values = blueprints[0]["properties"]
assert [values[k] for k in fields[:7]] == [28, 40, 18, f32(.05), f32(.4), f32(.95), 8]
assert blueprints[1]["parent"] == "LiveTLSLaserWeapon"
field_offsets = {item["name"]: item["offset"] for item in b.fields("LiveTLSLaserWeapon")
                 if item["name"] in fields}
assert {k: field_offsets[k] for k in fields[:7]} == {
    "WeaponID": 0x2b1, "Damage": 0x41c, "SlipDamage": 0x760,
    "DamageStartDelay": 0x764, "DamageInterval": 0x768,
    "WeaponWarmUpTime": 0x76c, "LifeTime": 0x420,
}

parts_table = p.parse_table(current["DT_LiveParts"])
assert parts_table["consumed_bytes"] == parts_table["export_bytes"] - 4
parts = [{"row": row["row"], **row["values"]} for row in parts_table["rows"]
         if any(e["ParameterLabel"] in [213, 218, 221] for e in row["values"]["PartsData"])]
assert len(parts) == 1 and parts[0]["PartsID"] == 2040802
assert parts[0]["PartsData"] == [{"ParameterLabel": 213, "SpecialConditionLabel": 0,
                                  "OperationType": 1, "ParameterValue": f32(1.15)}]

# WeaponID28's switch writes BOTH common-group and instant-group bytes to 11.
# The on-disk group table is zero-initialized; do not mistake it for runtime data.
index = data_at(0x147dcf97c + 28 - 1, 1)[0]
case = p.base + struct.unpack("<I", data_at(0x147dcf940 + index * 4, 4))[0]
assert case == 0x147dcf8f6
expect(case, "mov", "byte ptr [rax - 2], 0xb")
expect(0x147dcf8fa, "mov", "byte ptr [rax + 1], 0xb")
base_address = 0x14e343700 + 11 * 26 + 2
common_label = scope["memory"][base_address] + 256 * scope["memory"][base_address + 1]
assert common_label == 213 and 28 not in scope["individual"]

# Instant table group11 has SlipDamage=218, individual TLS override=221.
expect(0x147dcf120, "mov", "eax, 0xda")
store = instruction(0x147dcf12c)
assert store.address + store.size + store.operands[0].mem.disp == 0x14e343ac0 + 11 * 8 + 6
expect(0x147dcf12c, "mov", "ax")
expect(0x147dcf149, "mov", "0x1c")
expect(0x147dcf1d8, "mov", "word ptr [rax + 8], 0xdd")
expect(0x147dc81f5, "lea", "[rbx + 0x760]")
expect(0x147dc823a, "movzx", "0xe343ac6")
expect(0x147dc8246, "call", "0x147de2de0")
# Label-preserving part registration and distinct Damage/SlipDamage apply calls.
expect(0x147dc4063, "movzx", "esi, bx")
expect(0x147dc4188, "mov", "[rdi + rsi + 0x6a3c]")
expect(0x147ee91cb, "call", "0x147dc5d10")
expect(0x147ee91d6, "call", "0x147dc7f40")
expect(0x147dc5f17, "lea", "0x41c")
expect(0x147de2e9b, "mulss", "xmm1, xmm0")

vtable = 0x14ca89a90
slot_offsets = [0x720, 0x730, 0x748, 0x750, 0x780, 0x800, 0x810, 0x840, 0x850]
slots = {hex(k): hex(pointer(vtable + k)) for k in slot_offsets}
assert slots["0x730"] == "0x147ef9910" and slots["0x750"] == "0x147eea8c0"
assert slots["0x840"] == "0x147ee91b0"
assert pointer(0x14c4eaaf0 + 0xa38) == 0x147c82df0
assert pointer(0x14c4eaaf0 + 0xa40) == 0x147c82f70
assert w.classes["LivePulseBarrier"]["getter"] == "0x146fa9ce0"

checks = [
    (0x147394ce1, "call", "0x730"), (0x147394e21, "call", "0x730"),
    (0x147ee8a54, "movss", "0x808"), (0x147ee8a8d, "lea", "0x978"),
    (0x147ee88a3, "call", "0x147ee9840"), (0x147ee88b6, "ja", "0x147ee88d2"),
    (0x147ee88c1, "addss", "xmm1, xmm6"),
    (0x147ee88d8, "call", "0x147eea4b0"),
    (0x147eea1e7, "mov", "0x804"), (0x147eea1ed, "mov", "0x80c"),
    (0x147eea51d, "jbe", "0x147eea60f"),
    (0x147eea577, "jbe", "0x147eea60f"),
    (0x147eea55f, "subss", "0x764"), (0x147eea5b9, "subss", "0x768"),
    (0x147f61cb2, "call", "0x750"),
    (0x147eea959, "movss", "0x41c"), (0x147eea98a, "call", "0x141a46060"),
    (0x147eea991, "movss", "0x760"), (0x147eea9f2, "call", "0xa38"),
    (0x147f602f5, "call", "0x147f5fe70"),
    (0x147f600a9, "call", "0x144b97630"),
    (0x147f601ab, "jmp", "0x147f601b0"),
]
for args in checks:
    expect(*args)


def trace(deltas, targets, preheated=False, part=False):
    """Conditional normal-target model, NOT a runtime measurement or full engine."""
    timer, warm = f32(0), f32(1 if preheated else -values["WeaponWarmUpTime"])
    initial_passed, previous, history, events = False, None, set(), []
    elapsed = 0
    for frame, (dt, target) in enumerate(zip(deltas, targets, strict=True), 1):
        dt = f32(dt)
        elapsed += dt
        if target != previous:
            timer, initial_passed, previous = f32(0), False, target
        if warm <= 0 and not initial_passed:
            warm = f32(warm + dt)
            continue
        if target is None:
            continue
        timer = f32(timer + dt)
        threshold = values["DamageInterval"] if initial_passed else values["DamageStartDelay"]
        if timer <= threshold:
            continue
        damage = values["SlipDamage"] if target in history else f32(values["Damage"] * (f32(1.15) if part else 1))
        history.add(target)
        events.append({"frame": frame, "time_sum_of_input_dt": elapsed, "target": target, "damage": damage})
        timer = f32(timer - threshold)
        initial_passed = True
    return {"events": events, "remaining_timer": timer, "warmup_counter": warm}


fps_traces = {str(fps): trace([1 / fps] * (fps * 2), ["A"] * (fps * 2)) for fps in [30, 60, 120]}
contact = trace([1 / 60] * 18, ["A"] * 4 + [None] * 2 + ["A"] * 4 + ["B"] * 4 + ["A"] * 4, preheated=True, part=True)
assert [e["damage"] for e in contact["events"]] == [46, 18, 46, 18]
boundary = trace([f32(.05), f32(.000001)], ["A", "A"], preheated=True)
assert [e["frame"] for e in boundary["events"]] == [2]
large_dt = trace([f32(1), f32(.01)], ["A", "A"], preheated=True)
assert len(large_dt["events"]) == 2 and large_dt["events"][1]["damage"] == 18
fresh = trace([1 / 60] * 4, ["A"] * 4, preheated=True, part=True)
assert fresh["events"][0]["damage"] == 46

addresses = [0x147dc3eb0, 0x147dc5d10, 0x147dc7f40, 0x147dcf100, 0x147dcf680, 0x147de2de0,
             0x147394b10, 0x147ee8870, 0x147ee8990, 0x147ee8cc0, 0x147ee8f00,
             0x147ee91b0, 0x147ee91f0, 0x147ee9410, 0x147ee9840, 0x147eea4b0,
             0x147eea620, 0x147eea8c0, 0x147ef8f70, 0x147ef9910, 0x147eee640,
             0x147f5fe70, 0x147f601a0, 0x147f601b0, 0x147f602e0, 0x147f60360,
             0x147f61c20, 0x147f69ae0, 0x147c82df0, 0x147d0fde0, 0x147c82f70]
native = {}
for address in addresses:
    code = native_function(address)
    native[hex(address)] = {"sha256_instruction_bytes": hashlib.sha256(b"".join(i.bytes for i in code)).hexdigest(),
                            "instruction_count": len(code), "instructions": rendered(code)}

old = {f.stem: f for f in (ROOT / "docs/initial/ref/raw").rglob("*.uasset")}
hashes = []
for name in names + ["DT_LiveParts"]:
    for suffix in [".uasset", ".uexp"]:
        source, reference = current[name].with_suffix(suffix), old[name].with_suffix(suffix)
        current_hash, reference_hash = digest(source), digest(reference)
        assert current_hash == reference_hash
        hashes.append({"path": source.relative_to(raw).as_posix(), "sha256": current_hash,
                       "reference_sha256": reference_hash, "matches_reference": True})

before = scope["before"]
after = {path: digest(ROOT / path) for path in before}
assert before == after
# The approved UNUSED change differs from the initial research snapshot.
# Protect all seven files during each run, without overwriting initial evidence.
report = {
    "investigation": "local_005", "date": "2026-11-04", "runtime_measurement": False,
    "exe_sha256": hashlib.sha256(p.exe).hexdigest(), "exe_bytes": len(p.exe),
    "blueprints": blueprints, "native_field_offsets": {k: hex(v) for k, v in field_offsets.items()},
    "parts": parts,
    "part_binding": {"weapon_id": 28, "group": 11, "switch": hex(case),
                     "damage_label": common_label, "damage_label_store": scope["origins"][base_address],
                     "slip_group_label": 218, "slip_group_label_store": "0x147dcf12c",
                     "slip_individual_label": 221, "slip_individual_label_store": "0x147dcf1d8",
                     "part_labels": [213], "damage_with_part": f32(40 * f32(1.15)), "slip_with_part": 18},
    "vtable": hex(vtable), "vtable_slots": slots,
    "npc_damage_entry": {"vtable": "0x14c4eaaf0", "slot": "0xa38", "function": "0x147c82df0",
                         "shared_damage": "0x147d0fde0", "modifier_slot": "0xa40", "modifier_function": "0x147c82f70"},
    "separate_barrier_class": "LivePulseBarrier",
    "instruction_evidence": rendered([instruction(a[0]) for a in checks]),
    "conditional_traces": {"assumptions": "Normal living target, no immunity/events, supplied dt, no lifetime cutoff or engine scheduling; damage before target modifiers/HP update.",
                           "constant_fps": fps_traces, "recontact_and_switch_with_part": contact,
                           "exact_delay_boundary": boundary, "large_dt": large_dt, "fresh_activation_with_part": fresh},
    "asset_hashes": hashes,
    "native_function_hashes": {k: {n: v[n] for n in ["sha256_instruction_bytes", "instruction_count"]} for k, v in native.items()},
    "protected_sha256": after,
    "native_functions": native,
}
output = ROOT / "data/local/local005-tls-evidence-latest.json"
output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"output": output.relative_to(ROOT).as_posix(), "part_binding": report["part_binding"],
                  "first_hit_frames": {fps: data["events"][0]["frame"] for fps, data in fps_traces.items()},
                  "matching_asset_files": len(hashes), "protected_files_unchanged": len(after)}, ensure_ascii=False))
