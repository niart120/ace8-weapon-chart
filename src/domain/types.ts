export const roles = ['FIGHTER', 'ATTACKER', 'MULTIROLE', 'ELECTRONIC WARFARE'] as const;
export type Role = (typeof roles)[number];
export type DamageType = 'DIRECT' | 'BLAST' | 'DIRECT+BLAST';
export const weaponCategories = [
  'MSL',
  'MSL.AIR',
  'MSL.GND',
  'BOMB',
  'GUN',
  'RKT',
  'OTHER',
] as const;
export const targetCategories = ['AIRCRAFT', 'GROUND', 'SHIP', 'STRUCTURE', 'OTHER'] as const;
export type WeaponCategory = (typeof weaponCategories)[number] | 'UNUSED';
export type TargetCategory = (typeof targetCategories)[number] | 'EXCLUDED';
export type RoleGroup = 'air' | 'ground' | 'ship';
export interface DamageComponent {
  readonly baseDamage: number | null;
  readonly partMultipliers: Readonly<Record<string, number>>;
  readonly targetMultiplierKey: string;
}
export interface Weapon {
  readonly id: number;
  readonly name: string;
  readonly category: WeaponCategory;
  readonly order: number;
  readonly primary: DamageComponent;
  readonly additional?: DamageComponent;
  readonly calculation: 'hits' | 'tls' | 'unresolved';
  readonly continuous?: {
    readonly damage: number;
    readonly startDelay: number;
    readonly interval: number;
  };
}
export interface Target {
  readonly id: number;
  readonly name: string;
  readonly category: TargetCategory;
  readonly order: number;
  readonly partOf: number | null;
  readonly missionVariant: { readonly missionId: string } | null;
  readonly hp: number;
  readonly damageMultipliers: Readonly<Record<string, number | null>>;
  readonly isAir: boolean | null;
  readonly roleGroup: RoleGroup | null;
  readonly standardDamage: boolean;
}
export interface Part {
  readonly key: string;
  readonly name: string;
  readonly condition: 'all' | 'air' | 'surface';
  readonly stage: 'base' | 'afterRole';
}
export interface Modifiers {
  readonly roles: Readonly<Record<Role, Readonly<Record<RoleGroup, number>>>>;
  readonly parts: readonly Part[];
}
export interface Conditions {
  readonly role: Role;
  readonly parts: readonly string[];
  readonly damageType: DamageType;
}
export type DefeatRequirementResult =
  | { readonly kind: 'value'; readonly value: number }
  | { readonly kind: 'zeroDamage' }
  | { readonly kind: 'unknown' };
