"""Compare current durability with mission WeaponDurabilityId overrides disabled."""
import collections
import hashlib
import json
import re
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
hashes = {}


def read(name):
    raw = (ROOT / name).read_bytes()
    hashes[name] = hashlib.sha256(raw).hexdigest()
    return json.loads(raw)


def table(name):
    return {r['row']: r['values'] for r in read(f'docs/initial/ref/tables/{name}.json')['rows']}


def f32(x):
    return struct.unpack('<f', struct.pack('<f', x))[0]


def rate(x):
    return f32(f32(x) * f32(0.01))


def key(x):
    def normalized(v):
        if isinstance(v, dict):
            return {k: normalized(a) for k, a in v.items()}
        if isinstance(v, (int, float)) and not isinstance(v, bool):
            return float(v)
        return v
    return json.dumps(normalized(x), sort_keys=True)


def base(r):
    return re.sub(r'《[^》]*》| \[M\d+\]$', '', r['name'])


def combat(r):
    return {k: r[k] for k in ('hp', 'damageMultipliers', 'isAir', 'roleGroup', 'standardDamage')}


rows = [r for r in read('src/data/targets.json') if r['category'] != 'EXCLUDED']
catalog = read('data/local/catalog.json')
definitions = {r['id']: r for r in catalog['targets']}
npcs, durability, explosion = table('DT_NPC'), table('DT_NPC_WeaponDurability'), table('DT_NPC_ExplosionDurability')
weapons = {r['WeaponID']: r for r in table('DT_LiveWeapon').values()}
columns = {}
for w in catalog['weapons']:
    column = 'Category' + str(weapons[w['weaponId']]['WeaponDurabilityCategory']).zfill(2)
    assert w['multiplierKey'] not in columns or columns[w['multiplierKey']] == column
    columns[w['multiplierKey']] = column
missions = {}


def rates(npc, durability_id):
    durable = durability[durability_id] if durability_id != 'None' else None
    values = {k: rate(durable[c]) if durable else None for k, c in columns.items()}
    expl = explosion[npc['ExplosionDurabilityId']] if npc['ExplosionDurabilityId'] != 'None' else None
    for k, c, fallback in [('lacmBlast', 'PlayerLACM', 'groundMissile'), ('lagmBlast', 'PlayerLAGM', 'groundMissile'), ('lasmBlast', 'PlayerLASM', 'antiShipMissile')]:
        values[k] = rate(expl[c]) if expl else values[fallback]
    return values


before, after = collections.defaultdict(list), collections.defaultdict(list)
broad = collections.defaultdict(list)
broad_changed = []
details, changed, split = [], [], []
for r in rows:
    before[(base(r), key(combat(r)))].append(r['id'])
    variants = {}
    broad_variants = set()
    source_details = []
    for ref in definitions[r['id']]['sourceRefs']:
        mission = None
        if ref['table'] != 'DT_NPC':
            if ref['table'] not in missions:
                missions[ref['table']] = table(ref['table'])
            mission = missions[ref['table']][ref['row']]
        npc_id = mission['NpcId'] if mission else ref['row']
        npc = npcs[npc_id]
        override = mission['WeaponDurabilityId'] if mission else 'None'
        current = rates(npc, override if override != 'None' else npc['WeaponDurabilityId'])
        assert current == r['damageMultipliers'], (r['id'], ref)
        proposed = rates(npc, npc['WeaponDurabilityId'])
        broad_id = 'NPC_WPDur_000' if npc['WeaponDurabilityId'] == 'NPC_WPDur_001_MS25day2' else npc['WeaponDurabilityId']
        broad_rates = rates(npc, broad_id)
        broad_variants.add(key({**combat(r), 'damageMultipliers': broad_rates}))
        if broad_rates != proposed and r['id'] not in broad_changed:
            broad_changed.append(r['id'])
        signature = key({**combat(r), 'damageMultipliers': proposed})
        variants[signature] = proposed
        source_details.append({**ref, 'npcId': npc_id, 'npcDurabilityId': npc['WeaponDurabilityId'],
                               'missionDurabilityId': override, 'baseRates': proposed})
    if len(variants) > 1:
        split.append(r['id'])
    for signature in variants:
        after[(base(r), signature)].append(r['id'])
    for signature in sorted(broad_variants):
        broad[(base(r), signature)].append(r['id'])
    if any(v != r['damageMultipliers'] for v in variants.values()):
        changed.append(r['id'])
    details.append({'id': r['id'], 'name': r['name'], 'current': combat(r),
                    'baseVariants': list(variants.values()), 'sources': source_details})


def groups(g):
    return [{'name': n, 'combat': json.loads(s), 'ids': ids} for (n, s), ids in g.items()]


result = {'summary': {'published': len(rows), 'beforeGroups': len(before), 'afterGroups': len(after),
                      'changedIds': changed, 'splitIds': split,
                      'additionalM25ReplacementIds': broad_changed, 'withM25ReplacementGroups': len(broad)},
          'm25ReplacementAssumption': 'NPC_WPDur_001_MS25day2 -> NPC_WPDur_000; hypothetical policy, not verified runtime behavior',
          'inputSha256': hashes, 'beforeGroups': groups(before), 'afterGroups': groups(after),
          'withM25ReplacementGroups': groups(broad), 'targets': details}
(OUT / 'BASE_DURABILITY.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf8')
print(json.dumps(result['summary']))
for n in dict.fromkeys(base(r) for r in rows):
    old = [(s, ids) for (name, s), ids in before.items() if name == n]
    new = [(s, ids) for (name, s), ids in after.items() if name == n]
    if old != new:
        print(n, len(old), '->', len(new), [ids for _, ids in new])
print('AA GUN')
for (n, s), ids in after.items():
    if n == 'AA GUN':
        print(ids, s)
