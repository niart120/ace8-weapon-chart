import type { GenerationInput } from './generate';
export const input: GenerationInput = {
  weapons: [
    {
      id: 1,
      name: 'MSL',
      category: 'MSL',
      order: 0,
      calculation: 'hits',
      primary: { baseDamage: 40, partMultipliers: {}, targetMultiplierKey: 'missile' },
    },
  ],
  targets: [
    {
      id: 1,
      name: 'TANK',
      category: 'GROUND',
      subcategory: 'ARMOR',
      missionIds: [5],
      order: 0,
      partOf: null,
      missionVariant: null,
      sourceRefs: [{ table: 'mission5', row: 'tank' }],
    },
  ],
  sources: {
    'mission5/tank': {
      hp: 55,
      damageMultipliers: { missile: 1 },
      isAir: false,
      roleGroup: 'ground',
      standardDamage: true,
    },
  },
  modifiers: {
    roles: {
      FIGHTER: { air: 1.25, ground: 0.875, none: 1, ship: 0.875 },
      ATTACKER: { air: 0.875, ground: 1.5, none: 1, ship: 1 },
      MULTIROLE: { air: 1, ground: 1, none: 1, ship: 1 },
      'ELECTRONIC WARFARE': { air: 1, ground: 1, none: 1, ship: 1 },
    },
    parts: [],
  },
};
