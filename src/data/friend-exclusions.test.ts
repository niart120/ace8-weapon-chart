import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { initialPreferences, selectedTargets, targetCandidates } from '../state/preferences';
import { restorePreferences } from '../storage/preferences';

const excludedIds = [
  18, 19, 20, 21, 81, 82, 83, 84, 158, 159, 160, 161, 234, 22, 23, 24, 25, 209, 211, 162, 461, 163,
  506,
];

test('承認された友軍候補を保持したまま選択・検索・初期表示から除外する', () => {
  const initial = initialPreferences(false, { targets, weapons });
  const expanded = { ...initial, showParts: true, showMissionVariants: true };
  for (const id of excludedIds) {
    expect(targets.find((t) => t.id === id)?.category).toBe('EXCLUDED');
    expect(initial.targetIds).not.toContain(id);
    expect(selectedTargets(expanded, targets).map((t) => t.id)).not.toContain(id);
  }
  for (const query of ['QUEEN', 'PURPLE MAGIC', 'GREEN']) {
    expect(targetCandidates(expanded, targets, query)).toEqual([]);
  }
  expect(targets.find((t) => t.id === 124)).toMatchObject({ category: 'SHIP', partOf: 123 });
  expect(targets.find((t) => t.id === 506)).toMatchObject({ category: 'EXCLUDED', partOf: 461 });
  expect(targets.find((t) => t.id === 163)?.partOf).toBe(461);
  expect(
    targetCandidates(expanded, targets, 'AA GUN《AIRCRAFT CARRIER》').map((t) => t.id)
  ).toEqual([124]);
});

test('以前選択した除外対象を復元時に外し、他艦本体・部位のIDを維持する', () => {
  const catalog = { targets, weapons };
  const initial = initialPreferences(false, catalog);
  const restored = restorePreferences(
    { ...initial, version: 1, targetIds: [209, 211, 18, 162, 461, 123, 124, 163] },
    initial,
    catalog,
    []
  );
  expect(restored.targetIds).toEqual([123, 124]);
});
