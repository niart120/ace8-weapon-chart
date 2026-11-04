import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

test('元定義だけの通常NPCへ任務差分を流用せず、子NPCと部位に任務を引き継ぐ', () => {
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
    [2, ['4'], 'FIGHTER'],
    [3, ['4'], 'FIGHTER'],
    [4, ['4'], 'PARTS'],
  ]);
});
