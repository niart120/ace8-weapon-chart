import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { calculateDefeatRequirement } from '../domain/calculate';
import { componentDamage } from '../domain/damage';
import { roles } from '../domain/types';
import { initialPreferences } from '../state/preferences';
import { restorePreferences } from '../storage/preferences';

// local_003: Blueprint全継承とnative初期値で確認した静的属性。
// 配信データから期待値を生成せず、確認済みIDを列挙する。
test('確認済み24行へ対象属性を反映し、CH-47の通常被弾判定を復元する', () => {
  const groups = [
    { ids: [230, 216, 498, 410, 69, 457, 435, 45, 459], isAir: true, roleGroup: 'air' },
    {
      ids: [373, 377, 106, 315, 155, 251, 252, 250, 255, 256, 310],
      isAir: false,
      roleGroup: 'ship',
    },
    { ids: [228], isAir: false, roleGroup: 'ground' },
    { ids: [314], isAir: false, roleGroup: 'none' },
    { ids: [237, 238], isAir: true, roleGroup: 'ground' },
  ];
  expect(groups.flatMap((group) => group.ids)).toHaveLength(24);
  for (const { ids, isAir, roleGroup } of groups)
    for (const id of ids)
      expect(
        targets.find((target) => target.id === id),
        `ID${id}`
      ).toMatchObject({
        isAir,
        roleGroup,
        standardDamage: true,
      });
});

test('表示分類と独立したROLE・対空対地パーツ判定でMSLを計算する', () => {
  const missile = weapons.find((weapon) => weapon.id === 1)!;
  const damage = (id: number, parts: string[] = []) =>
    componentDamage(targets.find((target) => target.id === id)!, missile.primary, {
      role: 'ATTACKER',
      parts,
      damageType: 'DIRECT',
    });
  // 基礎40。SHIPは攻撃機倍率1、地上砲台は1.5、Category_Noneは1。
  expect(damage(155)).toBe(40);
  expect(damage(155, ['missileAirPower'])).toBe(40);
  expect(damage(155, ['missileGroundPower'])).toBe(44);
  expect(damage(228)).toBe(60);
  expect(damage(314)).toBe(40);
  // LAUNCH VEHICLEはisAir=trueだがROLEはground。60に対空パーツ1.1を適用。
  expect(damage(237, ['missileAirPower'])).toBe(66);
  expect(damage(237, ['missileGroundPower'])).toBe(60);
  // X-40は40×0.875×1.1=38.5。航空機の表示分類から推測した期待値ではない。
  expect(damage(457, ['missileAirPower'])).toBe(38.5);
});

test('CH-47をHP35・攻撃機MSL35ダメージの1命中として計算する', () => {
  const target = targets.find((row) => row.id === 230)!;
  const missile = weapons.find((weapon) => weapon.id === 1)!;
  expect(target.hp).toBe(35);
  expect(
    calculateDefeatRequirement(target, missile, {
      role: 'ATTACKER',
      parts: [],
      damageType: 'DIRECT',
    })
  ).toEqual({ kind: 'value', value: 1 });
});

test('MEGAFLOAT系12行は今回の属性反映から除外する', () => {
  const megafloatIds = [418, 423, 430, 420, 422, 429, 500, 501, 419, 421, 503, 426];
  for (const id of megafloatIds)
    expect(targets.find((target) => target.id === id)?.roleGroup).toBeNull();
  for (const id of megafloatIds)
    expect(targets.find((target) => target.id === id)?.standardDamage).toBe(false);
});

test('区分8の5行は全ROLEで補正なしとなり、対空MSLパーツと旧選択は維持する', () => {
  const ids = [201, 264, 505, 463, 462];
  const missile = weapons.find((weapon) => weapon.id === 1)!;
  for (const id of ids) {
    const target = targets.find((row) => row.id === id)!;
    expect(target).toMatchObject({ roleGroup: 'none', isAir: true, standardDamage: true });
    for (const role of roles) {
      const conditions = { role, parts: [], damageType: 'DIRECT' as const };
      expect(componentDamage(target, missile.primary, conditions)).toBe(40);
      expect(
        componentDamage(target, missile.primary, { ...conditions, parts: ['missileAirPower'] })
      ).toBe(44);
      expect(
        componentDamage(target, missile.primary, { ...conditions, parts: ['missileGroundPower'] })
      ).toBe(40);
      expect(calculateDefeatRequirement(target, missile, conditions)).toEqual({
        kind: 'value',
        value: 1,
      });
    }
  }
  const catalog = { targets, weapons };
  const initial = initialPreferences(false, catalog);
  expect(
    restorePreferences({ ...initial, version: 1, targetIds: ids }, initial, catalog, []).targetIds
  ).toEqual(ids);
  expect(targets.find((target) => target.id === 505)?.hp).toBe(30);
  expect(targets.find((target) => target.id === 463)?.hp).toBe(15);
});
