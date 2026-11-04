"""Read-only audit of targets whose display names contain VEHICLE.

Usage: python -B -X utf8 docs/analysis/calculation/investigate_vehicles.py EXE
Uses existing extracted tables/assets; does not execute game code or regenerate data.
"""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
bootstrap = ROOT / 'docs/analysis/calculation/investigate_weapon_uncertainties.py'
scope = {'__file__': str(bootstrap), '__name__': 'vehicle_readonly_inspection'}
exec(compile(bootstrap.read_text(encoding='utf-8').split('\nmapping = []')[0],
             str(bootstrap), 'exec'), scope)
b, p, w = (scope[k] for k in ['b', 'p', 'w'])
hashes = {}


def read(path):
    hashes[path.relative_to(ROOT).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
    return json.loads(path.read_text(encoding='utf-8'))


def table(name):
    return {r['row']: r['values'] for r in read(ROOT / 'docs/initial/ref/tables' / f'{name}.json')['rows']}


catalog = read(ROOT / 'data/local/catalog.json')
targets = [t for t in read(ROOT / 'src/data/targets.json') if 'VEHICLE' in t['name']]
definitions = [t for t in catalog['targets'] if t['id'] in {t['id'] for t in targets}]
assert len(targets) == len(definitions) == 7
npcs, models = table('DT_NPC'), table('DT_NPC_Model')
selected_npcs, blueprints, resolved = set(), {}, []
for definition in definitions:
    sources = []
    for source in definition['sourceRefs']:
        row = table(source['table'])[source['row']]
        mission = row if source['table'] != 'DT_NPC' else None
        npc_id = mission['NpcId'] if mission else source['row']
        npc = npcs[npc_id]
        model = models[npc['ModelId']]
        selected_npcs.add(npc_id)
        sources.append({**source, 'npcId': npc_id, 'modelId': npc['ModelId'],
                        'displayNameKey': model['GameObjectDisplayName01'],
                        'modelHp': model['MaxHealth'], 'npcHpDifference': npc['MaxHealthDifference'],
                        'missionHpDifference': mission['MaxHealthDifference'] if mission else None,
                        'minimumHp': mission['MinHealth'] if mission else None,
                        'baseDurabilityId': npc['WeaponDurabilityId'],
                        'missionDurabilityId': mission['WeaponDurabilityId'] if mission else None,
                        'childNpcIds': npc['ChildNPCId'], 'blueprint': model['BlueprintClass']['asset']})
        name = model['BlueprintClass']['asset']
        while name not in w.classes and name not in blueprints:
            decoded = b.decode(name)
            assert not decoded['error'] and decoded['consumed'] == decoded['export_bytes'], decoded
            asset = b.asset(name)
            blueprints[name] = {
                'parent': decoded['parent'], 'properties': decoded['properties'],
                'consumedBytes': decoded['consumed'], 'exportBytes': decoded['export_bytes'],
                'functions': [e['name'] for e in asset.exports if asset.ref(e['cls']) == 'Function'],
                'uassetSha256': hashlib.sha256(asset.data).hexdigest(),
                'uexpSha256': hashlib.sha256(asset.payload).hexdigest(),
            }
            name = decoded['parent']
    resolved.append({'id': definition['id'], 'sources': sources})

mission_references = []
for path in sorted((ROOT / 'docs/initial/ref/tables').glob('DT_NPC_Mission*.json')):
    for name, row in table(path.stem).items():
        if row['NpcId'] in selected_npcs:
            mission_references.append({'table': path.stem, 'row': name, 'npcId': row['NpcId']})

protected = scope['scope']['protected']
after = {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest() for path in protected}
assert after == scope['scope']['before']
result = {
    'date': '2026-11-04', 'headAtReview': '17e73cc',
    'method': 'Static tables and Blueprint CDOs; community mission descriptions; no runtime measurement',
    'tableBaselineBuild': 25201480, 'currentExecutableMatchesBaseline': False,
    'exeSha256': hashlib.sha256(p.exe).hexdigest(),
    'currentTargets': targets, 'sourceResolution': resolved,
    'allMatchingMissionReferences': mission_references, 'blueprints': blueprints,
    'inputSha256': hashes, 'protectedFilesUnchanged': after,
}
Path(__file__).with_name('VEHICLE_EVIDENCE.json').write_text(
    json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(targets)} targets; {len(mission_references)} mission references; '
      f'{len(blueprints)} fully decoded Blueprint CDOs; application data unchanged')
