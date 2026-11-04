import type { Conditions, Target, Weapon } from '../domain/types';
export interface Catalog {
  readonly weapons: readonly Weapon[];
  readonly targets: readonly Target[];
}
export interface Preferences {
  readonly targetMode: 'TYPE' | 'MISSION';
  readonly missionIds: readonly number[];
  readonly conditions: Conditions;
  readonly weaponIds: readonly number[];
  readonly targetIds: readonly number[];
  readonly showMissionVariants: boolean;
  readonly showParts: boolean;
}
export function initialPreferences(mobile: boolean, catalog: Catalog): Preferences {
  return {
    targetMode: 'TYPE',
    missionIds: [],
    conditions: { role: 'FIGHTER', parts: [], damageType: 'DIRECT' },
    weaponIds: catalog.weapons
      .filter((w) => w.category !== 'UNUSED' && (!mobile || w.id === 1))
      .map((w) => w.id),
    targetIds: catalog.targets.filter((t) => t.category !== 'EXCLUDED').map((t) => t.id),
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
        (!t.missionVariant || state.showMissionVariants) &&
        t.name.toLowerCase().includes(search)
    )
    .toSorted(compareTargets);
}
export function weaponCandidates(weapons: readonly Weapon[], query = ''): Weapon[] {
  const search = query.trim().toLowerCase();
  return weapons
    .filter((w) => w.category !== 'UNUSED' && w.name.toLowerCase().includes(search))
    .toSorted((a, b) => a.order - b.order);
}
export function selectedTargets(state: Preferences, targets: readonly Target[]): Target[] {
  if (state.targetMode === 'MISSION') {
    return targets
      .filter(
        (t) =>
          t.category !== 'EXCLUDED' &&
          (state.missionIds.length === 0 ||
            t.missionIds.some((id) => state.missionIds.includes(id)))
      )
      .toSorted(compareTargets);
  }
  const selected = new Set(state.targetIds);
  return targetCandidates(state, targets).filter((t) => selected.has(t.id));
}
export function selectedWeapons(state: Preferences, weapons: readonly Weapon[]): Weapon[] {
  const selected = new Set(state.weaponIds);
  return weaponCandidates(weapons).filter((w) => selected.has(w.id));
}
export function resetPreferences(
  state: Preferences,
  section: 'conditions' | 'weapons' | 'targets' | 'all',
  mobile: boolean,
  catalog: Catalog
): Preferences {
  const initial = initialPreferences(mobile, catalog);
  switch (section) {
    case 'conditions':
      return { ...state, conditions: initial.conditions };
    case 'weapons':
      return { ...state, weaponIds: initial.weaponIds };
    case 'targets':
      return {
        ...state,
        targetMode: 'TYPE',
        missionIds: [],
        targetIds: initial.targetIds,
        showMissionVariants: false,
        showParts: false,
      };
    case 'all':
      return initial;
  }
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
