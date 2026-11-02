import type { DamageComponent, DamageType, Weapon } from './types';
export function selectComponents(weapon: Weapon, mode: DamageType): readonly DamageComponent[] {
  if (!weapon.additional || mode === 'DIRECT') return [weapon.primary];
  return mode === 'BLAST' ? [weapon.additional] : [weapon.primary, weapon.additional];
}
