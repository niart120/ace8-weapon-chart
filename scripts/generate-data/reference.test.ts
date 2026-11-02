import { execFileSync } from 'node:child_process';
import { expect, test } from 'vitest';
import { fileURLToPath } from 'node:url';
test('参照資料なしで生のHP差分・float32加算順・耐性優先順位を検証する', () => {
  const modulePath = fileURLToPath(new URL('./resolve-reference.py', import.meta.url));
  const code = `import importlib.util,json
s=importlib.util.spec_from_file_location('reference_math',${JSON.stringify(modulePath)})
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
rows={'normal':{'missile':100},'special':{'missile':20}}
print(json.dumps({'hp':[m.calculate_initial_hp(*x) for x in [(55,0,445),(57,0,-50),(100.9,0,0),(16777216,1,1),(20,0,-21)]],'npc':m.choose_durability('special','None',rows),'mission':m.choose_durability('special','normal',rows),'rate':m.rate(20)}))`;
  const result: unknown = JSON.parse(
    execFileSync('python', ['-B', '-c', code], { encoding: 'utf8' })
  );
  expect(result).toEqual({
    hp: [500, 7, 100, 16777216, 0],
    npc: { missile: 20 },
    mission: { missile: 100 },
    rate: 0.19999998807907104,
  });
});
