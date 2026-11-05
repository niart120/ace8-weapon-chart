import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { initialPreferences, selectedTargets, targetCandidates } from '../state/preferences';

test('未裏付けの車両とIED基本行を除外し、確認済みのレーダー車・ロケットは維持する', () => {
  const initial = initialPreferences(false, { targets, weapons });
  const expanded = { ...initial, showParts: true, showMissionVariants: true };
  for (const [id, hp, missionIds] of [
    [316, 15, [23]],
    [317, 15, [23, 24]],
    [487, 120, []],
  ] as const) {
    expect(targets.find((t) => t.id === id)).toMatchObject({
      category: 'EXCLUDED',
      hp,
      missionIds,
    });
    expect(initial.targetIds).not.toContain(id);
    expect(targetCandidates(expanded, targets, 'VEHICLE').map((t) => t.id)).not.toContain(id);
    expect(selectedTargets({ ...expanded, targetIds: [id] }, targets)).toEqual([]);
    for (const missions of [[], [9], [23], [24]]) {
      expect(
        targetCandidates(
          { ...expanded, showParts: true, showMissionVariants: true, missionIds: missions },
          targets
        ).map((t) => t.id)
      ).not.toContain(id);
    }
  }
  expect(
    targetCandidates(expanded, targets, 'VEHICLE')
      .map((t) => t.id)
      .sort((a, b) => a - b)
  ).toEqual([36, 237, 238]);
});
