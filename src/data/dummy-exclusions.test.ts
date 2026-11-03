import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { initialPreferences, selectedTargets, targetCandidates } from '../state/preferences';
import { restorePreferences } from '../storage/preferences';

test('Q002のダミー6行だけを非表示にし、同名の通常目標と部位を保持する', () => {
  const excludedIds = [504, 456, 489, 199, 496, 261];
  const retainedIds = [50, 490, 204, 494, 247, 147, 371, 330, 226, 248];
  const catalog = { targets, weapons };
  const initial = initialPreferences(false, catalog);
  const expanded = { ...initial, showParts: true, showMissionVariants: true };
  for (const id of excludedIds) {
    expect(targets.find((t) => t.id === id)?.category).toBe('EXCLUDED');
    expect(initial.targetIds).not.toContain(id);
  }
  const oldSelection = { ...expanded, targetIds: [...excludedIds, ...retainedIds] };
  expect(
    selectedTargets(oldSelection, targets)
      .map((t) => t.id)
      .sort((a, b) => a - b)
  ).toEqual([...retainedIds].sort((a, b) => a - b));
  for (const [query, ids] of [
    ['AIR BASE', [490, 204]],
    ['APC', [50]],
    ['LAND BATTLESHIP 2 [M19]', [247]],
  ] as const) {
    expect(targetCandidates(expanded, targets, query).map((t) => t.id)).toEqual(ids);
  }
  expect(
    restorePreferences({ ...oldSelection, version: 1 }, initial, catalog, []).targetIds
  ).toEqual(retainedIds);
});
