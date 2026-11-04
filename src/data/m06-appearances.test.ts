import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { initialPreferences, selectedTargets } from '../state/preferences';

test('M6は小型BUNKERを復帰し、TYPHOON・HANGARと大型BUNKERを除く', () => {
  const initial = initialPreferences(false, { targets, weapons });
  const selected = selectedTargets({ ...initial, targetMode: 'MISSION', missionIds: [6] }, targets);
  const ids = selected.map((t) => t.id);
  expect(ids).toContain(91);
  for (const id of [92, 95, 96]) expect(ids).not.toContain(id);
  for (const id of [93, 29, 67, 4]) expect(ids).toContain(id);
  for (const [id, hp, missionIds] of [
    [91, 75, [6, 24]],
    [92, 150, [24, 25]],
    [95, 60, [23, 24, 25, 26, 27, 28]],
    [96, 35, [7, 23]],
  ] as const) {
    expect(targets.find((t) => t.id === id)).toMatchObject({ hp, missionIds });
    expect(initial.targetIds).toContain(id);
  }
});
