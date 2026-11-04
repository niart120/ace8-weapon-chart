import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { initialPreferences, selectedTargets, targetCandidates } from '../state/preferences';

test('Q002のダミー6行を非表示にし、掲載対象の同名目標と部位を保持する', () => {
  const excludedIds = [504, 456, 489, 199, 496, 261];
  const retainedIds = [50, 248];
  const catalog = { targets, weapons };
  const initial = initialPreferences(false, catalog);
  const expanded = { ...initial, showParts: true, showMissionVariants: true };
  for (const id of excludedIds) {
    expect(targets.find((t) => t.id === id)?.category).toBe('EXCLUDED');
    expect(initial.targetIds).not.toContain(id);
  }
  const selection = { ...expanded, targetIds: retainedIds };
  expect(
    selectedTargets(selection, targets)
      .map((t) => t.id)
      .sort((a, b) => a - b)
  ).toEqual([...retainedIds].sort((a, b) => a - b));
  for (const [query, ids] of [
    // 基本行490も後続のSTRUCTURE掲載判断で除外済み。
    ['AIR BASE', []],
    ['APC', [50]],
    ['LAND BATTLESHIP 2 [M19]', []],
  ] as const) {
    expect(targetCandidates(expanded, targets, query).map((t) => t.id)).toEqual(ids);
  }
});
