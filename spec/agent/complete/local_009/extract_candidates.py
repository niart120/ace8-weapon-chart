"""Read-only inventory of published targets; writes research artifacts beside this file."""
import collections
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
FIELDS = ('hp', 'damageMultipliers', 'isAir', 'roleGroup', 'standardDamage')
inputs = {}


def read(path):
    path = ROOT / path
    raw = path.read_bytes()
    inputs[path.relative_to(ROOT).as_posix()] = hashlib.sha256(raw).hexdigest()
    return json.loads(raw)


def canonical(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False)


def base(row):
    # Preserve parentheses (Front/EV/CORE etc.) and other meaningful qualifiers.
    return re.sub(r'《[^》]*》| \[M\d+\]', '', row['name'])


def combat(row):
    return {key: row[key] for key in FIELDS}


def group(rows, key):
    result = collections.defaultdict(list)
    for row in rows:
        result[key(row)].append(row)
    return list(result.values())


tables = {}


def table(name):
    if name not in tables:
        tables[name] = {r['row']: r['values'] for r in read(f'docs/initial/ref/tables/{name}.json')['rows']}
    return tables[name]


all_rows = read('src/data/targets.json')
rows = [r for r in all_rows if r['category'] != 'EXCLUDED']
catalog = {r['id']: r for r in read('data/local/catalog.json')['targets']}
resolved = read('data/local/generation-input.json')['sources']
same = group(rows, lambda r: (base(r), canonical(combat(r))))
names = group(rows, base)
cross = [g for g in group(rows, lambda r: canonical(combat(r))) if len({base(r) for r in g}) > 1]
evidence = []
for row in rows:
    sources = []
    for ref in catalog[row['id']]['sourceRefs']:
        assert resolved[ref['table'] + '/' + ref['row']] == combat(row), row['id']
        raw = table(ref['table'])[ref['row']]
        mission = raw if ref['table'].startswith('DT_NPC_Mission') else None
        npc_id = mission['NpcId'] if mission else ref['row']
        npc = table('DT_NPC')[npc_id]
        model = table('DT_NPC_Model')[npc['ModelId']]
        sources.append({**ref, 'npcId': npc_id, 'modelId': npc['ModelId'],
                        'displayNameKey': model['GameObjectDisplayName01'],
                        'blueprint': model['BlueprintClass'],
                        'modelHp': model['MaxHealth'], 'npcHpDifference': npc['MaxHealthDifference'],
                        'missionHpDifference': mission['MaxHealthDifference'] if mission else None,
                        'missionMinHealth': mission.get('MinHealth') if mission else None,
                        'npcDurability': npc['WeaponDurabilityId'],
                        'missionDurability': mission['WeaponDurabilityId'] if mission else None,
                        'explosionDurability': npc['ExplosionDurabilityId']})
    evidence.append({**row, 'baseName': base(row), 'sources': sources})


def diffs(g):
    result = {k: {str(r['id']): r[k] for r in g} for k in FIELDS if k != 'damageMultipliers'
              and len({canonical(r[k]) for r in g}) > 1}
    for k in sorted(set().union(*(r['damageMultipliers'] for r in g))):
        if len({canonical(r['damageMultipliers'].get(k)) for r in g}) > 1:
            result['damageMultipliers.' + k] = {str(r['id']): r['damageMultipliers'].get(k) for r in g}
    return result


candidates = []
for g in same:
    if len(g) < 2:
        continue
    metadata = ['category', 'subcategory', 'partOf', 'missionVariant', 'missionIds']
    candidates.append({'baseName': base(g[0]), 'ids': [r['id'] for r in g], 'combat': combat(g[0]),
                       'metadataDifferences': {k: {str(r['id']): r[k] for r in g}
                                               for k in metadata if len({canonical(r[k]) for r in g}) > 1}})
differences = [{'baseName': base(g[0]), 'ids': [r['id'] for r in g], 'differences': diffs(g)}
               for g in names if len({canonical(combat(r)) for r in g}) > 1]
tags = [{'baseName': base(g[0]), 'ids': [r['id'] for r in g]}
        for g in names if any('《' in r['name'] for r in g) and len({canonical(combat(r)) for r in g}) == 1]
summary = {'allRows': len(all_rows), 'published': len(rows), 'excluded': len(all_rows)-len(rows),
           'baseNames': len(names), 'sameNameCombatGroups': len(same), 'mergeCandidateGroups': len(candidates),
           'candidateRows': sum(len(c['ids']) for c in candidates), 'potentialReduction': len(rows)-len(same),
           'differentCombatNames': len(differences), 'crossNameCombatGroups': len(cross),
           'tagCandidates': len(tags)}
result = {'summary': summary, 'inputSha256': inputs, 'candidates': candidates,
          'differences': differences, 'tagCandidates': tags,
          'crossNameCombatGroups': [[{'id': r['id'], 'name': r['name']} for r in g] for g in cross],
          'targets': evidence}
(OUT / 'CANDIDATES.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf8')
lines = ['# 全掲載対象の機械抽出結果', '', '2026-11-06。判断・制約は [調査報告](NORMALIZATION_REVIEW.md) を参照。', '',
         '## 同じ基本名・計算属性が完全一致する候補', '', '| 基本名 | ID | HP | 残るメタデータ差 |', '| --- | --- | --- | --- |']
for c in candidates:
    lines.append(f"| {c['baseName']} | {', '.join(map(str,c['ids']))} | {c['combat']['hp']} | {', '.join(c['metadataDifferences']) or 'なし'} |")
lines += ['', '## 同じ基本名で残す計算差', '', '| 基本名 | ID | 差のある属性 |', '| --- | --- | --- |']
for d in differences:
    lines.append(f"| {d['baseName']} | {', '.join(map(str,d['ids']))} | {', '.join(d['differences'])} |")
lines += ['', '各属性の ID ごとの正確な値は `CANDIDATES.json` の `differences` に記録。丸めずに比較した。', '',
          '## 親タグ省略の候補', '', '| 基本名 | ID |', '| --- | --- |']
for t in tags:
    lines.append(f"| {t['baseName']} | {', '.join(map(str,t['ids']))} |")
lines += ['', '## 異なる基本名で計算属性が一致する組', '', '別名の対象をまとめる許可ではない。名称・種類・所属を失うため、計算属性の共有候補としてのみ扱う。', '',
          '| 組 | ID・表示名 |', '| --- | --- |']
for i,g in enumerate(cross,1):
    lines.append(f"| {i} | "+'; '.join(f"{r['id']} {r['name']}" for r in g)+' |')
(OUT / 'CANDIDATE_TABLES.md').write_text('\n'.join(lines)+'\n', encoding='utf8')
print(json.dumps(summary, ensure_ascii=False))
