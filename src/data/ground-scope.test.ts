import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { initialPreferences, selectedTargets, targetCandidates } from '../state/preferences';

test('破壊後PILLBOXだけを除外し、通常型と確認済み地上目標を維持する', () => {
  const state = { ...initialPreferences(false, { targets, weapons }), targetIds: [340] };
  expect(targets.find((t) => t.id === 340)).toMatchObject({ category: 'EXCLUDED', hp: 10000 });
  expect(selectedTargets(state, targets)).toEqual([]);
  expect(targetCandidates(state, targets, 'PILLBOX').map((t) => t.id)).not.toContain(340);
  for (const missionIds of [[], [25]]) {
    expect(
      selectedTargets({ ...state, targetMode: 'MISSION', missionIds }, targets).map((t) => t.id)
    ).not.toContain(340);
  }
  for (const [id, hp, missionIds] of [
    [90, 120, [6, 24]],
    [325, 160, [24]],
    [326, 30, [24, 25]],
    [318, 30, [23]],
    [481, 160, [19]],
  ] as const) {
    expect(targets.find((t) => t.id === id)).toMatchObject({ category: 'GROUND', hp, missionIds });
    for (const missionId of missionIds) {
      expect(
        selectedTargets({ ...state, targetMode: 'MISSION', missionIds: [missionId] }, targets).map(
          (t) => t.id
        )
      ).toContain(id);
    }
  }
});

test('未裏付けのGROUND基本4行を除外し、CLIMBERとEX-SAMの任務行を維持する', () => {
  const excludedIds = [477, 478, 479, 495];
  const initial = initialPreferences(false, { targets, weapons });
  for (const id of excludedIds) {
    expect(targets.find((t) => t.id === id)?.category).toBe('EXCLUDED');
    expect(initial.targetIds).not.toContain(id);
  }
  const saved = { ...initial, targetIds: excludedIds, showMissionVariants: true };
  expect(selectedTargets(saved, targets)).toEqual([]);
  for (const query of ['', 'AD TANK', 'XSAM', 'PUSHBACK TRUCK', 'CLIMBER']) {
    expect(targetCandidates(saved, targets, query).some((t) => excludedIds.includes(t.id))).toBe(
      false
    );
  }
  for (const missionIds of [[], [17], [19], [23]]) {
    const selected = selectedTargets({ ...saved, targetMode: 'MISSION', missionIds }, targets);
    expect(selected.some((t) => excludedIds.includes(t.id))).toBe(false);
  }
  for (const [id, hp, missionIds] of [
    [259, 100, [19]],
    [225, 35, [17, 23]],
  ] as const) {
    expect(targets.find((t) => t.id === id)).toMatchObject({ category: 'GROUND', hp, missionIds });
    for (const missionId of missionIds) {
      expect(
        selectedTargets({ ...saved, targetMode: 'MISSION', missionIds: [missionId] }, targets).map(
          (t) => t.id
        )
      ).toContain(id);
    }
  }
});
