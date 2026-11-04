import { expect, test } from 'vitest';
import { targets, weapons, modifiers } from './masters';
import { calculateDefeatRequirement } from '../domain/calculate';
import { initialPreferences, selectedTargets } from '../state/preferences';
import { validateMasters } from '../domain/validate';

test('SWARM DRONES両行は掲載を維持し、HPを適用せず全兵装の必要命中数を未確定にする', () => {
  const state = initialPreferences(false, { targets, weapons });
  for (const [id, missionIds] of [
    [156, [9, 10, 19]],
    [465, [30]],
  ] as const) {
    const target = targets.find((t) => t.id === id)!;
    expect(target).toMatchObject({
      category: 'OTHER',
      hp: null,
      standardDamage: false,
      missionIds,
    });
    expect(selectedTargets({ ...state, targetIds: [id] }, targets)).toEqual([target]);
    for (const mission of missionIds) {
      expect(
        selectedTargets({ ...state, targetMode: 'MISSION', missionIds: [mission] }, targets)
      ).toContain(target);
    }
    for (const weapon of weapons.filter((w) => w.category !== 'UNUSED')) {
      for (const damageType of ['DIRECT', 'BLAST', 'DIRECT+BLAST'] as const) {
        expect(
          calculateDefeatRequirement(target, weapon, { role: 'MULTIROLE', parts: [], damageType })
        ).toEqual({ kind: 'unknown' });
      }
    }
  }
});

test('HP非適用を通常HP計算と組み合わせたマスタを拒否する', () => {
  expect(() =>
    validateMasters({
      weapons,
      modifiers,
      targets: targets.map((t) => (t.id === 156 ? { ...t, standardDamage: true } : t)),
    })
  ).toThrow('HP');
});
