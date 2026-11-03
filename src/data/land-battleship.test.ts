import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { initialPreferences, selectedTargets, targetCandidates } from '../state/preferences';
import { restorePreferences } from '../storage/preferences';
import { mergedTargetIds } from './target-merges';
import evidence from '../test/fixtures/land-parts-evidence.json';
import { calculateDefeatRequirement } from '../domain/calculate';

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

test('陸上戦艦の本体8行を除外し、親が非表示でも統合後の部位22行を掲載する', () => {
  const bodyIds = [147, 226, 247, 261, 330, 371, 494, 496];
  const partIds = [
    148, 149, 150, 151, 152, 153, 154, 155, 227, 228, 229, 248, 250, 251, 252, 253, 254, 255, 256,
    257, 372, 488,
  ];
  const catalog = { targets, weapons };
  const initial = initialPreferences(false, catalog);
  for (const id of bodyIds) {
    expect(targets.find((t) => t.id === id)?.category).toBe('EXCLUDED');
    expect(initial.targetIds).not.toContain(id);
  }
  const expanded = { ...initial, showParts: true, showMissionVariants: true };
  expect(
    targetCandidates(expanded, targets)
      .filter((t) => t.partOf !== null && bodyIds.includes(t.partOf))
      .map((t) => t.id)
      .sort((a, b) => a - b)
  ).toEqual(partIds);
  expect(targetCandidates({ ...expanded, showParts: false }, targets, 'LAND BATTLESHIP')).toEqual(
    []
  );
  for (const id of partIds) expect(initial.targetIds).toContain(id);
});

test('確認した艦船区分でMSLを計算し、部位・任務表示の4条件でも選択を保持する', () => {
  const initial = initialPreferences(false, { targets, weapons });
  const sub = targets.find((t) => t.id === 151)!;
  // HP40、MSL40、MULTIROLEの艦船倍率1、通常MSL耐性1から1発。
  expect(
    calculateDefeatRequirement(sub, weapons.find((w) => w.id === 1)!, {
      role: 'MULTIROLE',
      parts: ['missileGroundPower'],
      damageType: 'DIRECT',
    })
  ).toEqual({ kind: 'value', value: 1 });
  for (const showParts of [false, true])
    for (const showMissionVariants of [false, true]) {
      const state = {
        ...initial,
        targetIds: [151, 152, 153, 372, 488],
        showParts,
        showMissionVariants,
      };
      const ids = selectedTargets(state, targets)
        .map((t) => t.id)
        .sort((a, b) => a - b);
      expect(ids).toEqual(
        showParts ? (showMissionVariants ? [151, 152, 153, 372, 488] : [151, 152, 372, 488]) : []
      );
      expect(state.targetIds).toEqual([151, 152, 153, 372, 488]);
    }
});

test('確認済み属性・簡略名・元NPCの親関係を反映し、統合元の固定IDも残す', () => {
  for (const id of evidence.resolvedTargetIds) {
    expect(targets.find((t) => t.id === id)).toMatchObject({
      isAir: false,
      roleGroup: 'ship',
      standardDamage: true,
    });
  }
  expect(targets.find((t) => t.id === 151)).toMatchObject({
    name: 'SUB CATERPILLAR',
    hp: 40,
    partOf: 147,
  });
  expect(targets.find((t) => t.id === 152)).toMatchObject({
    name: 'SUB CATERPILLAR (CORE)',
    hp: 300,
    partOf: 147,
  });
  expect(evidence.parents.GR039_ldbs4_B_01).toContain('GR039_ldbs4_B_MainCannon1');
  expect(evidence.parents.GR039_ldbs4_C_01).toEqual([
    'GR039_ldbs4_C_MainCannon2',
    'GR039_ldbs4_C_MainCannon3',
  ]);
  expect(evidence.parents.GR036_ldbs1_01).not.toContain('GR039_ldbs4_B_MainCannon1');
  expect(targets.find((t) => t.id === 372)).toMatchObject({
    name: 'MAIN GUN《LAND BATTLESHIP (ROCKY ISLAND)》',
    partOf: 371,
    hp: 80,
    missionVariant: null,
  });
  for (const [oldId, representativeId] of mergedTargetIds) {
    const old = targets.find((t) => t.id === oldId)!;
    const representative = targets.find((t) => t.id === representativeId)!;
    expect(old.category).toBe('EXCLUDED');
    expect(representative.category).toBe('GROUND');
    expect({
      ...old,
      id: representative.id,
      order: representative.order,
      category: representative.category,
    }).toEqual(representative);
  }
});
