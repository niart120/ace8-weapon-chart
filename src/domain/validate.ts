import { roles, targetCategories, weaponCategories } from './types.ts';
import { missions, targetSubcategories } from './catalog.ts';
import type { Modifiers, Target, Weapon } from './types.ts';
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function requireValue(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}
const finite = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const nullable = (v: unknown) => v === null || finite(v);
export function validateMasters(
  value: unknown
): asserts value is { weapons: Weapon[]; targets: Target[]; modifiers: Modifiers } {
  requireValue(isRecord(value), 'マスタ形式');
  const { weapons, targets, modifiers } = value;
  requireValue(
    Array.isArray(weapons) && Array.isArray(targets) && isRecord(modifiers),
    '3マスタが必要'
  );
  const ids = (rows: unknown[], label: string) => {
    const seen = new Set<number>();
    for (const row of rows) {
      requireValue(isRecord(row), `${label}: 行形式`);
      requireValue(
        typeof row.id === 'number' &&
          Number.isSafeInteger(row.id) &&
          row.id > 0 &&
          !seen.has(row.id),
        `${label}: ID不備・重複`
      );
      seen.add(row.id);
      requireValue(
        typeof row.name === 'string' && row.name.length && finite(row.order),
        `${label}: 表示情報欠落`
      );
    }
    return seen;
  };
  ids(weapons, '兵装');
  const targetIds = ids(targets, '目標');
  const keys = new Set<string>();
  requireValue(Array.isArray(modifiers.parts) && isRecord(modifiers.roles), '共通補正の欠落');
  for (const part of modifiers.parts) {
    requireValue(
      isRecord(part) &&
        typeof part.key === 'string' &&
        typeof part.name === 'string' &&
        typeof part.published === 'boolean' &&
        !keys.has(part.key),
      'パーツID不備'
    );
    requireValue(
      ['all', 'air', 'surface'].includes(String(part.condition)) &&
        ['base', 'afterRole'].includes(String(part.stage)),
      'パーツ条件不備'
    );
    keys.add(part.key);
  }
  for (const role of roles) {
    const row = modifiers.roles[role];
    requireValue(
      isRecord(row) && ['air', 'ground', 'ship', 'none'].every((key) => finite(row[key])),
      `ROLE欠落: ${role}`
    );
  }
  const multiplierKeys = new Set<string>();
  for (const weapon of weapons) {
    requireValue(
      isRecord(weapon) &&
        [...weaponCategories, 'UNUSED'].includes(String(weapon.category)) &&
        ['hits', 'tls', 'unresolved'].includes(String(weapon.calculation)),
      '兵装分類・計算方式不備'
    );
    for (const component of [
      weapon.primary,
      ...('additional' in weapon ? [weapon.additional] : []),
    ]) {
      requireValue(
        isRecord(component) &&
          nullable(component.baseDamage) &&
          isRecord(component.partMultipliers) &&
          typeof component.targetMultiplierKey === 'string',
        '成分の値欠落'
      );
      for (const [key, rate] of Object.entries(component.partMultipliers))
        requireValue(keys.has(key) && finite(rate), `パーツ参照不備: ${key}`);
      requireValue(
        component.antiShipMultiplier === undefined || finite(component.antiShipMultiplier),
        '艦船倍率不備'
      );
      multiplierKeys.add(component.targetMultiplierKey);
    }
  }
  const comparisons = new Map<number, Record<string, unknown>>();
  for (const target of targets) {
    requireValue(
      isRecord(target) && [...targetCategories, 'EXCLUDED'].includes(String(target.category)),
      '目標分類不備'
    );
    requireValue(
      target.hp === null
        ? target.standardDamage === false
        : finite(target.hp) && Number.isSafeInteger(target.hp),
      'HP不備'
    );
    requireValue(
      Object.entries(targetSubcategories).some(
        ([category, groups]) =>
          category === target.category && groups.some((group) => group === target.subcategory)
      ),
      '細分類不備'
    );
    requireValue(
      Array.isArray(target.missionIds) &&
        target.missionIds.every((id) => missions.some((mission) => mission.id === id)) &&
        new Set(target.missionIds).size === target.missionIds.length,
      '出現任務不備'
    );
    requireValue(
      target.partOf === null ||
        (typeof target.partOf === 'number' &&
          target.partOf !== target.id &&
          targetIds.has(target.partOf)),
      '本体参照不備'
    );
    const variant = target.missionVariant;
    requireValue(
      variant === null ||
        (isRecord(variant) && missions.some((mission) => mission.id === variant.missionId)),
      '任務属性欠落'
    );
    requireValue(target.isAir === null || typeof target.isAir === 'boolean', 'isAir欠落');
    requireValue(
      target.roleGroup === null ||
        ['air', 'ground', 'ship', 'none'].includes(String(target.roleGroup)),
      'roleGroup欠落'
    );
    requireValue(
      typeof target.standardDamage === 'boolean' && isRecord(target.damageMultipliers),
      '計算属性欠落'
    );
    for (const key of multiplierKeys)
      requireValue(nullable(target.damageMultipliers[key]), `耐性値欠落: ${target.id}/${key}`);
    requireValue(
      target.searchNames === undefined ||
        (Array.isArray(target.searchNames) &&
          target.searchNames.every((name) => typeof name === 'string' && name.length > 0)),
      '検索名不備'
    );
    requireValue(
      target.defaultVariant === undefined ||
        (typeof target.defaultVariant === 'boolean' && target.missionVariant !== null),
      '標準任務条件不備'
    );
    if (target.comparisonId !== undefined) {
      requireValue(
        typeof target.comparisonId === 'number' &&
          targetIds.has(target.comparisonId) &&
          target.category !== 'EXCLUDED',
        '比較ID不備'
      );
      const previous = comparisons.get(target.comparisonId);
      if (previous) {
        requireValue(
          ['name', 'hp', 'isAir', 'roleGroup', 'standardDamage'].every(
            (key) => previous[key] === target[key]
          ),
          '比較条件不一致'
        );
        requireValue(isRecord(previous.damageMultipliers), '比較耐性不備');
        const rates = previous.damageMultipliers;
        requireValue(
          Object.keys(rates).length === Object.keys(target.damageMultipliers).length &&
            Object.entries(target.damageMultipliers).every(([key, rate]) => rates[key] === rate),
          '比較耐性不一致'
        );
      } else comparisons.set(target.comparisonId, target);
    }
  }
  for (const [id] of comparisons) {
    const representative = targets.find((t: unknown) => isRecord(t) && t.id === id);
    requireValue(isRecord(representative) && representative.comparisonId === id, '比較代表の不備');
  }
  // A malformed parent cycle would prevent stable grouping during regeneration.
  for (const target of targets) {
    requireValue(isRecord(target), '目標形式');
    const seen = new Set<unknown>([target.id]);
    let parent = target.partOf;
    while (parent !== null) {
      requireValue(!seen.has(parent), '本体参照の循環');
      seen.add(parent);
      const row = targets.find((item: unknown) => isRecord(item) && item.id === parent);
      requireValue(isRecord(row), '本体参照不備');
      parent = row.partOf;
    }
  }
}
