import { expect, test } from 'vitest';
import { targets, weapons } from '../data/masters';
import {
  initialPreferences,
  selectedTargets,
  targetCandidates,
  selectMission,
  changeTargetIncludes,
  compareTargets,
} from './preferences';
const initial = initialPreferences(false, { targets, weapons });

test('任務変更はINCLUDE範囲の全対象を選択し、ALLへ戻すと任務制限を解除する', () => {
  const before = { ...initial, targetIds: [], weaponIds: [21], showMissionVariants: true };
  const m3 = selectMission(before, 3, targets);
  expect(
    selectedTargets(m3, targets)
      .flatMap((t) => t.members)
      .toSorted(compareTargets)
  ).toEqual(targetCandidates(m3, targets));
  expect(selectedTargets(m3, targets).some((t) => t.name === 'MIG-29A (SHADOW)')).toBe(true);
  expect(selectedTargets(m3, targets).every((t) => t.missionIds.includes(3))).toBe(true);
  const m20 = selectMission(m3, 20, targets);
  expect(selectedTargets(m20, targets).every((t) => t.missionIds.includes(20))).toBe(true);
  const all = selectMission(m20, null, targets);
  expect(
    selectedTargets(all, targets)
      .flatMap((t) => t.members)
      .toSorted(compareTargets)
  ).toEqual(targetCandidates(all, targets));
  expect(all.weaponIds).toEqual([21]);
  expect(all.conditions).toEqual(before.conditions);
  expect(selectMission({ ...m3, targetIds: [] }, 3, targets).targetIds).toEqual([]);
});

test('INCLUDEは新規対象を選択し、既存の手動解除を保ち、範囲外を解除する', () => {
  const base = { ...initial, targetIds: initial.targetIds.filter((id) => id !== 26) };
  const parts = changeTargetIncludes(
    base,
    { showParts: true, showMissionVariants: false },
    targets
  );
  expect(parts.targetIds).not.toContain(26);
  const added = targetCandidates(parts, targets)
    .filter((t) => t.partOf)
    .map((t) => t.id);
  expect(added.length).toBeGreaterThan(0);
  for (const id of added) expect(parts.targetIds).toContain(id);
  const both = changeTargetIncludes(parts, { showParts: true, showMissionVariants: true }, targets);
  const combined = targets.find((t) => t.partOf && t.missionVariant && t.category !== 'EXCLUDED')!;
  expect(parts.targetIds).not.toContain(combined.id);
  expect(both.targetIds).toContain(combined.id);
  const variantsOnly = changeTargetIncludes(
    both,
    { showParts: false, showMissionVariants: true },
    targets
  );
  expect(variantsOnly.targetIds).not.toContain(combined.id);
  expect(selectedTargets(variantsOnly, targets).some((t) => t.partOf)).toBe(false);
  const back = changeTargetIncludes(
    variantsOnly,
    { showParts: false, showMissionVariants: false },
    targets
  );
  expect(new Set(back.targetIds)).toEqual(new Set(base.targetIds));
});

test('任務内のINCLUDE自動選択は他任務へ広がらず、名前検索にも左右されない', () => {
  const m27 = selectMission(initial, 27, targets);
  const included = changeTargetIncludes(
    m27,
    { showParts: true, showMissionVariants: true },
    targets
  );
  expect(
    selectedTargets(included, targets)
      .flatMap((t) => t.members)
      .toSorted(compareTargets)
  ).toEqual(targetCandidates(included, targets));
  expect(selectedTargets(included, targets).every((t) => t.missionIds.includes(27))).toBe(true);
  expect(targetCandidates(included, targets, 'NO MATCH')).toEqual([]);
  expect(included.targetIds.length).toBeGreaterThan(0);
});
