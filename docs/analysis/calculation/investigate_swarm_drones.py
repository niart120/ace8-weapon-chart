"""Read-only SWARM DRONES investigation; never executes game instructions.

Usage: python -B -X utf8 docs/analysis/calculation/investigate_swarm_drones.py EXE
Uses the existing reference parsers, current-native cache and npc-raw assets.
Writes SWARM_DRONES_EVIDENCE.json beside this script. Application data is protected.
"""
import hashlib
import json
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
bootstrap = ROOT / 'docs/analysis/calculation/investigate_weapon_uncertainties.py'
scope = {'__file__': str(bootstrap), '__name__': 'swarm_readonly_inspection'}
exec(compile(bootstrap.read_text(encoding='utf-8').split('\nmapping = []')[0],
             str(bootstrap), 'exec'), scope)
b, p, w = (scope[k] for k in ['b', 'p', 'w'])
native, rendered = scope['native_function'], scope['rendered']


def table(name):
    data = json.loads((ROOT / 'docs/initial/ref/tables' / f'{name}.json').read_text(encoding='utf-8'))
    return {r['row']: r['values'] for r in data['rows']}


checks = [
    (0x147e86650, 'mov', '[rcx + 0x25f8]'),
    (0x147e86657, 'jmp', '0x147e849e0'),
    (0x147e818bb, 'movss', '[r14 + 0x8a0]'),
    (0x147e81907, 'call', '0x147e84870'),
    (0x147e819e8, 'call', '0x147e84ef0'),
    (0x147e848f2, 'movss', '[rbp + 0x54]'),
    (0x147e8490f, 'addss', 'xmm3, xmm6'),
    (0x147e84913, 'call', '0x147e80060'),
    (0x147e80100, 'call', '0x147e97ef0'),
    (0x147e98991, 'test', '[r8 + 0x8c]'),
    (0x147e989a3, 'movups', '[r8 + 0x20]'),
    (0x147e98a6c, 'comiss', 'xmm0, dword ptr [rax]'),
    (0x147e84f0d, 'comiss', 'xmm2, xmm0'),
    (0x147e84f13, 'jbe', '0x147e85143'),
    (0x147e84f19, 'mov', '[rcx + 0x70]'),
    (0x147e84f32, 'call', '0x147e92560'),
    (0x147e84f4a, 'movss', '[rax + 8]'),
    (0x147e85014, 'call', '0x147e847b0'),
    (0x147e85136, 'call', '0x147e7f570'),
    (0x147e7f5c0, 'cmp', 'dword ptr [rax], ebx'),
    (0x147e7f5f1, 'mov', 'dword ptr [rsi + rax], ebx'),
    (0x147e7d1be, 'sub', 'dword ptr [rsi + 0xfc], ecx'),
    (0x147e8a4d6, 'mov', 'qword ptr [rsp + 0x28], 0'),
    (0x147e8a4e7, 'call', '0x147e84ef0'),
    (0x147e8a4fd, 'mov', 'dword ptr [rax + 0xc]'),
    (0x147e8a502, 'setle', 'al'),
    (0x147e95d95, 'comiss', 'xmm0, dword ptr [rbp - 0x7c]'),
    (0x147e95dc3, 'call', 'qword ptr [rax + 0x10]'),
]
for address, mnemonic, operand in checks:
    instruction = scope['direct'](address, 15)[0]
    assert instruction.mnemonic == mnemonic and operand in instruction.op_str, rendered([instruction])
assert scope['pointer'](0x14c572890 + 0xa38) == 0x147e86650

constants = {}
for address, expected in [(0x147e81952, 1.0), (0x147e848fc, 100.0)]:
    instruction = scope['direct'](address, 15)[0]
    operand = instruction.operands[1]
    assert operand.mem.base == p.capstone.x86.X86_REG_RIP
    target = instruction.address + instruction.size + operand.mem.disp
    value = struct.unpack('<f', scope['data_at'](target, 4))[0]
    assert value == expected
    constants[hex(address)] = {'constantAddress': hex(target), 'value': value}

models, npcs = table('DT_NPC_Model'), table('DT_NPC')
catalog = json.loads((ROOT / 'data/local/catalog.json').read_text(encoding='utf-8'))
targets = []
blueprints = {}
for target in catalog['targets']:
    if target['id'] not in [156, 465]:
        continue
    sources = []
    for source in target['sourceRefs']:
        mission = table(source['table'])[source['row']]
        npc = npcs[mission['NpcId']]
        model = models[npc['ModelId']]
        name = model['BlueprintClass']['asset']
        chain = []
        while name not in w.classes:
            decoded = b.decode(name)
            assert not decoded['error'] and decoded['consumed'] == decoded['export_bytes']
            asset = b.asset(name)
            refs = {k: asset.ref(v) for k, v in decoded['properties'].items()
                    if k in ['ManagerClass', 'ControlTargetClass']}
            blueprints[name] = {
                'parent': decoded['parent'], 'references': refs,
                'consumedBytes': decoded['consumed'], 'exportBytes': decoded['export_bytes'],
                'uassetSha256': hashlib.sha256(asset.data).hexdigest(),
                'uexpSha256': hashlib.sha256(asset.payload).hexdigest(),
            }
            chain.append(name)
            name = decoded['parent']
        assert name in ['LiveAISwarmDroneControlActor', 'LiveAISwarmDroneManagerGameObject']
        sources.append({**source, 'model': npc['ModelId'], 'maxHealth': model['MaxHealth'],
                        'npcHealthDifference': npc['MaxHealthDifference'],
                        'missionHealthDifference': mission['MaxHealthDifference'],
                        'nativeParent': name, 'blueprintChain': chain})
    targets.append({'id': target['id'], 'sources': sources})

# Bounded instruction excerpts, rather than unrelated neighboring code.
ranges = [
    (0x147e86650, 0x147e86660), (0x147e818bb, 0x147e8190c),
    (0x147e81996, 0x147e819ed), (0x147e848f2, 0x147e84918),
    (0x147e98979, 0x147e98aa1), (0x147e84ef0, 0x147e8501e),
    (0x147e850d3, 0x147e85154), (0x147e7f570, 0x147e7f604),
    (0x147e7d124, 0x147e7d1d0), (0x147e8a480, 0x147e8a51d),
    (0x147e92560, 0x147e92623), (0x147e95d41, 0x147e95dca),
]
evidence = []
for start, end in ranges:
    code = [i for i in native(start) if start <= i.address < end]
    assert code and code[0].address == start
    evidence.append({'start': hex(start), 'endExclusive': hex(end), 'instructions': rendered(code)})

protected = scope['scope']['protected']
after = {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest() for path in protected}
assert after == scope['scope']['before']
result = {
    'date': '2026-11-04', 'method': 'Static analysis; no game execution or instruction emulation',
    'exeSha256': hashlib.sha256(p.exe).hexdigest(), 'exeBytes': len(p.exe),
    'baselineBuild': 25201480, 'baselineExeMatchesCurrent': False,
    'targets': targets, 'blueprints': blueprints, 'constants': constants,
    'assertedInstructionCount': len(checks), 'nativeEvidence': evidence,
    'protectedFilesUnchanged': after,
    'limits': ['No runtime observation', 'No mission-specific manager/group/chain-setting asset values decoded',
               'No complete weapon-by-weapon validation', 'No equivalence claim for baseline executable'],
}
output = Path(__file__).with_name('SWARM_DRONES_EVIDENCE.json')
output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'targets': len(targets), 'blueprints': len(blueprints),
                  'instructionChecks': len(checks), 'protectedFilesUnchanged': True}))
