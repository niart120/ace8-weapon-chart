import type { Target } from '../../src/domain/types';

export interface TargetPresentation {
  readonly excludedIds: readonly number[];
  readonly groups: readonly {
    readonly id: number;
    readonly name: string;
    readonly targetIds: readonly number[];
  }[];
  readonly names: Readonly<Record<string, string>>;
  readonly defaultVariantIds: readonly number[];
  readonly parents: Readonly<Record<string, number>>;
}

export function applyTargetPresentation(
  targets: readonly Target[],
  policy: TargetPresentation
): Target[] {
  const byId = new Map(targets.map((t) => [t.id, t]));
  const requireTarget = (id: number) => {
    const target = byId.get(id);
    if (!target) throw new Error(`表示規則の参照先なし: ${id}`);
    return target;
  };
  const excluded = new Set(policy.excludedIds);
  const defaults = new Set(policy.defaultVariantIds);
  const names = new Map(Object.entries(policy.names).map(([id, name]) => [Number(id), name]));
  const comparisons = new Map<number, number>();
  for (const id of [...excluded, ...defaults, ...names.keys()]) requireTarget(id);
  for (const [id, parent] of Object.entries(policy.parents)) {
    requireTarget(Number(id));
    requireTarget(parent);
  }
  for (const group of policy.groups) {
    if (group.targetIds.length < 2 || !group.targetIds.includes(group.id))
      throw new Error(`比較ID不備: ${group.id}`);
    for (const id of group.targetIds) {
      const target = requireTarget(id);
      if (comparisons.has(id) || excluded.has(id) || target.category === 'EXCLUDED')
        throw new Error(`比較対象の重複・除外: ${id}`);
      comparisons.set(id, group.id);
      names.set(id, group.name);
    }
  }
  return targets.map((target) => {
    const name = names.get(target.id) ?? target.name;
    const partOf = policy.parents[String(target.id)] ?? target.partOf;
    const parent = partOf === null ? undefined : requireTarget(partOf);
    return {
      ...target,
      name,
      partOf,
      ...(excluded.has(target.id) ? { category: 'EXCLUDED' as const, subcategory: 'OTHER' } : {}),
      ...(comparisons.has(target.id) ? { comparisonId: comparisons.get(target.id) } : {}),
      ...(defaults.has(target.id) ? { defaultVariant: true } : {}),
      searchNames: [
        ...new Set([
          target.name,
          ...(parent ? [parent.name, names.get(parent.id) ?? parent.name] : []),
        ]),
      ],
    };
  });
}
