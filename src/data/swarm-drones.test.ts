import { expect, test } from 'vitest';
import { targets, weapons, modifiers } from './masters';
import { calculateDefeatRequirement } from '../domain/calculate';
import { initialPreferences, selectedTargets } from '../state/preferences';
import { validateMasters } from '../domain/validate';

test('SWARM DRONESを1行に統合し、全出現任務でHP非適用・必要命中数未確定を維持する', () => {
  const state = initialPreferences(false, { targets, weapons });
  const published = targets.filter((t) => t.name === 'SWARM DRONES' && t.category !== 'EXCLUDED');
  expect(published).toHaveLength(1);
  expect(targets.find((t) => t.id === 465)).toMatchObject({ category: 'EXCLUDED', hp: null });
  expect(selectedTargets({ ...state, targetIds: [156, 465] }, targets)).toEqual(published);
  for (const target of published) {
    const missionIds = [9, 10, 19, 30];
    expect(target).toMatchObject({
      id: 156,
      category: 'OTHER',
      hp: null,
      standardDamage: false,
      missionIds,
    });
    for (const mission of missionIds) {
      const selected = selectedTargets(
        { ...state, targetMode: 'MISSION', missionIds: [mission] },
        targets
      );
      expect(selected.filter((t) => t.name === 'SWARM DRONES')).toEqual([target]);
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
