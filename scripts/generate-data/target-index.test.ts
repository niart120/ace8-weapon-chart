import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import fixture from '../../src/test/fixtures/mission-numbers.json';

test('全31内部識別子を同梱文字列の番号へ変換し、不明な内部25は拒否する', () => {
  const path = fileURLToPath(new URL('./target-index.py', import.meta.url));
  const code = `import importlib.util,json,sys
s=importlib.util.spec_from_file_location('index',${JSON.stringify(path)})
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
entries=json.load(sys.stdin)
numbers=[m.mission_id('DT_NPC_Mission'+entry['missionId'].zfill(3)) for entry in entries]
try:
    m.mission_id('DT_NPC_Mission025')
except ValueError:
    pass
else:
    raise AssertionError('Ambiguous source ID accepted')
assert m.mission_id('DT_NPC_Training') is None
print(json.dumps(numbers))`;
  const actual = JSON.parse(
    execFileSync('python', ['-B', '-c', code], {
      encoding: 'utf8',
      input: JSON.stringify(fixture.entries),
    })
  );
  expect(actual).toEqual(
    fixture.entries.map(({ text }) =>
      text === 'PROLOGUE' ? 0 : Number(text.replace('MISSION ', ''))
    )
  );
});

test('実際の子NPC参照だけから任務番号を取得し、partOfだけでは任務を継承しない', () => {
  const path = fileURLToPath(new URL('./target-index.py', import.meta.url));
  const code = `import importlib.util,json
s=importlib.util.spec_from_file_location('index',${JSON.stringify(path)})
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
npcs={'base':{'ModelId':'f16','ChildNPCId':['child']},'child':{'ModelId':'f16','ChildNPCId':[]},'part':{'ModelId':'f16','ChildNPCId':[]}}
models={'f16':{'GameObjectDisplayName01':'ContainerAircraft_Name_f16c'}}
aircraft={'row':{'PlaneNameTextID':'Aircraft_Name_f16c','Category':0}}
base={'name':'F-16C','category':'AIRCRAFT','partOf':None,'missionVariant':None}
definitions=[dict(base,id=1,sourceRefs=[{'table':'DT_NPC','row':'base'}]),dict(base,id=2,sourceRefs=[{'table':'DT_NPC_Mission004','row':'variant'}]),dict(base,id=3,sourceRefs=[{'table':'DT_NPC','row':'child'}]),dict(base,id=4,partOf=2,sourceRefs=[{'table':'DT_NPC','row':'part'}])]
rows,evidence=m.build_index(definitions,npcs,models,aircraft,{'DT_NPC_Mission004':{'variant':{'NpcId':'base'}}})
print(json.dumps([[r['id'],r['missionIds'],r['subcategory']] for r in rows]))`;
  expect(JSON.parse(execFileSync('python', ['-B', '-c', code], { encoding: 'utf8' }))).toEqual([
    [1, [], 'FIGHTER'],
    [2, [3], 'FIGHTER'],
    [3, [3], 'FIGHTER'],
    [4, [], 'PARTS'],
  ]);
});
