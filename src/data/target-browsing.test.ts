import { expect, test } from 'vitest';
import { targets, weapons, modifiers } from './masters';
import { validateMasters } from '../domain/validate';
import { missions } from '../domain/catalog';
import { initialPreferences, selectedTargets, targetCandidates } from '../state/preferences';

test('輸送船の味方・未裏付け任務だけを除外し、確認済み任務とTYPE掲載を維持する', () => {
  const state = initialPreferences(false, { targets, weapons });
  for (const [id, hp, missionIds] of [
    [198, 55, [12]],
    [54, 75, [4, 26]],
    [413, 75, [27]],
  ] as const) {
    expect(targets.find((t) => t.id === id)).toMatchObject({ category: 'SHIP', hp, missionIds });
    expect(selectedTargets({ ...state, targetIds: [id] }, targets).map((t) => t.id)).toEqual([id]);
    for (const mission of missionIds) {
      expect(
        targetCandidates(
          { ...state, showParts: true, showMissionVariants: true, missionIds: [mission] },
          targets
        ).map((t) => t.id)
      ).toContain(id);
    }
  }
  for (const [id, mission] of [
    [198, 23],
    [54, 23],
    [413, 26],
  ]) {
    expect(
      targetCandidates(
        {
          ...state,
          showParts: true,
          showMissionVariants: true,
          missionIds: [mission],
          targetIds: [id],
        },
        targets
      ).map((t) => t.id)
    ).not.toContain(id);
  }
});

test('確認済みの非敵・撃破対象外・PV機体を掲載から除外する', () => {
  for (const id of [45, 55, 145, 194, 204, 210, 262, 267, 269, 275, 276, 412]) {
    expect(targets.find((t) => t.id === id)?.category).toBe('EXCLUDED');
  }
});

test('任務限定の除外は他任務・通常機・艦載部位へ波及させない', () => {
  const state = {
    ...initialPreferences(false, { targets, weapons }),
    showParts: true,
    showMissionVariants: true,
  };
  const ids = (missionId: number) =>
    targetCandidates({ ...state, missionIds: [missionId] }, targets).map((t) => t.id);
  expect(ids(3)).toEqual(expect.arrayContaining([26, 8]));
  expect(
    targetCandidates({ ...state, missionIds: [3] }, targets).every((t) => t.category === 'AIRCRAFT')
  ).toBe(true);
  expect(ids(2)).not.toContain(12);
  expect(ids(2)).not.toContain(223);
  expect(ids(6)).toContain(91);
  expect(ids(6)).not.toContain(92);
  expect(ids(24)).toEqual(expect.arrayContaining([91, 92]));
  expect(ids(24)).not.toContain(320);
  expect(ids(11)).toContain(67);
  expect(ids(20)).not.toContain(67);
  expect(ids(20)).toContain(265);
  expect(ids(21)).not.toContain(32);
  expect(ids(21)).not.toContain(33);
  expect(ids(21)).toEqual(expect.arrayContaining([244, 126, 128, 60, 58]));
  expect(ids(27)).not.toContain(320);
  expect(ids(4)).not.toContain(472);
  expect(ids(30)).toContain(472);
  expect(ids(14)).toEqual([]);
});

test('撃破対象外のM28 X-40を除外し、M29の戦闘対象は維持する', () => {
  const state = {
    ...initialPreferences(false, { targets, weapons }),
    targetIds: targets.map((t) => t.id),
    showParts: true,
    showMissionVariants: true,
  };
  for (const [id, missionId] of [[435, 28]] as const) {
    expect(targets.find((t) => t.id === id)).toMatchObject({
      category: 'EXCLUDED',
      missionIds: [missionId],
    });
    expect(targetCandidates(state, targets).map((t) => t.id)).not.toContain(id);
    expect(selectedTargets(state, targets).map((t) => t.id)).not.toContain(id);
    for (const missionIds of [[], [missionId]]) {
      expect(
        targetCandidates(
          { ...state, showParts: true, showMissionVariants: true, missionIds },
          targets
        ).map((t) => t.id)
      ).not.toContain(id);
    }
  }
  const finalBattle = targetCandidates(
    { ...state, showParts: true, showMissionVariants: true, missionIds: [29] },
    targets
  );
  expect(finalBattle.map((t) => t.id)).toEqual(expect.arrayContaining([457, 458, 459, 460]));
});

test('機体マスタの区分を優先し、用途・部位で細分類する', () => {
  for (const [id, group] of [
    [273, 'ATTACKER'],
    [272, 'ATTACKER'],
    [66, 'FIGHTER'],
    [265, 'MULTIROLE'],
    [274, 'ELECTRONIC WARFARE'],
    [230, 'ROTORCRAFT'],
    [33, 'AIR DEFENSE'],
    [208, 'AIR DEFENSE'],
    [90, 'FORTIFICATION'],
    [51, 'ARMOR'],
    [430, 'PARTS'],
  ] as const) {
    expect(targets.find((t) => t.id === id)?.subcategory).toBe(group);
  }
});

test('通常機・任務差分・子部位の出現任務を区別し、未知の出現先を補わない', () => {
  expect(targets.find((t) => t.id === 273)?.missionIds).toEqual([21, 23]);
  expect(targets.find((t) => t.id === 28)?.missionIds).toEqual([3]);
  expect(targets.find((t) => t.id === 268)?.missionIds).toEqual([20]);
  expect(targets.find((t) => t.id === 430)?.missionIds).toEqual([27]);
  expect(targets.find((t) => t.id === 178)?.missionIds).toEqual([10, 18, 24]);
  expect(targets.find((t) => t.id === 493)?.missionIds).toEqual([]);
  expect(missions.find((m) => m.id === 24)?.name).toBe('M24');
  expect(missions.find((m) => m.id === 25)?.name).toBe('M25');
});

test('未知の細分類・出現任務・任務重複を拒否する', () => {
  for (const change of [
    { subcategory: 'INVALID' },
    { missionIds: ['25'] },
    { missionIds: [31] },
    { missionIds: [2.5] },
    { missionVariant: { missionId: '25day2' } },
    { missionVariant: { missionId: 31 } },
    { missionIds: [3, 3] },
  ]) {
    expect(() =>
      validateMasters({
        weapons,
        modifiers,
        targets: targets.map((t, i) => (i === 0 ? { ...t, ...change } : t)),
      })
    ).toThrow();
  }
});

test('部位は固有の任務と子NPC参照に限定し、親の別任務へ広げない', () => {
  for (const [id, missionIds] of [
    [377, [25]],
    [180, [11]],
    [368, [25]],
    [223, [16]],
    [503, []],
    [460, [29]],
  ] as const) {
    expect(targets.find((t) => t.id === id)?.missionIds).toEqual(missionIds);
  }
});
