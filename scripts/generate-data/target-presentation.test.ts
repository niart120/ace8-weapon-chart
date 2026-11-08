import { expect, test } from 'vitest';
import { generateMasters } from './generate';
import { input } from './fixture';
import type { TargetPresentation } from './target-presentation';
const empty: TargetPresentation = {
  excludedIds: [],
  groups: [],
  names: {},
  defaultVariantIds: [],
  parents: {},
};

test('存在しない表示対象と除外済み・重複の集約を生成前に拒否する', () => {
  expect(() =>
    generateMasters({ ...input, presentation: { ...empty, excludedIds: [999] } })
  ).toThrow('参照先なし');
  expect(() =>
    generateMasters({
      ...input,
      presentation: { ...empty, groups: [{ id: 1, name: 'TANK', targetIds: [1, 1] }] },
    })
  ).toThrow('重複');
});

test('同名・同HPでも耐性が違う行の集約を拒否する', () => {
  const source = { table: 'mission6', row: 'tank' };
  expect(() =>
    generateMasters({
      ...input,
      targets: [...input.targets, { ...input.targets[0], id: 2, sourceRefs: [source] }],
      sources: {
        ...input.sources,
        'mission6/tank': { ...input.sources['mission5/tank'], damageMultipliers: { missile: 0.5 } },
      },
      presentation: { ...empty, groups: [{ id: 1, name: 'TANK', targetIds: [1, 2] }] },
    })
  ).toThrow('比較耐性不一致');
});

test('標準条件は任務出典と旧名を保持し、計算値を変更しない', () => {
  const masters = generateMasters({
    ...input,
    targets: [{ ...input.targets[0], missionVariant: { missionId: 5 } }],
    presentation: { ...empty, names: { '1': 'TANK' }, defaultVariantIds: [1] },
  });
  expect(masters.targets[0]).toMatchObject({
    name: 'TANK',
    missionVariant: { missionId: 5 },
    missionIds: [5],
    defaultVariant: true,
    searchNames: ['TANK [M5]'],
    hp: 55,
    damageMultipliers: { missile: 1 },
  });
});
