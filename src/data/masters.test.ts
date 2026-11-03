import { expect, test } from 'vitest';
import { weapons, targets, modifiers } from './masters';
import { calculateDefeatRequirement } from '../domain/calculate';
import { weaponCategories, targetCategories } from '../domain/types';
test('合意済み34兵装と8件のUNUSEDを別の固定IDで保持する', () => {
  expect(weapons.filter((w) => w.category !== 'UNUSED').map((w) => w.name)).toEqual([
    'MSL',
    'MSL (Rookie)',
    '2AAM',
    '4AAM',
    '6AAM',
    '8AAM',
    'HCAA',
    'HPAA',
    'HVAA',
    'LAAM',
    'QAAM',
    'SAAM',
    'SASM',
    '4AGM',
    '6AGM',
    '8AGM',
    'LACM',
    'LAGM',
    'LASM',
    'GPB',
    'SFFS',
    'SOD',
    'UGB',
    'UGBL',
    'XSDB',
    'GUN TypeA',
    'GUN TypeB',
    'GUN TypeC',
    'MGP',
    'RKT',
    'EMLB',
    'MPBM',
    'TLS [s]',
    'UAVT',
  ]);
  expect(weapons.filter((w) => w.category === 'UNUSED')).toHaveLength(8);
  expect(weapons[0].primary.baseDamage).toBe(40);
  expect(weapons[1].primary.baseDamage).toBe(56);
  expect(weapons.filter((w) => w.name.startsWith('GUN')).map((w) => w.primary.baseDamage)).toEqual([
    5, 15, 10,
  ]);
  expect(modifiers.parts).toHaveLength(10);
  expect(weaponCategories).toHaveLength(7);
});
test('全目標を分類し、部位・任務差分・同名の異なるHPを保持する', () => {
  expect(targets.length).toBeGreaterThan(400);
  for (const category of [...targetCategories, 'EXCLUDED'])
    expect(targets.some((t) => t.category === category)).toBe(true);
  const engine = targets.filter((t) => t.name === 'MAIN ENGINE《LADON》');
  expect(engine).toHaveLength(1);
  expect(engine[0].hp).toBe(460);
  expect(engine[0].partOf).not.toBeNull();
  expect(
    targets
      .filter((t) => t.name === 'WING SPAR《LADON》')
      .map((t) => t.hp)
      .sort((a, b) => a - b)
  ).toEqual([150, 200]);
  for (const t of targets.filter((t) => t.name.includes('《MEGAFLOAT》')))
    expect(t.category).toBe(t.name.startsWith('RAIL GUN TURRET') ? 'GROUND' : 'STRUCTURE');
  expect(targets.some((t) => t.missionVariant !== null && t.partOf !== null)).toBe(true);
  expect(
    targets.filter((t) => t.name.startsWith('ALCM')).every((t) => t.category === 'EXCLUDED')
  ).toBe(true);
  expect(targets.some((t) => t.name === 'TANK' && t.category === 'GROUND' && t.hp === 55)).toBe(
    true
  );
  expect(
    targets.some((t) => t.name.includes('TANK') && t.category === 'EXCLUDED' && t.hp === 500)
  ).toBe(true);
  expect(JSON.stringify({ weapons, targets, modifiers })).not.toMatch(
    /sourceRefs|DT_NPC|BlueprintClass/
  );
});
test('既知の免疫・未収録の8AAM・SFFSのパーツ不明を区別する', () => {
  const depot = targets.find((t) => t.name === 'HARDENED DEPOT')!;
  const bomb = weapons.find((w) => w.name === 'UGB')!;
  const condition = { role: 'FIGHTER', parts: [], damageType: 'DIRECT' } as const;
  expect(calculateDefeatRequirement(depot, bomb, condition)).toEqual({ kind: 'zeroDamage' });
  const aircraft = targets.find((t) => t.name === 'F-16C' && !t.missionVariant)!;
  expect(
    calculateDefeatRequirement(aircraft, weapons.find((w) => w.name === '8AAM')!, condition)
  ).toEqual({ kind: 'unknown' });
  expect(
    calculateDefeatRequirement(aircraft, weapons.find((w) => w.name === 'SFFS')!, {
      ...condition,
      parts: ['bombPower'],
    })
  ).toEqual({ kind: 'unknown' });
});

test('R001: X-40のMSLはCategory01を使い6発になる', () => {
  const target = targets.find((t) => t.id === 457)!;
  const weapon = weapons.find((w) => w.id === 1)!;
  expect(
    calculateDefeatRequirement(target, weapon, { role: 'FIGHTER', parts: [], damageType: 'DIRECT' })
  ).toEqual({ kind: 'value', value: 6 });
});

test('R002: M25後半の艦船固有設定は任務差分になる', () => {
  for (const id of [341, 342, 343, 344, 345, 361, 362, 363, 364, 365, 366]) {
    expect(targets.find((t) => t.id === id)?.missionVariant).toEqual({ missionId: '25day2' });
  }
});
