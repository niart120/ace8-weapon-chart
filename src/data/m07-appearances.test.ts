import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { initialPreferences, selectedTargets } from '../state/preferences';

test('M7はMI-24とMIG-29Aを維持し、未裏付け5機種の任務対応だけを除く', () => {
  const initial = initialPreferences(false, { targets, weapons });
  const selected = selectedTargets({ ...initial, targetMode: 'MISSION', missionIds: [7] }, targets);
  const ids = selected.map((t) => t.id);
  expect(ids).toEqual(expect.arrayContaining([29, 67, 98, 120]));
  for (const [id, hp, missionIds] of [
    [93, 150, [6, 23]],
    [118, 115, [11, 23]],
    [1, 46, [1, 3, 8, 21, 25]],
    [4, 55, [1, 3, 5, 6, 8, 10, 11, 20, 25, 28]],
    [94, 15, [6, 9, 17, 19, 23]],
  ] as const) {
    expect(ids).not.toContain(id);
    expect(targets.find((t) => t.id === id)).toMatchObject({
      category: 'AIRCRAFT',
      hp,
      missionIds,
    });
    expect(initial.targetIds).toContain(id);
  }
});
