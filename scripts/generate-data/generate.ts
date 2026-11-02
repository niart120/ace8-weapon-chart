import { validateMasters } from '../../src/domain/validate.ts';
import type { Modifiers, Target, Weapon } from '../../src/domain/types';
export interface SourceRef {
  readonly table: string;
  readonly row: string;
}
export type ResolvedTarget = Pick<
  Target,
  'hp' | 'damageMultipliers' | 'isAir' | 'roleGroup' | 'standardDamage'
>;
export type TargetDefinition = Omit<Target, keyof ResolvedTarget> & {
  readonly sourceRefs: readonly SourceRef[];
};
export interface GenerationInput {
  readonly weapons: readonly Weapon[];
  readonly targets: readonly TargetDefinition[];
  readonly sources: Readonly<Record<string, ResolvedTarget>>;
  readonly modifiers: Modifiers;
}
export interface Masters {
  readonly weapons: readonly Weapon[];
  readonly targets: readonly Target[];
  readonly modifiers: Modifiers;
}
export function generateMasters(input: GenerationInput): Masters {
  const targets = input.targets.map((definition): Target => {
    if (!definition.sourceRefs.length) throw new Error(`出典なし: ${definition.id}`);
    const resolved = definition.sourceRefs.map((ref) => {
      const result = input.sources[sourceKey(ref)];
      if (!result) throw new Error(`参照先なし: ${sourceKey(ref)}`);
      return result;
    });
    const first = resolved[0];
    if (resolved.some((item) => canonical(item) !== canonical(first))) {
      throw new Error(`統合条件が不一致: ${definition.id}`);
    }
    const { sourceRefs: _sourceRefs, ...identity } = definition;
    return { ...identity, ...first };
  });
  const masters = {
    weapons: [...input.weapons].sort(byOrder),
    targets: targets.sort(byOrder),
    modifiers: input.modifiers,
  };
  if ([...masters.weapons, ...masters.targets].some((row) => 'sourceRefs' in row))
    throw new Error('出典が配信データに混入');
  validateMasters(masters);
  return masters;
}
function byOrder(a: { order: number; id: number }, b: { order: number; id: number }) {
  return a.order - b.order || a.id - b.id;
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object')
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${canonical(v)}`)
      .join(',')}}`;
  return JSON.stringify(value);
}
export const sourceKey = (ref: SourceRef) => `${ref.table}/${ref.row}`;
