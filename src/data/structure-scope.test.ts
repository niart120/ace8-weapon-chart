import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { initialPreferences, selectedTargets, targetCandidates } from '../state/preferences';

test('施設4行だけを除外し、HP30の通常タンクとHARDENED DEPOTを維持する', () => {
  const excluded = [490, 480, 339, 132];
  const initial = initialPreferences(false, { targets, weapons });
  for (const id of excluded) {
    expect(targets.find((t) => t.id === id)?.category).toBe('EXCLUDED');
    expect(initial.targetIds).not.toContain(id);
  }
  const saved = { ...initial, targetIds: excluded, showMissionVariants: true };
  expect(selectedTargets(saved, targets)).toEqual([]);
  for (const query of ['', 'AIR BASE', 'AMMO BUNKER', 'GAS TANK', 'OIL TANK']) {
    expect(targetCandidates(saved, targets, query).some((t) => excluded.includes(t.id))).toBe(
      false
    );
  }
  for (const missionIds of [[], [8], [9], [12], [25], [28], [29]]) {
    expect(
      targetCandidates(
        { ...saved, showParts: true, showMissionVariants: true, missionIds },
        targets
      ).some((t) => excluded.includes(t.id))
    ).toBe(false);
  }
  for (const [id, hp, missionIds] of [
    [17, 30, [2, 7, 8, 27]],
    [16, 30, [2, 7, 23]],
    [482, 35, [7]],
  ] as const) {
    expect(targets.find((t) => t.id === id)).toMatchObject({
      category: 'STRUCTURE',
      hp,
      missionIds,
    });
    expect(selectedTargets({ ...initial, targetIds: [id] }, targets).map((t) => t.id)).toEqual([
      id,
    ]);
    for (const mission of missionIds) {
      expect(
        targetCandidates(
          { ...saved, showParts: true, showMissionVariants: true, missionIds: [mission] },
          targets
        ).map((t) => t.id)
      ).toContain(id);
    }
  }
});
