"""Read the three central-reactor Blueprints; never execute game bytecode.
Usage: python -B docs/analysis/calculation/investigate_core_pillar.py EXE
Writes only data/local/local003-core-pillar.json.
Serialization reference: atenfyr/UAssetAPI, StructExport and Kismet/Bytecode.
"""
import hashlib
import json
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.stdout.reconfigure(encoding="utf-8")
path = ROOT / "docs/analysis/calculation/investigate_target_attributes.py"
scope = {"__file__": str(path), "__name__": "core_pillar_inspection"}
exec(compile(path.read_text(encoding="utf-8").split("\ndef table(")[0], str(path), "exec"), scope)
b, p = scope["b"], scope["p"]

# A delegate field stores a signature reference after the ordinary FProperty.
# This extension is for function metadata only, not the generation parser.
original_field = b.Asset.field
def function_field(self, reader):
    start = reader.p
    kind = reader.fname()
    if kind != "DelegateProperty":
        reader.p = start
        return original_field(self, reader)
    name = reader.fname()
    flags, dim, size, prop_flags = reader.read("I"), reader.read("i"), reader.read("i"), reader.read("Q")
    rep, notify, condition = reader.read("H"), reader.fname(), reader.read("B")
    return {"name": name, "blueprint_type": kind, "field_flags": flags, "dim": dim,
        "element_size": size, "property_flags": prop_flags, "rep_index": rep,
        "notify": notify, "condition": condition, "signature": self.ref(reader.read("i"))}
b.Asset.field = function_field

TOKENS = {
    0x00: "LocalVariable", 0x01: "InstanceVariable", 0x02: "DefaultVariable",
    0x04: "Return", 0x06: "Jump", 0x07: "JumpIfNot", 0x0b: "Nothing", 0x0f: "Let",
    0x12: "ClassContext", 0x13: "MetaCast", 0x14: "LetBool", 0x15: "EndParmValue",
    0x16: "EndFunctionParms", 0x17: "Self", 0x19: "Context", 0x1a: "ContextFailSilent",
    0x1b: "VirtualFunction", 0x1c: "FinalFunction", 0x1d: "IntConst", 0x1e: "FloatConst",
    0x1f: "StringConst", 0x20: "ObjectConst", 0x21: "NameConst", 0x24: "ByteConst",
    0x25: "IntZero", 0x26: "IntOne", 0x27: "True", 0x28: "False", 0x2a: "NoObject",
    0x2c: "IntConstByte", 0x2d: "NoInterface", 0x2e: "DynamicCast", 0x2f: "StructConst",
    0x30: "EndStructConst", 0x33: "PropertyConst", 0x34: "UnicodeStringConst",
    0x37: "DoubleConst", 0x38: "PrimitiveCast", 0x42: "StructMemberContext",
    0x43: "LetMulticastDelegate", 0x44: "LetDelegate", 0x45: "LocalVirtualFunction",
    0x46: "LocalFinalFunction", 0x48: "LocalOutVariable", 0x4b: "InstanceDelegate",
    0x4c: "PushExecutionFlow", 0x4d: "PopExecutionFlow", 0x4e: "ComputedJump",
    0x4f: "PopExecutionFlowIfNot", 0x53: "EndOfScript", 0x5b: "SkipOffsetConst",
    0x5c: "AddMulticastDelegate", 0x5d: "ClearMulticastDelegate", 0x5f: "LetObj",
    0x60: "LetWeakObjPtr", 0x61: "BindDelegate", 0x62: "RemoveMulticastDelegate",
    0x63: "CallMulticastDelegate", 0x64: "LetValueOnPersistentFrame", 0x68: "CallMath",
    0x69: "SwitchValue",
}

class Bytecode:
    def __init__(self, asset, raw):
        self.asset, self.raw, self.pos, self.vm = asset, raw, 0, 0

    def read(self, fmt, memory_size=None):
        size = struct.calcsize("<" + fmt)
        result = struct.unpack_from("<" + fmt, self.raw, self.pos)[0]
        self.pos += size
        self.vm += size if memory_size is None else memory_size
        return result

    def name(self):
        index, number = self.read("i"), self.read("i", 8)
        value = self.asset.names[index]
        return value if number == 0 else value + "_" + str(number - 1)

    def object(self):
        index = self.read("i", 8)
        record = (self.asset.imports[-index - 1] if index < 0 else self.asset.exports[index - 1]) if index else None
        return {"index": index, "name": self.asset.ref(index),
            "owner": self.asset.ref(record["outer"]) if record else "None"}

    def prop(self):
        start = self.vm
        count = self.read("i")
        assert 0 <= count <= 10, (count, self.pos)
        path = [self.name() for _ in range(count)]
        owner = self.object()
        self.vm = start + 8
        return {"path": path, "owner": owner}

    def sequence(self, end):
        nodes = []
        while True:
            node = self.expression()
            if node["op"] == end:
                return nodes
            nodes.append(node)

    def expression(self):
        pos, vm = self.pos, self.vm
        token = self.read("B")
        assert token in TOKENS, (hex(token), hex(pos), hex(vm))
        node = {"vm": vm, "stored": pos, "op": TOKENS[token]}
        if token in [0x00, 0x01, 0x02, 0x33, 0x48]:
            node["property"] = self.prop()
        elif token in [0x04, 0x4e, 0x4f, 0x5d]:
            node["value"] = self.expression()
        elif token in [0x06, 0x4c, 0x5b]:
            node["target"] = self.read("I")
        elif token == 0x07:
            node["target"], node["condition"] = self.read("I"), self.expression()
        elif token == 0x0f:
            node["property"], node["variable"], node["value"] = self.prop(), self.expression(), self.expression()
        elif token in [0x14, 0x43, 0x44, 0x5c, 0x5f, 0x60, 0x62]:
            node["left"], node["right"] = self.expression(), self.expression()
        elif token in [0x12, 0x19, 0x1a]:
            node["object"] = self.expression()
            node["skip"], node["rvalue"], node["context"] = self.read("I"), self.prop(), self.expression()
        elif token in [0x13, 0x2e]:
            node["class"], node["value"] = self.object(), self.expression()
        elif token in [0x1b, 0x45]:
            node["function"], node["args"] = self.name(), self.sequence("EndFunctionParms")
        elif token in [0x1c, 0x46, 0x68]:
            node["function"], node["args"] = self.object(), self.sequence("EndFunctionParms")
        elif token in [0x1d, 0x1e, 0x24, 0x2c, 0x37]:
            node["value"] = self.read({0x1d: "i", 0x1e: "f", 0x24: "B", 0x2c: "B", 0x37: "d"}[token])
        elif token in [0x1f, 0x34]:
            chars, fmt = [], "B" if token == 0x1f else "H"
            while (value := self.read(fmt)) != 0:
                chars.append(value)
            node["value"] = "".join(map(chr, chars))
        elif token == 0x20:
            node["value"] = self.object()
        elif token in [0x21, 0x4b]:
            node["value"] = self.name()
        elif token == 0x2f:
            node["struct"], node["size"] = self.object(), self.read("i")
            node["values"] = self.sequence("EndStructConst")
        elif token == 0x38:
            node["conversion"], node["value"] = self.read("B"), self.expression()
        elif token in [0x42, 0x64]:
            node["property"], node["value"] = self.prop(), self.expression()
        elif token == 0x61:
            node["function"], node["delegate"], node["object"] = self.name(), self.expression(), self.expression()
        elif token == 0x63:
            node["function"], node["delegate"] = self.object(), self.expression()
            node["args"] = self.sequence("EndFunctionParms")
        elif token == 0x69:
            count, node["end"] = self.read("H"), self.read("I")
            node["index"] = self.expression()
            node["cases"] = [{"match": self.expression(), "next": self.read("I"), "value": self.expression()} for _ in range(count)]
            node["default"] = self.expression()
        else:
            assert token in [0x0b, 0x15, 0x16, 0x17, 0x25, 0x26, 0x27, 0x28,
                0x2a, 0x2d, 0x30, 0x4d, 0x53], (token, pos)
        node["end_vm"], node["end_stored"] = self.vm, self.pos
        return node

def expression_text(node):
    op = node["op"]
    if "Variable" in op:
        return ".".join(node["property"]["path"])
    if op in ["IntConst", "FloatConst", "DoubleConst", "ByteConst", "IntConstByte",
              "StringConst", "UnicodeStringConst", "NameConst", "InstanceDelegate"]:
        return repr(node["value"])
    if op == "ObjectConst":
        return node["value"]["name"]
    if op in ["FinalFunction", "LocalFinalFunction", "CallMath", "VirtualFunction", "LocalVirtualFunction"]:
        fn = node["function"]
        label = fn["name"] if isinstance(fn, dict) else fn
        if isinstance(fn, dict) and fn["name"] == "OnDeath" and fn["index"] < 0:
            label = fn["owner"] + "." + label
        return label + "(" + ", ".join(map(expression_text, node["args"])) + ")"
    if op in ["Context", "ClassContext", "ContextFailSilent"]:
        return expression_text(node["object"]) + "." + expression_text(node["context"])
    if op in ["Let", "LetObj", "LetBool", "LetWeakObjPtr", "LetDelegate", "LetMulticastDelegate"]:
        return expression_text(node.get("variable", node.get("left"))) + " = " + expression_text(node.get("value", node.get("right")))
    if op == "LetValueOnPersistentFrame":
        return ".".join(node["property"]["path"]) + " = " + expression_text(node["value"])
    if op == "BindDelegate":
        return "bind " + expression_text(node["delegate"]) + " := " + expression_text(node["object"]) + "." + node["function"]
    if op in ["AddMulticastDelegate", "RemoveMulticastDelegate"]:
        return op + "(" + expression_text(node["left"]) + ", " + expression_text(node["right"]) + ")"
    if op in ["Jump", "PushExecutionFlow", "SkipOffsetConst"]:
        return op + " " + hex(node["target"])
    if op == "JumpIfNot":
        return "if not " + expression_text(node["condition"]) + " -> " + hex(node["target"])
    if op in ["Return", "PopExecutionFlowIfNot", "ComputedJump"]:
        return op + " " + expression_text(node["value"])
    if op in ["DynamicCast", "MetaCast"]:
        return node["class"]["name"] + "(" + expression_text(node["value"]) + ")"
    if op == "PrimitiveCast":
        return op + " " + str(node["conversion"]) + " " + expression_text(node["value"])
    if op == "StructConst":
        return node["struct"]["name"] + "{" + ", ".join(map(expression_text, node["values"])) + "}"
    if op == "CallMulticastDelegate":
        return "broadcast " + expression_text(node["delegate"]) + "(" + ", ".join(map(expression_text, node["args"])) + ")"
    assert op in ["Self", "IntZero", "IntOne", "True", "False", "Nothing", "NoObject", "EndOfScript", "PopExecutionFlow"], op
    return op

out = {}
for name in ["BP_Megafloat_Center_CorePillar_C", "BP_Megafloat_Center_Core_C", "BP_Megafloat_Center_Core_Outer_C"]:
    asset = b.asset(name)
    functions = {}
    for export in asset.exports:
        if asset.ref(export["cls"]) != "Function":
            continue
        reader = asset.export_reader(export)
        assert reader.read("I") == 0 and reader.header() == [] and reader.read("I") == 0
        super_index, count = reader.read("i"), reader.read("i")
        reader.bytes(count * 4)
        count = reader.read("i")
        fields = [asset.field(reader) for _ in range(count)]
        memory_size, stored_size = reader.read("i"), reader.read("i")
        script_offset = reader.p
        raw = reader.bytes(stored_size)
        flags = reader.read("I")
        tail = reader.bytes(len(reader.data) - reader.p)
        assert not any(tail), (name, export["name"], tail.hex())
        bc = Bytecode(asset, raw)
        nodes = []
        while bc.pos < len(raw):
            nodes.append(bc.expression())
        assert nodes[-1]["op"] == "EndOfScript"
        assert bc.pos == stored_size and bc.vm == memory_size, (name, export["name"], bc.pos, stored_size, bc.vm, memory_size)
        functions[export["name"]] = {"export_index": export["index"], "uexp_offset": export["offset"],
            "script_offset": export["offset"] + script_offset, "memory_size": memory_size,
            "stored_size": stored_size, "fields": fields, "function_flags": flags,
            "tail_zero_bytes": len(tail), "code_sha256": hashlib.sha256(raw).hexdigest(), "nodes": nodes,
            "trace": [{"vm": hex(n["vm"]), "stored": hex(n["stored"]), "op": n["op"],
                "expression": expression_text(n)} for n in nodes]}
    decoded = b.decode(name)
    assert decoded["error"] is None and decoded["consumed"] == decoded["export_bytes"]
    out[name] = {"source": str(asset.path.relative_to(ROOT)), "uasset_sha256": hashlib.sha256(asset.data).hexdigest(),
        "uexp_sha256": hashlib.sha256(asset.payload).hexdigest(), "cdo": decoded, "functions": functions,
        "imports": asset.imports, "exports": asset.exports}
    print(name, "functions", len(functions), "all stored/VM boundaries matched")

# Verify all explicit branch and latent-resume destinations, plus the entry
# offsets in event wrappers, against decoded VM boundaries (not stored bytes).
def walk(value):
    if isinstance(value, dict):
        if "op" in value:
            yield value
        for child in value.values():
            yield from walk(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk(child)

entries = {}
for name, blueprint in out.items():
    graph_name = "ExecuteUbergraph_" + name.removesuffix("_C")
    graph = blueprint["functions"][graph_name]
    boundaries = {node["vm"] for node in graph["nodes"]}
    entries[name] = {}
    for fn, record in blueprint["functions"].items():
        local_boundaries = {node["vm"] for node in record["nodes"]}
        for node in walk(record["nodes"]):
            if node["op"] in ["Jump", "JumpIfNot", "PushExecutionFlow", "SkipOffsetConst"]:
                assert node["target"] in local_boundaries, (name, fn, node)
            if node["op"] == "LocalFinalFunction" and node["function"]["name"] == graph_name:
                assert node["args"][0]["op"] == "IntConst"
                entry = node["args"][0]["value"]
                assert entry in boundaries
                entries[name][fn] = entry

pillar = out["BP_Megafloat_Center_CorePillar_C"]
graph = pillar["functions"]["ExecuteUbergraph_BP_Megafloat_Center_CorePillar"]["nodes"]
by_vm = {n["vm"]: n for n in graph}
assert entries["BP_Megafloat_Center_CorePillar_C"]["OnCoreDeath_イベント"] == 0x479
assert entries["BP_Megafloat_Center_CorePillar_C"]["OnOuterDeath_イベント"] == 0x595
for offset, state in [(0x479, 4), (0x595, 1)]:
    assert by_vm[offset]["function"]["name"] == "SetDamageState"
    assert by_vm[offset]["args"][0]["value"] == state
kill = by_vm[0x3b2]
assert kill["object"]["property"]["path"] == ["LiveSelfTimerDamage"]
assert kill["context"]["function"]["name"] == "SelfDeath"
assert kill["context"]["args"][0]["value"] == 0
assert kill["context"]["args"][1]["op"] == "True"

ref = ROOT / "docs/initial/ref"
tables = {}
for name in ["DT_NPC", "DT_NPC_Model", "DT_NPC_Mission027"]:
    source = ref / "tables" / (name + ".json")
    data = json.loads(source.read_text(encoding="utf-8"))
    tables[name] = {"sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "rows": {row["row"]: row["values"] for row in data["rows"] if row["row"] in [
            "Megafloat_Center_CorePillar", "Megafloat_Center_CorePillar_01",
            "Megafloat_Center_Core", "Megafloat_Center_Core_01",
            "Megafloat_Center_Core_Outer", "Megafloat_Center_Core_Outer_01"]}}
assert tables["DT_NPC"]["rows"]["Megafloat_Center_CorePillar_01"]["ChildNPCId"] == ["Megafloat_Center_Core_01"]
assert tables["DT_NPC"]["rows"]["Megafloat_Center_Core_01"]["ChildNPCId"] == ["Megafloat_Center_Core_Outer_01"]
catalog = json.loads((ROOT / "data/local/catalog.json").read_text(encoding="utf-8"))
target = next(t for t in catalog["targets"] if t["id"] == 429)
assert target["sourceRefs"] == [{"table": "DT_NPC_Mission027", "row": "Megafloat_Center_CorePillar_01"}]

# Current-build reflection names the second SelfDeath parameter bForceKill.
def offset(address):
    return p.pe.get_offset_from_rva(address - p.base)

def ascii_name(address):
    pos = offset(address)
    return p.exe[pos:p.exe.index(b"\0", pos)].decode("ascii")

params_va = 0x14dd75690
params = offset(params_va)
assert ascii_name(struct.unpack_from("<Q", p.exe, params + 16)[0]) == "SelfDeath"
count = struct.unpack_from("<H", p.exe, params + 48)[0]
pointer = struct.unpack_from("<Q", p.exe, params + 40)[0]
parameters = []
for index in range(count):
    prop = struct.unpack_from("<Q", p.exe, offset(pointer) + index * 8)[0]
    name = ascii_name(struct.unpack_from("<Q", p.exe, offset(prop))[0])
    parameters.append({"name": name, "address": hex(prop)})
assert [v["name"] for v in parameters] == ["InTime", "bForceKill"]

xref_path = ref / "scripts/code_xrefs.py"
source = xref_path.read_text(encoding="utf-8").split("if __name__=='__main__':")[0]
source = source.replace("data=Path('Game/Binaries/Win64/AceCombat8.exe').read_bytes()", "data=p.exe")
c = {"__file__": str(xref_path), "__name__": "core_pillar_native", "p": p}
exec(compile(source, str(xref_path), "exec"), c)
native = {}
for name, address in {
    "core_pillar_setup": 0x147e60fe0, "set_damage_state": 0x147e60a00,
    "self_death_exec": 0x146fda520, "self_damage_immediate": 0x147bffc40,
    "building_invincibility": 0x147c5b8a0,
}.items():
    code = c["disasm_full"](address)
    assert code and code[0].address == address
    native[name] = {"address": hex(address), "instructions": [f"{i.address:#x} {i.mnemonic} {i.op_str}" for i in code],
        "code_sha256": hashlib.sha256(b"".join(bytes(i.bytes) for i in code)).hexdigest()}
assert any("call 0x147bffc40" in x for x in native["self_death_exec"]["instructions"])
assert any("call qword ptr [rax + 0x970]" in x for x in native["self_damage_immediate"]["instructions"])
enum_path = ROOT / "data/local/current-native/indexes/native_enums.json"
damage_states = json.loads(enum_path.read_text(encoding="utf-8"))["ELiveMegafloatConstructionDamage"]
assert damage_states["1"] == "Minor" and damage_states["4"] == "Destruct"

assert scope["before"] == {str(x.relative_to(ROOT)): scope["digest"](x) for x in scope["protected"]}
(ROOT / "data/local/local003-core-pillar.json").write_text(json.dumps({
    "exe_sha256": hashlib.sha256(p.exe).hexdigest(), "blueprints": out,
    "target_mapping": {k: target[k] for k in ["id", "name", "sourceRefs"]},
    "event_entries": entries, "source_tables": tables, "native": native,
    "self_death_parameters": {"function_params": hex(params_va), "parameters": parameters},
    "construction_damage_states": damage_states,
    "native_enums_sha256": hashlib.sha256(enum_path.read_bytes()).hexdigest(),
    "protected_sha256": scope["before"]}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
