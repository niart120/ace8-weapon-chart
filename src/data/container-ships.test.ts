import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { initialPreferences, selectedTargets } from '../state/preferences';

test('コンテナ船を任務接尾辞のない1行に統合し、部位・基本定義の除外と任務絞り込みを維持する', () => {
  const ships = targets.filter(
    (t) => t.name.startsWith('CONTAINER SHIP') && t.category !== 'EXCLUDED'
  );
  expect(ships).toHaveLength(1);
  expect(ships[0]).toMatchObject({
    id: 12,
    name: 'CONTAINER SHIP',
    missionVariant: null,
    missionIds: [16, 23, 27],
    hp: 75,
    standardDamage: true,
    damageMultipliers: { gun: 1 },
  });
  for (const id of [222, 223, 491, 492]) {
    expect(targets.find((t) => t.id === id)?.category).toBe('EXCLUDED');
  }
  expect(targets.find((t) => t.id === 223)).toMatchObject({ partOf: 12, missionIds: [16], hp: 15 });
  const initial = initialPreferences(false, { targets, weapons });
  const visible = selectedTargets(
    { ...initial, showParts: true, showMissionVariants: false },
    targets
  );
  expect(visible.filter((t) => [12, 222, 223, 491, 492].includes(t.id)).map((t) => t.id)).toEqual([
    12,
  ]);
  for (const missionId of [16, 23, 27]) {
    const missionTargets = selectedTargets(
      { ...initial, targetMode: 'MISSION', missionIds: [missionId] },
      targets
    );
    expect(
      missionTargets.filter((t) => t.name.startsWith('CONTAINER SHIP')).map((t) => t.id)
    ).toEqual([12]);
  }
});
