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
    version: 2,
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
    targetMode: 'TYPE',
    missionIds: [],
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
  expect(JSON.parse(values.get(storageKey)!).version).toBe(2);
  expect(readPreferences(storage, initial, catalog, parts)).toEqual(state);
  expect(Object.keys(JSON.parse(values.get(storageKey)!))).toEqual([
    'version',
    'targetMode',
    'missionIds',
    'conditions',
    'weaponIds',
    'targetIds',
    'showParts',
    'showMissionVariants',
  ]);
});

test('破損・未知バージョン・保存禁止・容量不足でも操作用初期値を返す', () => {
  for (const value of [null, {}, { version: 9 }, { ...initial, version: 2, showParts: 'yes' }])
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

test('方式と非アクティブ選択も保存し、未知任務を除き、旧形式を変換しない', () => {
  const saved = {
    ...initial,
    version: 2,
    targetMode: 'MISSION',
    missionIds: ['4', '4', '25day2', 'missing'],
    targetIds: [26],
  };
  expect(restorePreferences(saved, initial, catalog, parts)).toEqual({
    ...initial,
    targetMode: 'MISSION',
    missionIds: ['4', '25day2'],
    targetIds: [26],
  });
  for (const invalid of [
    { ...saved, version: 1 },
    { ...saved, targetMode: 'OTHER' },
    { ...saved, missionIds: [4] },
  ]) {
    expect(restorePreferences(invalid, initial, catalog, parts)).toEqual(initial);
  }
});
