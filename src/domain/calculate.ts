import { selectComponents } from './components';
import { componentDamage } from './damage';
import { applyDamage } from './health';
import type { Conditions, DefeatRequirementResult, Target, Weapon } from './types';
export function calculateDefeatRequirement(
  target: Target,
  weapon: Weapon,
  conditions: Conditions
): DefeatRequirementResult {
  if (target.hp === null || !target.standardDamage || weapon.calculation !== 'hits')
    return { kind: 'unknown' };
  const damages = selectComponents(weapon, conditions.damageType).map((component) =>
    componentDamage(target, component, conditions)
  );
  if (damages.some((value) => value === null)) return { kind: 'unknown' };
  if (damages.every((value) => value === 0)) return { kind: 'zeroDamage' };
  let health = target.hp * 10;
  for (let hits = 1; health > 0; hits++) {
    const previous = health;
    for (const damage of damages) {
      if (damage !== null && damage > 0) health = applyDamage(health, damage);
      if (health === 0) return { kind: 'value', value: hits };
    }
    if (health >= previous) return { kind: 'unknown' };
  }
  return { kind: 'unknown' };
}
