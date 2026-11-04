import { expect, test } from 'vitest';

import { weapons, targets } from '../data/masters';
const catalog = { weapons, targets };
test('PC初回は全兵装、スマートフォン初回は通常MSL、目標は全選択', () => {
  expect(initialPreferences(false, catalog).weaponIds).toHaveLength(31);
  expect(initialPreferences(true, catalog).weaponIds).toEqual([1]);
  expect(initialPreferences(false, catalog).targetIds).toHaveLength(
    targets.filter((t) => t.category !== 'EXCLUDED').length
  );
});

import {
  initialPreferences,
  groupSelection,
  resetPreferences,
  selectedTargets,
  selectedWeapons,
  targetCandidates,
  toggleGroup,
  toggleId,
  weaponCandidates,
} from './preferences';
test('検索と開閉に依存せず分類全体を一括操作し、一部選択から全選択する', () => {
  const group = weapons.filter((w) => w.category === 'MSL.AIR').map((w) => w.id);
  expect(groupSelection([group[0]], group)).toBe('some');
  expect(toggleGroup([1, group[0]], group)).toEqual([1, ...group]);
  expect(toggleGroup([1, ...group], group)).toEqual([1]);
  expect(weaponCandidates(weapons, 'qAa')).toHaveLength(1);
  const initial = initialPreferences(false, catalog);
  expect(selectedWeapons(initial, weapons)).toHaveLength(31);
  expect(selectedWeapons({ ...initial, weaponIds: [] }, weapons)).toEqual([]);
});
test('部位と任務差分を両方要求する行を隠しても個別選択を保持する', () => {
  const initial = initialPreferences(false, catalog);
  const part = targets.find((t) => t.partOf && t.missionVariant && t.category !== 'EXCLUDED')!;
  expect(targetCandidates(initial, targets).some((t) => t.id === part.id)).toBe(false);
  const expanded = { ...initial, showParts: true, showMissionVariants: true };
  expect(selectedTargets(expanded, targets).some((t) => t.id === part.id)).toBe(true);
  const disabled = { ...expanded, targetIds: toggleId(expanded.targetIds, part.id) };
  expect(
    selectedTargets({ ...disabled, showParts: false }, targets).some((t) => t.id === part.id)
  ).toBe(false);
  expect(
    selectedTargets({ ...disabled, showParts: true }, targets).some((t) => t.id === part.id)
  ).toBe(false);
  const group = targets.filter((t) => t.category === part.category).map((t) => t.id);
  const cleared = { ...initial, targetIds: toggleGroup(initial.targetIds, group) };
  expect(
    selectedTargets({ ...cleared, showParts: true, showMissionVariants: true }, targets).some(
      (t) => t.category === part.category
    )
  ).toBe(false);
});
test('3区分のリセットは他区分を保持し、全解除を勝手に戻さない', () => {
  const state = {
    ...initialPreferences(false, catalog),
    weaponIds: [],
    targetIds: [],
    showParts: true,
    showMissionVariants: true,
    conditions: {
      role: 'ATTACKER' as const,
      parts: ['missilePower'],
      damageType: 'BLAST' as const,
    },
  };
  const reset = resetPreferences(state, 'conditions', false, catalog);
  expect(reset.weaponIds).toEqual([]);
  expect(reset.targetIds).toEqual([]);
  expect(reset.showParts).toBe(true);
  expect(reset.conditions.role).toBe('FIGHTER');
  expect(resetPreferences(state, 'weapons', true, catalog).weaponIds).toEqual([1]);
  expect(resetPreferences(state, 'targets', false, catalog).showParts).toBe(false);
  expect(resetPreferences(state, 'all', false, catalog)).toEqual(
    initialPreferences(false, catalog)
  );
});
