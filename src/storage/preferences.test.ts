import { expect, test } from 'vitest';
import { readPreferences, restorePreferences, storageKey, writePreferences } from './preferences';
import { initialPreferences } from '../state/preferences';
import { weapons, targets, publishedParts } from '../data/masters';
const catalog = { weapons, targets };
const initial = initialPreferences(false, catalog);
const parts = publishedParts.map((p) => p.key);
test('現行の掲載対象だけを復元し、未知・非掲載・重複の選択を除く', () => {
  const saved = {
    ...initial,
    version: 5,
    weaponIds: [1, 1, 999, ...weapons.filter((w) => w.category === 'UNUSED').map((w) => w.id)],
    targetIds: [26, 26, 999, ...targets.filter((t) => t.category === 'EXCLUDED').map((t) => t.id)],
    conditions: {
      role: 'MULTIROLE',
      parts: ['missilePower', 'missilePower', 'laserPower', 'unknown'],
      damageType: 'BLAST',
    },
    showParts: true,
    showMissionVariants: true,
  };
  expect(restorePreferences(saved, initial, catalog, parts)).toEqual({
    missionId: null,
    weaponIds: [1],
    targetIds: [26],
    conditions: { role: 'MULTIROLE', parts: ['missilePower'], damageType: 'BLAST' },
    showParts: true,
    showMissionVariants: true,
  });
});

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
  expect(JSON.parse(values.get(storageKey)!).version).toBe(5);
  expect(readPreferences(storage, initial, catalog, parts)).toEqual(state);
  expect(Object.keys(JSON.parse(values.get(storageKey)!))).toEqual([
    'version',
    'missionId',
    'conditions',
    'weaponIds',
    'targetIds',
    'showParts',
    'showMissionVariants',
  ]);
});

test('破損・未知バージョン・保存禁止・容量不足でも操作用初期値を返す', () => {
  for (const value of [null, {}, { version: 9 }, { ...initial, version: 5, showParts: 'yes' }])
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

test('単一任務を復元し、範囲外の選択を除き、旧形式や不正任務は初期化する', () => {
  const saved = { ...initial, version: 5, missionId: 3, targetIds: [26, 430] };
  expect(restorePreferences(saved, initial, catalog, parts)).toEqual({
    ...initial,
    missionId: 3,
    targetIds: [26],
  });
  for (const missionId of [undefined, 0, 14, 31, 2.5, '3', [3, 20]]) {
    expect(restorePreferences({ ...saved, missionId }, initial, catalog, parts)).toEqual(initial);
  }
  expect(restorePreferences({ ...saved, version: 4 }, initial, catalog, parts)).toEqual(initial);
});
