import { expect, test } from 'vitest';

import { weapons, targets } from '../data/masters';
const catalog = { weapons, targets };
test('PC初回は全兵装、スマートフォン初回は通常MSL、目標は基本対象を選択', () => {
  expect(initialPreferences(false, catalog).weaponIds).toHaveLength(31);
  expect(initialPreferences(true, catalog).weaponIds).toEqual([1]);
  expect(initialPreferences(false, catalog).targetIds).toHaveLength(
    targets.filter((t) => t.category !== 'EXCLUDED' && !t.partOf && !t.missionVariant).length
  );
});

import {
  initialPreferences,
  groupSelection,
  selectedTargets,
  selectedWeapons,
  targetCandidates,
  toggleGroup,
  weaponCandidates,
} from './preferences';
test('渡された候補を一括操作し、一部選択から全選択する', () => {
  const group = weapons.filter((w) => w.category === 'MSL.AIR').map((w) => w.id);
  expect(groupSelection([group[0]], group)).toBe('some');
  expect(toggleGroup([1, group[0]], group)).toEqual([1, ...group]);
  expect(toggleGroup([1, ...group], group)).toEqual([1]);
  expect(weaponCandidates(weapons, 'qAa')).toHaveLength(1);
  const initial = initialPreferences(false, catalog);
  expect(selectedWeapons(initial, weapons)).toHaveLength(31);
  expect(selectedWeapons({ ...initial, weaponIds: [] }, weapons)).toEqual([]);
});
test('INCLUDEとミッションは候補のみ絞り、選択は独立する', () => {
  const initial = initialPreferences(false, catalog);
  const part = targets.find((t) => t.partOf && t.missionVariant && t.category !== 'EXCLUDED')!;
  expect(initial.targetIds).not.toContain(part.id);
  const expanded = { ...initial, showParts: true, showMissionVariants: true };
  expect(targetCandidates(expanded, targets).some((t) => t.id === part.id)).toBe(true);
  expect(selectedTargets(expanded, targets).some((t) => t.id === part.id)).toBe(false);
  const selected = { ...expanded, targetIds: [part.id] };
  expect(
    selectedTargets(
      { ...selected, showParts: false, showMissionVariants: false, missionIds: [1] },
      targets
    ).map((t) => t.id)
  ).toEqual([part.id]);
  expect(
    targetCandidates({ ...expanded, missionIds: [1] }, targets).every((t) =>
      t.missionIds.includes(1)
    )
  ).toBe(true);
});
