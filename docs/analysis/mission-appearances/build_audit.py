"""Render the reviewed occurrence inventory; does not modify application data.

Run from the repository root. The original catalog under data/local is required.
Community conclusions are deliberately separate from mechanical source tracing.
"""
from collections import Counter
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parent
REPOSITORY = ROOT.parents[2]
BASELINE = '090e3ba'


def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def mission_id(number):
    if number < 24:
        return str(number + 1)
    if number <= 25:
        return f'25day{number - 23}'
    return str(number)


def source_mission(table):
    match = re.fullmatch(r'DT_NPC_Mission(\d+)(day[12])?', table)
    return str(int(match[1])) + (match[2] or '') if match else None


def build():
    review = read(ROOT / 'community-review.json')
    # Keep the original audit reproducible after the reviewed corrections land.
    targets = json.loads(subprocess.check_output(
        ['git', '-c', f'safe.directory={REPOSITORY.as_posix()}', 'show',
         f'{BASELINE}:src/data/targets.json'], cwd=REPOSITORY, encoding='utf-8'))
    catalog = {row['id']: row for row in read('data/local/catalog.json')['targets']}
    labels = {mission_id(n): f'M{n}' for n in range(1, 31)}
    labels['1'] = 'PROLOGUE'
    order = {'1': 0, **{mission_id(n): n for n in range(1, 31)}}
    by_id = {row['id']: row for row in targets}
    assessments = {}
    for number, ids in review['corroboratedAircraft'].items():
        mid = mission_id(int(number))
        for target_id in ids:
            target = by_id[target_id]
            assert target['category'] == 'AIRCRAFT' and target['partOf'] is None
            assert mid in target['missionIds'], (number, target_id)
            assessments[target_id, mid] = {
                'status': 'corroborated',
                'reason': '敵機種の出現を資料で裏付け。HP・耐性・個別NPC行の実使用は未検証。',
                'sources': review['missionSources'][number],
            }
    for finding in review['findings']:
        mid = mission_id(finding['mission'])
        for target_id in finding['targetIds']:
            assert mid in by_id[target_id]['missionIds'], (mid, target_id)
            assert (target_id, mid) not in assessments, (mid, target_id)
            assessments[target_id, mid] = {key: finding[key] for key in ['status', 'reason', 'sources']}
    records = []
    for target in targets:
        if target['category'] == 'EXCLUDED':
            continue
        definition = catalog[target['id']]
        declared = {mid for source in definition['sourceRefs'] if (mid := source_mission(source['table']))}
        for mid in target['missionIds']:
            assessment = assessments.get((target['id'], mid), {
                'status': 'unverified',
                'reason': '今回読んだ資料だけでは、この対象と任務の組合せを裏付けられない。未出現の判定ではない。',
                'sources': review['missionSources'].get(str(order[mid]), []),
            })
            records.append({
                'targetId': target['id'], 'name': target['name'],
                'category': target['category'], 'partOf': target['partOf'],
                'missionId': mid, 'missionLabel': labels[mid],
                **assessment,
                'declaredMissionIds': sorted(declared, key=order.__getitem__),
                'outsideDeclaredPartMissions': bool(target['partOf'] and declared and mid not in declared),
                'directMissionSourceRefs': [s for s in definition['sourceRefs'] if source_mission(s['table']) == mid],
                'pvSourceRefs': [s for s in definition['sourceRefs'] if source_mission(s['table']) == mid and s['row'].startswith('PV_')],
            })
    records.sort(key=lambda r: (order[r['missionId']], r['category'], r['name'], r['targetId']))
    aircraft = [r for r in records if r['category'] == 'AIRCRAFT' and r['partOf'] is None]
    derived = [r for r in records if r['outsideDeclaredPartMissions']]
    unmapped = [{'targetId': t['id'], 'name': t['name']} for t in targets if t['category'] != 'EXCLUDED' and not t['missionIds']]
    result = {
        'reviewDate': '2026-11-04', 'applicationCommit': BASELINE,
        'subsequentDecisions': review.get('subsequentDecisions', []),
        'scope': '全30任務の攻略本文を読み、航空機235対応を個別照合。全736対応の静的出典を棚卸し。地上・部位の出現を全件実証したものではない。',
        'counts': {'publishedTargets': sum(t['category'] != 'EXCLUDED' for t in targets),
                   'allPairs': len(records), 'aircraftPairs': len(aircraft),
                   'aircraftStatuses': dict(Counter(r['status'] for r in aircraft)),
                   'allStatuses': dict(Counter(r['status'] for r in records)),
                   'partsOutsideDeclaredMissions': len(derived), 'unmappedTargets': len(unmapped)},
        'targetSourceRefs': {str(t['id']): catalog[t['id']]['sourceRefs'] for t in targets if t['category'] != 'EXCLUDED'},
        'unmappedTargets': unmapped, 'records': records,
    }
    (ROOT / 'mission-appearance-audit.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    lines = ['# ミッション別の航空機照合一覧', '',
             '2026-11-04、対象コミット `090e3ba`。各行は対象IDと任務の組合せ。出現の裏付けはHP・耐性の確認を意味しない。', '',
             '「未裏付け」は誤掲載を意味しない。攻略本文は完全な撃破一覧ではなく、通常機の記述が省かれている。出典と判断理由は `community-review.json` と `mission-appearance-audit.json` に保存した。', '']
    for n in range(1, 31):
        lines += [f'## M{n}', '', '| ID | 現在の表示 | 判定 |', '| ---: | --- | --- |']
        for row in aircraft:
            if row['missionId'] == mission_id(n):
                lines.append(f'| {row["targetId"]} | {row["name"]} | {review["statusLabels"][row["status"]]} |')
        links = ' / '.join(f'[資料{i + 1}]({url})' for i, url in enumerate(review['missionSources'][str(n)]))
        lines += ['', links, '']
    lines += ['## 部位の元定義にない任務への拡張', '',
              '親への関連付けで追加可能になっている49対応。共通部位の正当な再利用もあり得るため、全件を誤りとは判定しない。', '',
              '| ID | 部位 | 元定義の任務 | 追加先 |', '| ---: | --- | --- | --- |']
    for row in derived:
        lines.append(f'| {row["targetId"]} | {row["name"]} | {", ".join(labels[mid] for mid in row["declaredMissionIds"])} | {row["missionLabel"]} |')
    (ROOT / 'AIRCRAFT_APPEARANCES.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(json.dumps(result['counts'], ensure_ascii=False))


if __name__ == '__main__':
    build()
