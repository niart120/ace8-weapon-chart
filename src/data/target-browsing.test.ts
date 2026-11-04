import { expect, test } from 'vitest';
import { targets, weapons, modifiers } from './masters';
import { validateMasters } from '../domain/validate';
import { missions } from '../domain/catalog';

test('機体マスタの区分を優先し、用途・部位で細分類する', () => {
  for (const [id, group] of [
    [273, 'ATTACKER'],
    [272, 'ATTACKER'],
    [66, 'FIGHTER'],
    [265, 'MULTIROLE'],
    [274, 'ELECTRONIC WARFARE'],
    [121, 'ROTORCRAFT'],
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
  expect(targets.find((t) => t.id === 273)?.missionIds).toEqual(['22', '24']);
  expect(targets.find((t) => t.id === 28)?.missionIds).toEqual(['4']);
  expect(targets.find((t) => t.id === 267)?.missionIds).toEqual(['21']);
  expect(targets.find((t) => t.id === 430)?.missionIds).toEqual(['27']);
  expect(targets.find((t) => t.id === 178)?.missionIds).toEqual(['11', '19', '25day1']);
  expect(targets.find((t) => t.id === 493)?.missionIds).toEqual([]);
  expect(missions.find((m) => m.id === '25day1')?.name).toBe('M24');
  expect(missions.find((m) => m.id === '25day2')?.name).toBe('M25');
});

test('未知の細分類・出現任務・任務重複を拒否する', () => {
  for (const change of [
    { subcategory: 'INVALID' },
    { missionIds: ['25'] },
    { missionIds: ['4', '4'] },
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
