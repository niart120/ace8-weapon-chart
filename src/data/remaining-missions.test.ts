import { targetCandidates, initialPreferences, selectedTargets } from '../state/preferences';

import { expect, test } from 'vitest';
import { targets, weapons } from './masters';

test('一括確認の除外だけを任務選択へ反映し、残置指定と通常機・SHADOWの区別を保つ', () => {
  const state = initialPreferences(false, { targets, weapons });
  const ids = (missionId: number) =>
    targetCandidates(
      { ...state, showParts: true, showMissionVariants: true, missionId },
      targets
    ).map((target) => target.id);
  for (const [mission, removed] of [
    [8, [121, 6, 30, 4, 75, 8]],
    [10, [59, 60, 61]],
    [11, [4]],
    [12, [59, 60, 61, 62, 63, 64, 65]],
    [17, [29]],
    [21, [70]],
    [22, [32, 33]],
    [23, [307, 93, 118, 94, 69]],
    [24, [320]],
    [25, [122, 274, 66, 233, 30, 241, 197, 1, 67, 73, 4, 68, 75, 265, 207, 335, 95]],
    [27, [417]],
  ] as const) {
    for (const id of removed) expect(ids(mission), `M${mission}: ${id}`).not.toContain(id);
  }
  for (const [mission, retained] of [
    [8, [68, 135]],
    [9, [146]],
    [11, [67]],
    [12, [198, 50]],
    [17, [230]],
    [18, [235]],
    [21, [60, 244]],
    [22, [278, 281]],
    [23, [70, 29, 67, 8, 95, 207, 59, 60, 61, 62, 63, 64, 65]],
    [24, [29]],
    [25, [70, 29, 332, 336, 333, 69, 232, 306, 334, 272]],
    [26, [67, 68, 409]],
    [27, [70, 68, 335, 69]],
    [28, [70, 235, 307]],
  ] as const) {
    expect(ids(mission), `M${mission}`).toEqual(expect.arrayContaining([...retained]));
  }
  for (const id of [121, 320, 417]) {
    expect(targets.find((target) => target.id === id)?.category).toBe('EXCLUDED');
    expect(selectedTargets({ ...state, targetIds: [id] }, targets)).toEqual([]);
  }
  expect(targets.find((target) => target.id === 235)).toMatchObject({
    category: 'AIRCRAFT',
    hp: 115,
    missionIds: [18, 28],
    standardDamage: true,
  });
});
