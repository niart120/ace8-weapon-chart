import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { initialPreferences, selectedTargets, targetCandidates } from '../state/preferences';

test('最後の任務未指定基本3行を除外し、対応する任務行を維持する', () => {
  const excluded = [498, 503, 505];
  const initial = initialPreferences(false, { targets, weapons });
  const saved = { ...initial, targetIds: excluded, showMissionVariants: true };
  for (const id of excluded) {
    expect(targets.find((t) => t.id === id)?.category).toBe('EXCLUDED');
    expect(initial.targetIds).not.toContain(id);
  }
  expect(selectedTargets(saved, targets)).toEqual([]);
  for (const query of ['', 'UNKNOWN', 'SHUTTER', 'MSL DISPENSER']) {
    expect(targetCandidates(saved, targets, query).some((t) => excluded.includes(t.id))).toBe(
      false
    );
  }
  for (const [id, mission, hp, standardDamage] of [
    [410, 26, 300, false],
    [426, 27, 100, true],
    [463, 30, 15, true],
  ] as const) {
    expect(targets.find((t) => t.id === id)).toMatchObject({
      hp,
      standardDamage,
      missionIds: [mission],
    });
    const selected = selectedTargets(
      { ...saved, targetMode: 'MISSION', missionIds: [mission] },
      targets
    );
    expect(selected.map((t) => t.id)).toContain(id);
    expect(selected.some((t) => excluded.includes(t.id))).toBe(false);
  }
  expect(targets.filter((t) => t.category !== 'EXCLUDED' && t.missionIds.length === 0)).toEqual([]);
});
