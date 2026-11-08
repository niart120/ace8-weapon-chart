import { expect, test } from 'vitest';
import { targets, weapons } from '../data/masters';
import {
  initialPreferences,
  selectedTargets,
  targetCandidates,
  changeTargetIncludes,
  groupSelection,
  toggleGroup,
} from './preferences';
import { groupTargets, targetAffiliations } from './target-groups';

const all = {
  ...initialPreferences(false, { targets, weapons }),
  showParts: true,
  showMissionVariants: true,
  targetIds: targets.map((t) => t.id),
};

test('合意した19組と19除外を反映し、全対象の比較行を217行にする', () => {
  expect(selectedTargets(all, targets)).toHaveLength(217);
  expect(selectedTargets(all, targets).filter((t) => t.name === 'AA GUN《SHIP》')).toHaveLength(1);
});

test('M27の有効値と名前が一意な任務機はMISSION VARIANTSなしで選べる', () => {
  const candidates = targetCandidates({ ...all, showMissionVariants: false }, targets);
  expect(candidates.find((t) => t.id === 419)?.name).toBe('PILLAR (Front)');
  expect(candidates.find((t) => t.id === 425)?.name).toBe('TURRET BASE《MEGAFLOAT》');
  expect(candidates.find((t) => t.id === 266)?.name).toBe('F-14D (SHADOW)');
  expect(candidates.some((t) => t.id === 343)).toBe(false);
});

test('所属検索と任務を元行へ適用し、AEGISの通常砲をM25に誤って載せない', () => {
  const candidates = targetCandidates({ ...all, missionId: 25 }, targets, 'AA GUN《AEGIS》');
  expect(candidates.map((t) => t.id)).toEqual([343]);
});

test('水上PODARGEだけの選択でも比較IDは固定し、所属は水上分だけを示す', () => {
  const rows = selectedTargets({ ...all, missionId: 25, targetIds: [383] }, targets);
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({ id: 184, name: 'VLS《PODARGE》' });
  expect(rows[0].members.map((t) => [t.id, t.partOf, t.category])).toEqual([[383, 381, 'SHIP']]);
  expect(targetAffiliations(rows[0].members)).toContain('SHIP · M25');
  expect(targetAffiliations(rows[0].members)).not.toContain('M11');
});

test('分類内の選択は別分類へ波及せず、結果だけを一行にまとめる', () => {
  const sources = targetCandidates({ ...all, missionId: 25 }, targets).filter(
    (t) => t.comparisonId === 184
  );
  const air = groupTargets(sources.filter((t) => t.category === 'AIRCRAFT'))[0];
  const sea = groupTargets(sources.filter((t) => t.category === 'SHIP'))[0];
  const ids = toggleGroup(
    [],
    sea.members.map((t) => t.id)
  );
  expect(ids).toEqual([383]);
  expect(
    groupSelection(
      ids,
      sources.map((t) => t.id)
    )
  ).toBe('some');
  const both = toggleGroup(
    ids,
    air.members.map((t) => t.id)
  );
  expect(selectedTargets({ ...all, targetIds: both }, targets)).toHaveLength(1);
  expect(
    toggleGroup(
      both,
      sea.members.map((t) => t.id)
    )
  ).toEqual([184]);
});

test('INCLUDE変更は既存の解除を維持し、M25差分を標準条件と混同しない', () => {
  const without = { ...all, showMissionVariants: false, targetIds: [244] };
  const withVariants = changeTargetIncludes(
    without,
    { showParts: true, showMissionVariants: true },
    targets
  );
  expect(withVariants.targetIds).toContain(343);
  expect(withVariants.targetIds).not.toContain(124);
  expect(
    selectedTargets(withVariants, targets)
      .filter((t) => t.name.startsWith('AA GUN《SHIP》'))
      .map((t) => t.name)
  ).toEqual(['AA GUN《SHIP》', 'AA GUN《SHIP》 [M25]']);
});
