import { modifiers } from '../data/masters';
import type { Conditions, DamageComponent, Target } from './types';
const f32 = Math.fround;
export function componentDamage(
  target: Target,
  component: DamageComponent,
  conditions: Conditions
): number | null {
  const resistance = target.damageMultipliers[component.targetMultiplierKey];
  if (
    resistance === null ||
    resistance === undefined ||
    component.baseDamage === null ||
    target.roleGroup === null
  )
    return null;
  let base = f32(1);
  let afterRole = f32(1);
  for (const part of modifiers.parts) {
    if (!conditions.parts.includes(part.key)) continue;
    const rate = component.partMultipliers[part.key];
    if (rate === undefined) continue;
    if (part.condition !== 'all') {
      if (target.isAir === null) return null;
      if ((part.condition === 'air') !== target.isAir) continue;
    }
    if (part.stage === 'base') base = f32(base * f32(rate));
    else afterRole = f32(afterRole * f32(rate));
  }
  const adjusted = f32(f32(component.baseDamage) * base);
  const roleAdjusted = f32(adjusted * f32(modifiers.roles[conditions.role][target.roleGroup]));
  return f32(f32(roleAdjusted * afterRole) * f32(resistance));
}
