"""Read-only CONTAINER SHIP audit; no game execution or application regeneration.

Usage: python -B -X utf8 docs/analysis/calculation/investigate_container_ships.py EXE
Requires the existing reference tables, npc-raw assets and native parser cache.
"""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
bootstrap = ROOT / 'docs/analysis/calculation/investigate_weapon_uncertainties.py'
scope = {'__file__': str(bootstrap), '__name__': 'container_readonly_inspection'}
exec(compile(bootstrap.read_text(encoding='utf-8').split('\nmapping = []')[0],
             str(bootstrap), 'exec'), scope)
b, p, w = (scope[k] for k in ['b', 'p', 'w'])
input_hashes = {}


def read(path):
    input_hashes[path.relative_to(ROOT).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
    return json.loads(path.read_text(encoding='utf-8'))


def table(name):
    return {row['row']: row['values'] for row in read(ROOT / 'docs/initial/ref/tables' / f'{name}.json')['rows']}


npcs, models, durability = table('DT_NPC'), table('DT_NPC_Model'), table('DT_NPC_WeaponDurability')
selected = {name: row for name, row in npcs.items()
            if any(token in name.lower() for token in ['ctsl', 've025_cont'])}
mission_rows = []
for path in sorted((ROOT / 'docs/initial/ref/tables').glob('DT_NPC_Mission*.json')):
    for name, row in table(path.stem).items():
        if row['NpcId'] not in selected:
            continue
        npc = npcs[row['NpcId']]
        model = models[npc['ModelId']]
        durability_id = row['WeaponDurabilityId']
        if durability_id == 'None':
            durability_id = npc['WeaponDurabilityId']
        mission_rows.append({
            'table': path.stem, 'row': name, 'npcId': row['NpcId'],
            'modelId': npc['ModelId'], 'modelHp': model['MaxHealth'],
            'npcHpDifference': npc['MaxHealthDifference'],
            'missionHpDifference': row['MaxHealthDifference'], 'minimumHp': row['MinHealth'],
            'baseDurabilityId': npc['WeaponDurabilityId'], 'missionDurabilityId': row['WeaponDurabilityId'],
            'baseGunPercent': durability[npc['WeaponDurabilityId']]['Category02'],
            'effectiveGunPercent': durability[durability_id]['Category02'],
            'childNpcIds': npc['ChildNPCId'], 'childComponentNames': npc['ChildNPCComponentNames'],
        })

catalog = read(ROOT / 'data/local/catalog.json')
target_ids = {12, 222, 223, 491, 492}
targets = [t for t in read(ROOT / 'src/data/targets.json') if t['id'] in target_ids]
definitions = [t for t in catalog['targets'] if t['id'] in target_ids]
assert len(targets) == len(definitions) == 5
blueprints = {}
names = {name + '_C' for name in b.paths
         if any(token in name.lower() for token in ['ve020_ctsl', 've021_', 've025_cont'])}
for initial in sorted(names):
    name = initial
    while name not in w.classes and name not in blueprints:
        decoded = b.decode(name)
        assert not decoded['error'] and decoded['consumed'] == decoded['export_bytes'], decoded
        asset = b.asset(name)
        components = []
        for export in asset.exports:
            if asset.ref(export['cls']) != 'LiveChainDamagedState':
                continue
            reader = asset.export_reader(export)
            fields = b.fields('LiveChainDamagedState')
            values = {fields[i]['name']: reader.value(fields[i], zero) for i, zero in reader.header()}
            assert reader.read('I') == 0 and reader.p == export['size']
            components.append({'name': export['name'], 'properties': values, 'bytes': reader.p})
        blueprints[name] = {
            'parent': decoded['parent'], 'properties': decoded['properties'],
            'consumedBytes': decoded['consumed'], 'exportBytes': decoded['export_bytes'],
            'functions': [e['name'] for e in asset.exports if asset.ref(e['cls']) == 'Function'],
            'chainDamageSubobjects': components,
            'uassetSha256': hashlib.sha256(asset.data).hexdigest(),
            'uexpSha256': hashlib.sha256(asset.payload).hexdigest(),
        }
        name = decoded['parent']

protected = scope['scope']['protected']
after = {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest() for path in protected}
assert after == scope['scope']['before']
result = {
    'date': '2026-11-04', 'headAtReview': 'ccb3fdd',
    'method': 'Static table and Blueprint inspection; no runtime spawn/faction/damage measurement',
    'tableBaselineBuild': 25201480, 'currentExecutableMatchesBaseline': False,
    'exeSha256': hashlib.sha256(p.exe).hexdigest(),
    'currentTargets': targets, 'catalogDefinitions': definitions,
    'missionReferences': mission_rows, 'blueprints': blueprints,
    'communitySources': [
        {'url': 'https://gamerch.com/acecombat8/1017964', 'finding': 'M16 has three hostile disguised ships among civilian traffic.'},
        {'url': 'https://acecombat.wiki.gg/wiki/Singer', 'access': 'Search index; direct open returned HTTP 403',
         'finding': 'Three MANPADS on the hostile ships; cannot be targeted independently.'},
        {'url': 'https://gamerch.com/acecombat8/1019038', 'finding': 'M23 naval combat is described, but container ships are not individually identified.'},
        {'url': 'https://gamerch.com/acecombat8/1019044', 'finding': 'M27 container ships are not individually identified.'},
    ],
    'inputSha256': input_hashes, 'protectedFilesUnchanged': after,
}
destination = Path(__file__).with_name('CONTAINER_SHIP_EVIDENCE.json')
destination.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(targets)} targets, {len(mission_rows)} mission references, {len(blueprints)} fully decoded Blueprint CDOs; application data unchanged')
