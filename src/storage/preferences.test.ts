import { expect, test } from 'vitest';
import { readPreferences, restorePreferences, storageKey, writePreferences } from './preferences';
import { initialPreferences } from '../state/preferences';
import { weapons, targets, modifiers } from '../data/masters';
const catalog = { weapons, targets };
const initial = initialPreferences(false, catalog);
const parts = modifiers.parts.map((p) => p.key);
test('全解除を保存・復元し、検索・パネル・結果は保存しない', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  const state = { ...initial, weaponIds: [], targetIds: [], showParts: true };
  writePreferences(storage, state);
  expect(readPreferences(storage, initial, catalog, parts)).toEqual(state);
  expect(Object.keys(JSON.parse(values.get(storageKey)!))).toEqual([
    'version',
    'conditions',
    'weaponIds',
    'targetIds',
    'showParts',
    'showMissionVariants',
  ]);
});

test('統合した陸上戦艦部位の旧選択を代表IDへ移し、重複・全解除・非表示を保持する', () => {
  for (const [savedIds, expected] of [
    [
      [249, 258, 372, 151, 152],
      [248, 254, 372, 151, 152],
    ],
    [
      [249, 248, 258, 254, 330, 999],
      [248, 254],
    ],
    [[], []],
  ]) {
    const saved = {
      ...initial,
      version: 1,
      targetIds: savedIds,
      showParts: false,
      showMissionVariants: false,
    };
    const restored = restorePreferences(saved, initial, catalog, parts);
    expect(restored.targetIds).toEqual(expected);
    expect(restored.showParts).toBe(false);
    expect(restored.showMissionVariants).toBe(false);
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };
    writePreferences(storage, restored);
    expect(readPreferences(storage, initial, catalog, parts)).toEqual(restored);
  }
});
test('IDが追加・削除・改名・並べ替えされても選択だけを照合する', () => {
  const saved = {
    version: 1,
    ...initial,
    weaponIds: [1, 999],
    targetIds: [targets[0].id, 999],
    conditions: { ...initial.conditions, parts: ['missilePower', 'removed'] },
  };
  const updated = {
    weapons: [
      { ...weapons[0], name: 'renamed', order: 100 },
      { ...weapons[1], id: 1000 },
    ],
    targets: [targets[0], { ...targets[1], id: 1000 }],
  };
  const restored = restorePreferences(saved, initial, updated, parts);
  expect(restored.weaponIds).toEqual([1]);
  expect(restored.targetIds).toEqual([targets[0].id]);
  expect(restored.conditions.parts).toEqual(['missilePower']);
  expect(
    restorePreferences({ ...saved, weaponIds: [], targetIds: [] }, initial, updated, parts)
      .weaponIds
  ).toEqual([]);
});
test('破損・未知バージョン・保存禁止・容量不足でも操作用初期値を返す', () => {
  for (const value of [null, {}, { version: 9 }, { ...initial, version: 1, showParts: 'yes' }])
    expect(restorePreferences(value, initial, catalog, parts)).toEqual(initial);
  expect(
    readPreferences({ getItem: () => '{broken', setItem: () => {} }, initial, catalog, parts)
  ).toEqual(initial);
  const denied = {
    getItem: () => {
      throw new Error('denied');
    },
    setItem: () => {
      throw new Error('quota');
    },
  };
  expect(readPreferences(denied, initial, catalog, parts)).toEqual(initial);
  expect(() => writePreferences(denied, initial)).not.toThrow();
});
