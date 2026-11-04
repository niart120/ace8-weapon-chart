import { expect, test } from 'vitest';
import { targets, weapons } from './masters';
import { initialPreferences, selectedTargets, targetCandidates } from '../state/preferences';

// Reviewed mission/NPC mappings; these expectations do not derive labels from the master.
const labels = [
  [266, 'F-14D (SHADOW) [M20]', 20],
  [134, 'F-15E (SHADOW) [M8]', 8],
  [133, 'F-16C (SHADOW) [M8]', 8],
  [268, 'F-22A (SHADOW) [M20]', 20],
  [332, 'GRIPEN E (SHADOW) [M25]', 25],
  [28, 'MIG-29A (SHADOW) [M3]', 3],
  [267, 'MIG-29A (SHADOW) [M20]', 20],
  [193, 'MIG-31B (SHADOW) [M11]', 11],
  [135, 'MIRAGE 2000-5 (SHADOW) [M8]', 8],
  [336, 'SU-33 (SHADOW) [M25]', 25],
  [305, 'SU-35S (VENTUS) [M23]', 23],
  [194, 'SU-35S (SHADOW) [M11]', 11],
  [269, 'SU-35S (SHADOW) [M20]', 20],
  [236, 'SU-47 (SHADOW) [M18]', 18],
  [235, 'SU-57 (SHADOW)', null],
  [412, 'SU-57 (SHADOW) [M26]', 26],
  [333, 'TYPHOON (SHADOW) [M25]', 25],
] as const;

test('識別名と任務ラベルを確認済み17行へ対応させる', () => {
  for (const [id, name, missionId] of labels) {
    const target = targets.find((t) => t.id === id);
    expect(target?.name).toBe(name);
    expect(target?.missionVariant).toEqual(missionId ? { missionId } : null);
  }
  expect(targets.find((t) => t.id === 235)?.damageMultipliers.uavt).toBe(0.25);
  expect(targets.find((t) => t.id === 412)?.damageMultipliers.uavt).toBe(1);
  expect(targets.find((t) => t.id === 95)?.name).toBe('TYPHOON');
  expect(targets.some((t) => t.name.includes('(NAMED'))).toBe(false);
});

test('任務差分を隠しても選択を保持し、識別名で検索できる', () => {
  const catalog = { targets, weapons };
  const initial = initialPreferences(false, catalog);
  const saved = { ...initial, version: 3, targetIds: [95, 333, 235, 412, 305] };
  expect(selectedTargets(saved, targets).map((t) => t.id)).toEqual([95, 235]);
  const shown = { ...saved, showMissionVariants: true };
  expect(targetCandidates(shown, targets, 'typhoon (shadow)').map((t) => t.id)).toEqual([333]);
  expect(targetCandidates(shown, targets, 'ventus').map((t) => t.id)).toEqual([305]);
  expect(selectedTargets(shown, targets).map((t) => t.id)).toEqual([95, 333, 305, 235]);
});
