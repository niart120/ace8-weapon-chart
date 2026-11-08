"""Read extracted CDOs and table references; never starts the game or edits masters."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
bootstrap = ROOT / 'docs/analysis/calculation/investigate_target_attributes.py'
scope = {'__file__': str(bootstrap), '__name__': 'targetability_inspection'}
exec(compile(bootstrap.read_text(encoding='utf8').split('\ndef table(')[0], str(bootstrap), 'exec'), scope)
b, p, w = (scope[k] for k in ('b', 'p', 'w'))


def read(path):
    return json.loads((ROOT/path).read_text(encoding='utf8'))


def table(name):
    return {r['row']: r['values'] for r in read(f'docs/initial/ref/tables/{name}.json')['rows']}


rows = read('src/data/targets.json')
definitions = {r['id']: r for r in read('data/local/catalog.json')['targets']}
npcs, models = table('DT_NPC'), table('DT_NPC_Model')
parents = {r['id'] for r in rows if 'LAND BATTLESHIP' in r['name'] and r['partOf'] is None}
selected = [r for r in rows if 'WING SPAR' in r['name'] or r['name'].startswith('BUILDING')
            or r['id'] in parents or r['partOf'] in parents or r['id'] == 372]
cache, errors, records = {}, {}, []
pattern = re.compile(r'lock|target|hud|marker|damage|destr|death|invinc|health|score', re.I)
for r in selected:
    names, sources = set(), []
    for ref in definitions[r['id']]['sourceRefs']:
        raw = table(ref['table'])[ref['row']]
        npc_id = raw['NpcId'] if ref['table'] != 'DT_NPC' else ref['row']
        npc = npcs[npc_id]
        model = models[npc['ModelId']]
        names.add(model['BlueprintClass']['asset'])
        sources.append({**ref, 'npcId': npc_id, 'modelId': npc['ModelId'],
                        'displayKey': model['GameObjectDisplayName01'],
                        'npcDisplayKey': npc['GameObjectDisplayName02'], 'score': npc['BaseScore']})
    variants = []
    for initial in sorted(names):
        current, chain, effective, origins = initial, [], {}, {}
        while current and current not in w.classes and current not in chain:
            chain.append(current)
            if current not in cache and current not in errors:
                try:
                    d = b.decode(current)
                    a = b.asset(current)
                    cache[current] = {**d, 'functions': [e['name'] for e in a.exports if a.ref(e['cls']) == 'Function']}
                except Exception as ex:
                    errors[current] = str(ex)
            if current in errors:
                break
            d = cache[current]
            for k, v in d['properties'].items():
                if k not in effective:
                    effective[k], origins[k] = v, current
            current = d['parent']
        native_chain = []
        while current in w.classes:
            native_chain.append(current)
            current = w.get_parent(current)
        variants.append({'blueprint': initial, 'chain': chain, 'nativeChain': native_chain,
                         'complete': all(n in cache and not cache[n]['error'] and cache[n]['consumed'] == cache[n]['export_bytes'] for n in chain),
                         'properties': {k:v for k,v in effective.items() if pattern.search(k)},
                         'origins': {k:v for k,v in origins.items() if pattern.search(k)}})
    records.append({'target': r, 'sources': sources, 'variants': variants})
result = {'exeSha256': hashlib.sha256(p.exe).hexdigest(), 'targets': records, 'decoded': cache, 'errors': errors}
(OUT/'TARGETABILITY_EVIDENCE.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf8')
for r in records:
    print(r['target']['id'], r['target']['name'], r['target']['category'])
    distinct = {json.dumps(v['properties'], ensure_ascii=False, sort_keys=True) for v in r['variants']}
    print('complete',all(v['complete'] for v in r['variants']), 'variants',len(r['variants']))
    for v in sorted(distinct):print(v)
print('ERRORS',errors)
for path, before in scope['before'].items():
    assert hashlib.sha256(Path(path).read_bytes()).hexdigest() == before, path
