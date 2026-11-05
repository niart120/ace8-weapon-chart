import { isRecord } from '../domain/validate';
import { roles } from '../domain/types';
import { isSelectableMission } from '../domain/catalog';
import type { DamageType, Role } from '../domain/types';
import type { Catalog, Preferences } from '../state/preferences';
import { targetCandidates } from '../state/preferences';
export const storageKey = 'ace8-weapon-chart.preferences';
interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
const numbers = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((v) => Number.isSafeInteger(v) && v > 0);
function isRole(value: unknown): value is Role {
  return roles.some((role) => role === value);
}
function isDamageType(value: unknown): value is DamageType {
  return value === 'DIRECT' || value === 'BLAST' || value === 'DIRECT+BLAST';
}
function isMission(value: unknown, catalog: Catalog): value is number | null {
  return (
    value === null ||
    (typeof value === 'number' &&
      isSelectableMission(value) &&
      catalog.targets.some(
        (target) => target.category !== 'EXCLUDED' && target.missionIds.includes(value)
      ))
  );
}
export function restorePreferences(
  value: unknown,
  initial: Preferences,
  catalog: Catalog,
  partKeys: readonly string[]
): Preferences {
  if (
    !isRecord(value) ||
    value.version !== 5 ||
    !isMission(value.missionId, catalog) ||
    !isRecord(value.conditions) ||
    !numbers(value.weaponIds) ||
    !numbers(value.targetIds) ||
    !isRole(value.conditions.role) ||
    !isDamageType(value.conditions.damageType) ||
    !Array.isArray(value.conditions.parts) ||
    !value.conditions.parts.every((p) => typeof p === 'string') ||
    typeof value.showParts !== 'boolean' ||
    typeof value.showMissionVariants !== 'boolean'
  )
    return initial;
  const weaponIds = new Set(
    catalog.weapons.filter((w) => w.category !== 'UNUSED').map((w) => w.id)
  );
  const targetIds = new Set(
    targetCandidates(
      {
        ...initial,
        missionId: value.missionId,
        showParts: value.showParts,
        showMissionVariants: value.showMissionVariants,
      },
      catalog.targets
    ).map((target) => target.id)
  );
  return {
    missionId: value.missionId,
    conditions: {
      role: value.conditions.role,
      damageType: value.conditions.damageType,
      parts: [...new Set(value.conditions.parts.filter((key: string) => partKeys.includes(key)))],
    },
    weaponIds: [...new Set(value.weaponIds.filter((id) => weaponIds.has(id)))],
    targetIds: [...new Set(value.targetIds.filter((id) => targetIds.has(id)))],
    showParts: value.showParts,
    showMissionVariants: value.showMissionVariants,
  };
}
export function readPreferences(
  storage: StorageLike | null,
  initial: Preferences,
  catalog: Catalog,
  partKeys: readonly string[]
): Preferences {
  try {
    const value = storage?.getItem(storageKey);
    return value ? restorePreferences(JSON.parse(value), initial, catalog, partKeys) : initial;
  } catch {
    return initial;
  }
}
export function writePreferences(storage: StorageLike | null, state: Preferences): void {
  try {
    storage?.setItem(
      storageKey,
      JSON.stringify({
        version: 5,
        missionId: state.missionId,
        conditions: state.conditions,
        weaponIds: state.weaponIds,
        targetIds: state.targetIds,
        showParts: state.showParts,
        showMissionVariants: state.showMissionVariants,
      })
    );
  } catch {
    /* Current interactions remain available when storage is denied or full. */
  }
}
