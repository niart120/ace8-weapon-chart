import { expect, test } from 'vitest';
import { generateMasters } from './generate';
import { input } from './fixture';

test('内部任務IDを維持し、境界とDay違いをゲーム内番号で表示する', () => {
  // MissionNo_Name_ms*: extracted display strings, independent of the formatter.
  for (const [missionId, label] of [
    ['1', 'PROLOGUE'],
    ['2', 'M1'],
    ['15', 'M14'],
    ['24', 'M23'],
    ['25day1', 'M24'],
    ['25day2', 'M25'],
    ['26', 'M26'],
    ['30', 'M30'],
  ]) {
    const result = generateMasters({
      ...input,
      targets: [
        {
          ...input.targets[0],
          name: 'AA GUN《CARRIER (SHADOW)》',
          missionVariant: { missionId },
        },
      ],
    });
    expect(result.targets[0].name).toBe(`AA GUN《CARRIER (SHADOW)》 [${label}]`);
    expect(result.targets[0].missionVariant).toEqual({ missionId });
    expect(result.targets[0].id).toBe(input.targets[0].id);
  }
});

test('表示番号が未確認の内部任務を推測で出力しない', () => {
  expect(() =>
    generateMasters({
      ...input,
      targets: [
        {
          ...input.targets[0],
          missionVariant: { missionId: '25' },
        },
      ],
    })
  ).toThrow('任務');
});
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

test('生成元の名称に任務ラベルが含まれていたら拒否する', () => {
  for (const name of ['TANK [M99]', 'TANK [M24]', 'TANK [PROLOGUE]']) {
    expect(() =>
      generateMasters({
        ...input,
        targets: [{ ...input.targets[0], name, missionVariant: { missionId: '25day1' } }],
      })
    ).toThrow('任務ラベル');
  }
});
