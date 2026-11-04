import { expect, test } from 'vitest';
import { targets, weapons } from '../data/masters';
import { initialPreferences, resetPreferences, selectedTargets } from './preferences';

test('MISSIONではTYPEの全解除に影響されず、M3の敵と任務差分を表示する', () => {
  const state = {
    ...initialPreferences(false, { targets, weapons }),
    targetMode: 'MISSION' as const,
    missionIds: ['4'],
    targetIds: [],
  };
  const selected = selectedTargets(state, targets);
  expect(selected.some((t) => t.name === 'MIG-29A (SHADOW) [M3]')).toBe(true);
  expect(selected.some((t) => t.name === 'F-22A (SHADOW) [M20]')).toBe(false);
});

test('複数任務は和集合、空選択は全対象、TYPEへ戻ると個別選択を復元する', () => {
  const catalog = { targets, weapons };
  const initial = initialPreferences(false, catalog);
  const state = {
    ...initial,
    targetMode: 'MISSION' as const,
    missionIds: ['4', '21'],
    targetIds: [26],
  };
  const ids = (missionIds: string[]) =>
    selectedTargets({ ...state, missionIds }, targets).map((t) => t.id);
  expect(new Set(ids(['4', '21']))).toEqual(new Set([...ids(['4']), ...ids(['21'])]));
  expect(ids([])).toHaveLength(targets.filter((t) => t.category !== 'EXCLUDED').length);
  expect(selectedTargets({ ...state, targetMode: 'TYPE' }, targets).map((t) => t.id)).toEqual([26]);
  expect(resetPreferences(state, 'targets', false, catalog)).toEqual(initial);
});
