import type { Conditions, Target, Weapon } from '../domain/types';
export interface Catalog {
  readonly weapons: readonly Weapon[];
  readonly targets: readonly Target[];
}
export interface Preferences {
  readonly conditions: Conditions;
  readonly weaponIds: readonly number[];
  readonly targetIds: readonly number[];
  readonly showMissionVariants: boolean;
  readonly showParts: boolean;
}
export function initialPreferences(mobile: boolean, catalog: Catalog): Preferences {
  return {
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
    .toSorted((a, b) => a.order - b.order);
}
export function weaponCandidates(weapons: readonly Weapon[], query = ''): Weapon[] {
  const search = query.trim().toLowerCase();
  return weapons
    .filter((w) => w.category !== 'UNUSED' && w.name.toLowerCase().includes(search))
    .toSorted((a, b) => a.order - b.order);
}
export function selectedTargets(state: Preferences, targets: readonly Target[]): Target[] {
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
        targetIds: initial.targetIds,
        showMissionVariants: false,
        showParts: false,
      };
    case 'all':
      return initial;
  }
}
