import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { initialPreferences, selectedTargets, targetCandidates } from '../state/preferences';
import { restorePreferences } from '../storage/preferences';

test('M24・M25の本体の旧選択を除去し、M25の主砲を保持する', () => {
  const catalog = { targets, weapons };
  const initial = initialPreferences(false, catalog);
  expect(targets.find((t) => t.id === 330)).toMatchObject({
    category: 'EXCLUDED',
    hp: 100,
    missionVariant: { missionId: '25day1' },
  });
  expect(initial.targetIds).not.toContain(330);
  const saved = {
    ...initial,
    targetIds: [330, 371, 372],
    showParts: true,
    showMissionVariants: true,
  };
  expect(selectedTargets(saved, targets).map((t) => t.id)).toEqual([372]);
  expect(targetCandidates(saved, targets, 'LAND BATTLESHIP 1 [M24]')).toEqual([]);
  expect(restorePreferences({ ...saved, version: 1 }, initial, catalog, []).targetIds).toEqual([
    372,
  ]);
});

test('陸上戦艦の本体8行を除外し、親が非表示でも部位24行を掲載する', () => {
  const bodyIds = [147, 226, 247, 261, 330, 371, 494, 496];
  const partIds = [
    148, 149, 150, 151, 152, 153, 154, 155, 227, 228, 229, 248, 249, 250, 251, 252, 253, 254, 255,
    256, 257, 258, 372, 488,
  ];
  const catalog = { targets, weapons };
  const initial = initialPreferences(false, catalog);
  for (const id of bodyIds) {
    expect(targets.find((t) => t.id === id)?.category).toBe('EXCLUDED');
    expect(initial.targetIds).not.toContain(id);
  }
  const expanded = { ...initial, showParts: true, showMissionVariants: true };
  expect(
    targetCandidates(expanded, targets, 'LAND BATTLESHIP')
      .map((t) => t.id)
      .sort((a, b) => a - b)
  ).toEqual(partIds);
  expect(targetCandidates({ ...expanded, showParts: false }, targets, 'LAND BATTLESHIP')).toEqual(
    []
  );
  for (const id of partIds) expect(initial.targetIds).toContain(id);
});
