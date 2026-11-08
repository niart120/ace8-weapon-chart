import type { Conditions, Target, Weapon } from '../domain/types';
import { groupTargets, type TargetGroup } from './target-groups';
export interface Catalog {
  readonly weapons: readonly Weapon[];
  readonly targets: readonly Target[];
}
export interface Preferences {
  readonly missionId: number | null;
  readonly conditions: Conditions;
  readonly weaponIds: readonly number[];
  readonly targetIds: readonly number[];
  readonly showMissionVariants: boolean;
  readonly showParts: boolean;
}
export function initialPreferences(mobile: boolean, catalog: Catalog): Preferences {
  return {
    missionId: null,
    conditions: { role: 'FIGHTER', parts: [], damageType: 'DIRECT' },
    weaponIds: catalog.weapons
      .filter((w) => w.category !== 'UNUSED' && (!mobile || w.id === 1))
      .map((w) => w.id),
    targetIds: catalog.targets
      .filter(
        (t) => t.category !== 'EXCLUDED' && !t.partOf && (!t.missionVariant || t.defaultVariant)
      )
      .map((t) => t.id),
    showMissionVariants: false,
    showParts: false,
  };
}

export function toggleId(ids: readonly number[], id: number): readonly number[] {
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}
export function groupSelection(
  ids: readonly number[],
  groupIds: readonly number[]
): 'all' | 'some' | 'none' {
  const count = groupIds.filter((id) => ids.includes(id)).length;
  return count === 0 ? 'none' : count === groupIds.length ? 'all' : 'some';
}
export function toggleGroup(
  ids: readonly number[],
  groupIds: readonly number[]
): readonly number[] {
  const group = new Set(groupIds);
  return groupSelection(ids, groupIds) === 'all'
    ? ids.filter((id) => !group.has(id))
    : [...new Set([...ids, ...groupIds])];
}
export function targetCandidates(
  state: Preferences,
  targets: readonly Target[],
  query = ''
): Target[] {
  const search = query.trim().toLowerCase();
  return targets
    .filter(
      (t) =>
        t.category !== 'EXCLUDED' &&
        (!t.partOf || state.showParts) &&
        (!t.missionVariant || t.defaultVariant || state.showMissionVariants) &&
        (state.missionId === null || t.missionIds.includes(state.missionId)) &&
        [t.name, ...(t.searchNames ?? [])].some((name) => name.toLowerCase().includes(search))
    )
    .toSorted(compareTargets);
}
export function weaponCandidates(weapons: readonly Weapon[], query = ''): Weapon[] {
  const search = query.trim().toLowerCase();
  return weapons
    .filter((w) => w.category !== 'UNUSED' && w.name.toLowerCase().includes(search))
    .toSorted((a, b) => a.order - b.order);
}
export function selectedTargets(state: Preferences, targets: readonly Target[]): TargetGroup[] {
  const selected = new Set(state.targetIds);
  return groupTargets(targetCandidates(state, targets).filter((t) => selected.has(t.id))).toSorted(
    compareTargets
  );
}
export function selectMission(
  state: Preferences,
  missionId: number | null,
  targets: readonly Target[]
): Preferences {
  if (state.missionId === missionId) return state;
  const next = { ...state, missionId };
  return { ...next, targetIds: targetCandidates(next, targets).map((target) => target.id) };
}
export function changeTargetIncludes(
  state: Preferences,
  includes: Pick<Preferences, 'showParts' | 'showMissionVariants'>,
  targets: readonly Target[]
): Preferences {
  const before = new Set(targetCandidates(state, targets).map((target) => target.id));
  const selected = new Set(state.targetIds);
  const next = { ...state, ...includes };
  return {
    ...next,
    targetIds: targetCandidates(next, targets)
      .filter((target) => !before.has(target.id) || selected.has(target.id))
      .map((target) => target.id),
  };
}
export function selectedWeapons(state: Preferences, weapons: readonly Weapon[]): Weapon[] {
  const selected = new Set(state.weaponIds);
  return weaponCandidates(weapons).filter((w) => selected.has(w.id));
}
const targetNameOrder = new Intl.Collator('en', { numeric: true });
export function compareTargetNames(a: string, b: string): number {
  return targetNameOrder.compare(a, b);
}
export function compareTargets(a: Target, b: Target): number {
  return compareTargetHealth(a, b) || compareTargetNames(a.name, b.name) || a.id - b.id;
}
export function compareTargetHealth(a: Target, b: Target, direction = 1): number {
  if (a.hp === null) return b.hp === null ? 0 : 1;
  if (b.hp === null) return -1;
  return (a.hp - b.hp) * direction;
}
