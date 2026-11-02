import { expect, test } from 'vitest';
import { generateMasters } from './generate';
import { input } from './fixture';
test('元定義からHPと倍率を解決し出典を配信データへ含めない', () => {
  expect(generateMasters(input).targets).toEqual([
    {
      id: 1,
      name: 'TANK',
      category: 'GROUND',
      order: 0,
      partOf: null,
      missionVariant: null,
      hp: 55,
      damageMultipliers: { missile: 1 },
      isAir: false,
      roleGroup: 'ground',
      standardDamage: true,
    },
  ]);
});

test('ID重複・値の欠落・参照切れ・統合の不一致を検出する', () => {
  expect(() =>
    generateMasters({ ...input, weapons: [...input.weapons, ...input.weapons] })
  ).toThrow('ID');
  expect(() => generateMasters({ ...input, sources: {} })).toThrow('参照先');
  expect(() =>
    generateMasters({
      ...input,
      sources: { 'mission5/tank': { ...input.sources['mission5/tank'], damageMultipliers: {} } },
    })
  ).toThrow('耐性値');
  expect(() =>
    generateMasters({ ...input, targets: [{ ...input.targets[0], partOf: 9 }] })
  ).toThrow('本体参照');
  expect(() =>
    generateMasters({
      ...input,
      targets: [
        {
          ...input.targets[0],
          sourceRefs: [...input.targets[0].sourceRefs, { table: 'mission6', row: 'tank' }],
        },
      ],
      sources: { ...input.sources, 'mission6/tank': { ...input.sources['mission5/tank'], hp: 56 } },
    })
  ).toThrow('統合条件');
});
test('明示nullは許容し、同じ入力は同じ結果・固定IDとなる', () => {
  const unknown = {
    ...input,
    sources: {
      'mission5/tank': { ...input.sources['mission5/tank'], damageMultipliers: { missile: null } },
    },
  };
  expect(generateMasters(unknown).targets[0].damageMultipliers.missile).toBeNull();
  expect(generateMasters(input)).toEqual(generateMasters(input));
});

test('生成専用の出典情報を兵装出力へ持ち込まない', () => {
  const withSource = { ...input.weapons[0], sourceRefs: [{ table: 'private', row: 'weapon' }] };
  expect(() => generateMasters({ ...input, weapons: [withSource] })).toThrow('出典');
});
