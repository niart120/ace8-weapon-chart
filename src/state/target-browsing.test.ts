import { expect, test } from 'vitest';
import { targets, weapons } from '../data/masters';
import { initialPreferences, selectedTargets, targetCandidates } from './preferences';

test('候補は選択の全解除に影響されず、M3の敵と任務差分を表示する', () => {
  const state = {
    ...initialPreferences(false, { targets, weapons }),
    missionIds: [3],
    targetIds: [],
  };
  const selected = targetCandidates(
    { ...state, showParts: true, showMissionVariants: true },
    targets
  );
  expect(selectedTargets(state, targets)).toEqual([]);
  expect(selected.some((t) => t.name === 'MIG-29A (SHADOW) [M3]')).toBe(true);
  expect(selected.some((t) => t.name === 'F-22A (SHADOW) [M20]')).toBe(false);
});

test('複数任務は和集合、任務未指定は全対象、個別選択は独立する', () => {
  const catalog = { targets, weapons };
  const initial = initialPreferences(false, catalog);
  const state = {
    ...initial,
    missionIds: [3, 20],
    targetIds: [26],
  };
  const ids = (missionIds: number[]) =>
    targetCandidates(
      { ...state, missionIds, showParts: true, showMissionVariants: true },
      targets
    ).map((t) => t.id);
  expect(new Set(ids([3, 20]))).toEqual(new Set([...ids([3]), ...ids([20])]));
  expect(ids([])).toHaveLength(targets.filter((t) => t.category !== 'EXCLUDED').length);
  expect(selectedTargets({ ...state }, targets).map((t) => t.id)).toEqual([26]);
});
