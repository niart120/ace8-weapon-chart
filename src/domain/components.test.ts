import { expect, test } from 'vitest';

import { selectComponents } from './components';

import type { Weapon } from './types';

const weapon: Weapon = {
  id: 1,
  name: 'LACM',
  category: 'MSL.GND',
  order: 1,
  calculation: 'hits',
  primary: { baseDamage: 100, partMultipliers: {}, targetMultiplierKey: 'groundMissile' },
  additional: { baseDamage: 100, partMultipliers: {}, targetMultiplierKey: 'lacmBlast' },
};

test('直撃＋爆風では主成分と追加成分を順に選ぶ', () => {
  expect(selectComponents(weapon, 'DIRECT+BLAST')).toEqual([weapon.primary, weapon.additional]);
});
