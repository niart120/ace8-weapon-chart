import { expect, test } from 'vitest';
import { calculateDefeatRequirement } from './calculate';
import { target, missile } from '../test/fixtures/combat';
test('通常MSL: HP55・FIGHTER・補正なしは2命中', () => {
  expect(
    calculateDefeatRequirement(target, missile, {
      role: 'FIGHTER',
      parts: [],
      damageType: 'DIRECT',
    })
  ).toEqual({ kind: 'value', value: 2 });
});

import traces from '../test/fixtures/missile-traces.json';
import { applyDamage } from './health';
import { componentDamage } from './damage';
import type { Conditions, Role, Weapon } from './types';
const roleNames: Record<string, Role> = {
  Fighter: 'FIGHTER',
  Attacker: 'ATTACKER',
  Multirole: 'MULTIROLE',
  Electronic: 'ELECTRONIC WARFARE',
};
const partNames: Record<string, string[]> = {
  none: [],
  air10: ['missileAirPower'],
  power20: ['missilePower'],
  both: ['missilePower', 'missileAirPower'],
};
for (const trace of traces)
  test(`固定トレース ${trace.role}/${trace.parts}/HP${trace.hp}`, () => {
    const conditions: Conditions = {
      role: roleNames[trace.role],
      parts: partNames[trace.parts],
      damageType: 'DIRECT',
    };
    const t = { ...target, hp: trace.hp };
    expect(componentDamage(t, missile.primary, conditions)).toBe(trace.damage);
    let hp = trace.hp * 10;
    for (const expected of trace.healthInternal.slice(1)) {
      hp = applyDamage(hp, trace.damage);
      expect(hp).toBe(expected);
    }
    expect(trace.healthInternal.at(-2)).toBeGreaterThan(0);
    expect(calculateDefeatRequirement(t, missile, conditions)).toEqual({
      kind: 'value',
      value: trace.hits,
    });
  });
const neutral: Conditions = { role: 'MULTIROLE', parts: [], damageType: 'DIRECT' };
const lacm: Weapon = {
  id: 2,
  name: 'LACM',
  category: 'MSL.GND',
  order: 1,
  calculation: 'hits',
  primary: {
    baseDamage: 100,
    partMultipliers: { specialGroundPower: 1.2 },
    targetMultiplierKey: 'groundMissile',
  },
  additional: { baseDamage: 100, partMultipliers: {}, targetMultiplierKey: 'lacmBlast' },
};
const mpbm: Weapon = {
  id: 3,
  name: 'MPBM',
  category: 'OTHER',
  order: 2,
  calculation: 'hits',
  primary: {
    baseDamage: 100,
    partMultipliers: { specialAirPower: 1.12, specialGroundPower: 1.12 },
    targetMultiplierKey: 'mpbm',
  },
  additional: { baseDamage: 50, partMultipliers: {}, targetMultiplierKey: 'mpbm' },
};
test('LACMの直撃100と爆風20を別々に補正・更新する', () => {
  const t = {
    ...target,
    hp: 235,
    isAir: false,
    roleGroup: 'ship' as const,
    damageMultipliers: {
      groundMissile: 1,
      lacmBlast: Math.fround(Math.fround(20) * Math.fround(0.01)),
    },
  };
  // 直撃100x3、爆風約20x12、両成分約120x2。地上パーツは直撃のみ。
  expect(calculateDefeatRequirement(t, lacm, neutral)).toEqual({ kind: 'value', value: 3 });
  expect(calculateDefeatRequirement(t, lacm, { ...neutral, damageType: 'BLAST' })).toEqual({
    kind: 'value',
    value: 12,
  });
  expect(calculateDefeatRequirement(t, lacm, { ...neutral, damageType: 'DIRECT+BLAST' })).toEqual({
    kind: 'value',
    value: 2,
  });
  expect(componentDamage(t, lacm.additional!, { ...neutral, parts: ['specialGroundPower'] })).toBe(
    Math.fround(100 * t.damageMultipliers.lacmBlast)
  );
});
test('MPBMの両パーツは乗算、範囲初撃には作用せず継続分を足さない', () => {
  const t = { ...target, hp: 252, damageMultipliers: { mpbm: 1 } };
  const c = { ...neutral, parts: ['specialAirPower', 'specialGroundPower'] };
  expect(componentDamage(t, mpbm.primary, c)).toBe(125.44000244140625);
  expect(componentDamage(t, mpbm.additional!, c)).toBe(50);
  expect(calculateDefeatRequirement(t, mpbm, c)).toEqual({ kind: 'value', value: 3 });
  expect(calculateDefeatRequirement(t, mpbm, { ...c, damageType: 'DIRECT+BLAST' })).toEqual({
    kind: 'value',
    value: 2,
  });
});
test('0.01倍ではHP内部値が毎回5減り110命中（単純除算115と異なる）', () => {
  const t = { ...target, damageMultipliers: { missile: Math.fround(0.01) } };
  const c = { ...neutral, parts: ['missilePower'] };
  expect(componentDamage(t, missile.primary, c)).toBe(0.47999998927116394);
  expect(applyDamage(550, 0.47999998927116394)).toBe(545);
  expect(calculateDefeatRequirement(t, missile, c)).toEqual({ kind: 'value', value: 110 });
});
test('0、null、成分選択と対象パーツの条件を区別する', () => {
  const t = { ...target, damageMultipliers: { groundMissile: 1, lacmBlast: null } };
  expect(calculateDefeatRequirement(t, lacm, neutral)).toEqual({ kind: 'value', value: 1 });
  expect(calculateDefeatRequirement(t, lacm, { ...neutral, damageType: 'BLAST' })).toEqual({
    kind: 'unknown',
  });
  expect(
    calculateDefeatRequirement(
      { ...t, damageMultipliers: { groundMissile: 0, lacmBlast: 0 } },
      lacm,
      neutral
    )
  ).toEqual({ kind: 'zeroDamage' });
  expect(calculateDefeatRequirement(target, missile, { ...neutral, damageType: 'BLAST' })).toEqual(
    calculateDefeatRequirement(target, missile, neutral)
  );
  expect(
    componentDamage(target, missile.primary, {
      ...neutral,
      parts: ['missileAirPower', 'missileGroundPower'],
    })
  ).toBe(44);
  expect(
    componentDamage({ ...target, isAir: false }, missile.primary, {
      ...neutral,
      parts: ['missileAirPower', 'missileGroundPower'],
    })
  ).toBe(44);
  expect(
    componentDamage({ ...target, isAir: null }, missile.primary, {
      ...neutral,
      parts: ['missileAirPower'],
    })
  ).toBeNull();
});
test('入力は変更せず、特殊処理・TLS・UAVTの未確認を数値化しない', () => {
  const before = JSON.stringify({ target, missile, neutral });
  calculateDefeatRequirement(target, missile, neutral);
  expect(JSON.stringify({ target, missile, neutral })).toBe(before);
  expect(
    calculateDefeatRequirement({ ...target, standardDamage: false }, missile, neutral)
  ).toEqual({ kind: 'unknown' });
  for (const calculation of ['tls', 'unresolved'] as const)
    expect(calculateDefeatRequirement(target, { ...missile, calculation }, neutral)).toEqual({
      kind: 'unknown',
    });
});
