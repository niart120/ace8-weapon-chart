import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { calculateDefeatRequirement } from '../domain/calculate';
import { componentDamage } from '../domain/damage';
import { initialPreferences, selectedTargets, targetCandidates } from '../state/preferences';

const target = (id: number) => targets.find((row) => row.id === id)!;
const weapon = (name: string) => weapons.find((row) => row.name === name)!;
const conditions = { role: 'MULTIROLE', parts: [], damageType: 'DIRECT' } as const;

test('Front/EVとM27を併記し、固定ID・元HP・内外と任務の耐性差を保持する', () => {
  expect(targets).toHaveLength(506);
  expect(new Set(targets.map((row) => row.id)).size).toBe(506);
  for (const [id, type, hp, missionVariant] of [
    [420, 'Front', 100, null],
    [500, 'Front', 100, null],
    [419, 'Front', 100, { missionId: '27' }],
    [422, 'EV', 200, null],
    [501, 'EV', 200, null],
    [421, 'EV', 200, { missionId: '27' }],
  ] as const) {
    expect(target(id)).toMatchObject({
      name: `PILLAR (${type})《MEGAFLOAT》${missionVariant ? ' [M27]' : ''}`,
      hp,
      partOf: 418,
      missionVariant,
    });
    expect(target(id).damageMultipliers.bomb).toBe(
      [500, 501].includes(id) ? 0.09999999403953552 : 5
    );
  }
  for (const [id, hp, partOf] of [
    [418, 100, null],
    [423, 1000, null],
    [429, 120, 418],
    [430, 40, 418],
    [503, 100, 418],
    [426, 100, 418],
  ] as const)
    expect(target(id)).toMatchObject({ hp, partOf });
  expect(target(503).name).toBe('SHUTTER《MEGAFLOAT》');
  expect(target(426).name).toBe('SHUTTER《MEGAFLOAT》 [M27]');
  for (const key of ['guidedBomb', 'bomb', 'rocket', 'mpbm'] as const) {
    expect(target(503).damageMultipliers[key]).toBe(1);
    expect(target(426).damageMultipliers[key]).toBe(0);
  }
});

test('親3行の除外後も子部位12行を掲載し、非表示中の選択を保持する', () => {
  const excluded = [418, 423, 429];
  const parts = [424, 430, 420, 422, 500, 501, 419, 421, 503, 426, 502, 425];
  const common = [424, 430, 420, 422, 500, 501, 503, 502];
  const catalog = { targets, weapons };
  const initial = initialPreferences(false, catalog);
  for (const id of excluded) expect(initial.targetIds).not.toContain(id);
  for (const id of parts) {
    expect(initial.targetIds).toContain(id);
    expect(target(id).partOf).toBe(418);
    expect(target(id).category).not.toBe('EXCLUDED');
  }
  for (const showParts of [false, true])
    for (const showMissionVariants of [false, true]) {
      const saved = {
        ...initial,
        version: 2,
        targetIds: parts,
        showParts,
        showMissionVariants,
      };
      const visible = showParts ? (showMissionVariants ? parts : common) : [];
      expect(
        selectedTargets(saved, targets)
          .map((row) => row.id)
          .sort((a, b) => a - b)
      ).toEqual([...visible].sort((a, b) => a - b));
      expect(
        targetCandidates(saved, targets, 'MEGAFLOAT')
          .filter((row) => row.partOf === 418 || excluded.includes(row.id))
          .map((row) => row.id)
          .sort((a, b) => a - b)
      ).toEqual([...visible].sort((a, b) => a - b));
    }
});

test('支柱は元HP100/200を使い、MSLの地上補正と機銃の整数HP更新で計算する', () => {
  // 元表: MSL40、地上ROLEはMULTIROLE=1・FIGHTER=0.875・ATTACKER=1.5、耐性5。
  for (const id of [420, 500, 419, 422, 501, 421]) {
    const row = target(id);
    expect(componentDamage(row, weapon('MSL').primary, conditions)).toBe(200);
    expect(componentDamage(row, weapon('MSL').primary, { ...conditions, role: 'ATTACKER' })).toBe(
      300
    );
    expect(
      componentDamage(row, weapon('MSL').primary, {
        ...conditions,
        parts: ['missileAirPower'],
      })
    ).toBe(200);
    expect(
      componentDamage(row, weapon('MSL').primary, {
        ...conditions,
        parts: ['missileGroundPower'],
      })
    ).toBe(220);
    expect(calculateDefeatRequirement(row, weapon('MSL'), conditions)).toEqual({
      kind: 'value',
      value: 1,
    });
    expect(
      calculateDefeatRequirement(row, weapon('MSL'), { ...conditions, role: 'FIGHTER' })
    ).toEqual({ kind: 'value', value: [420, 500, 419].includes(id) ? 1 : 2 });
    // MGP5×0.35=1.75、内部HPは1命中ごとに18減少。最低HP1は採用しない。
    expect(calculateDefeatRequirement(row, weapon('MGP'), conditions)).toEqual({
      kind: 'value',
      value: [420, 500, 419].includes(id) ? 56 : 112,
    });
  }
});

test('原子炉は各HP40で計算し、シャッターの任務免疫と兵装側の未確認を維持する', () => {
  expect(calculateDefeatRequirement(target(430), weapon('MSL'), conditions)).toEqual({
    kind: 'value',
    value: 1,
  });
  expect(calculateDefeatRequirement(target(503), weapon('UGB'), conditions)).toEqual({
    kind: 'value',
    value: 2,
  });
  expect(calculateDefeatRequirement(target(426), weapon('UGB'), conditions)).toEqual({
    kind: 'zeroDamage',
  });
  for (const [id, hits] of [
    [500, 14],
    [501, 27],
    [419, 1],
    [421, 1],
  ] as const)
    expect(calculateDefeatRequirement(target(id), weapon('UGB'), conditions)).toEqual({
      kind: 'value',
      value: hits,
    });
  for (const name of ['8AAM', 'TLS [s]', 'UAVT'])
    expect(calculateDefeatRequirement(target(430), weapon(name), conditions)).toEqual({
      kind: 'unknown',
    });
  expect(
    calculateDefeatRequirement(target(430), weapon('SFFS'), {
      ...conditions,
      parts: ['bombPower'],
    })
  ).toEqual({ kind: 'value', value: 1 });
});
