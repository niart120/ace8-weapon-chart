import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { initialPreferences, selectedTargets, targetCandidates } from '../state/preferences';
import { calculateDefeatRequirement } from '../domain/calculate';

test('M26のUNKNOWNは命中数未確定で掲載し、UAVの未裏付け基本行を除外する', () => {
  const state = initialPreferences(false, { targets, weapons });
  const unknown = targets.find((t) => t.id === 410);
  expect(unknown).toMatchObject({
    category: 'AIRCRAFT',
    hp: 300,
    standardDamage: false,
    missionIds: [26],
  });
  if (!unknown) throw new Error('UNKNOWNが見つからない');
  expect(selectedTargets({ ...state, targetMode: 'MISSION', missionIds: [26] }, targets)).toContain(
    unknown
  );
  for (const weapon of weapons.filter((w) => w.category !== 'UNUSED')) {
    for (const damageType of ['DIRECT', 'BLAST', 'DIRECT+BLAST'] as const) {
      expect(
        calculateDefeatRequirement(unknown, weapon, { role: 'MULTIROLE', parts: [], damageType })
      ).toEqual({ kind: 'unknown' });
    }
  }
  for (const id of [493, 499]) {
    expect(targets.find((t) => t.id === id)?.category).toBe('EXCLUDED');
    expect(state.targetIds).not.toContain(id);
    expect(
      selectedTargets({ ...state, targetIds: [id], showMissionVariants: true }, targets)
    ).toEqual([]);
  }
  for (const [id, mission, hp] of [
    [216, 15, 4],
    [224, 16, 10],
    [411, 26, 60],
  ]) {
    expect(targets.find((t) => t.id === id)).toMatchObject({
      category: 'AIRCRAFT',
      hp,
      standardDamage: true,
      missionIds: [mission],
    });
  }
});

test('護衛対象のSHUTTLE TRANSPORTは基本行とM20行をともに掲載しない', () => {
  const initial = initialPreferences(false, { targets, weapons });
  for (const id of [497, 262]) {
    expect(targets.find((t) => t.id === id)?.category).toBe('EXCLUDED');
    expect(initial.targetIds).not.toContain(id);
  }
  const state = { ...initial, targetIds: [497, 262], showMissionVariants: true };
  expect(targetCandidates(state, targets, 'SHUTTLE TRANSPORT')).toEqual([]);
  expect(selectedTargets(state, targets)).toEqual([]);
  for (const missionIds of [[], [20]]) {
    expect(
      selectedTargets({ ...state, targetMode: 'MISSION', missionIds }, targets).filter((t) =>
        t.name.startsWith('SHUTTLE TRANSPORT')
      )
    ).toEqual([]);
  }
});
