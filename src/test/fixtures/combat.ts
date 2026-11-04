import type { Target, Weapon, Modifiers } from '../../domain/types';
export const modifiers: Modifiers = {
  roles: {
    FIGHTER: { air: 1.25, ground: 0.875, none: 1, ship: 0.875 },
    ATTACKER: { air: 0.875, ground: 1.5, none: 1, ship: 1 },
    MULTIROLE: { air: 1, ground: 1, none: 1, ship: 1 },
    'ELECTRONIC WARFARE': { air: 1, ground: 1, none: 1, ship: 1 },
  },
  parts: [
    { key: 'missilePower', name: 'MSL.POW+', published: true, condition: 'all', stage: 'base' },
    {
      key: 'missileAirPower',
      name: 'MSL.AIR.POW+',
      published: true,
      condition: 'air',
      stage: 'afterRole',
    },
    {
      key: 'missileGroundPower',
      name: 'MSL.GND.POW+',
      published: true,
      condition: 'surface',
      stage: 'afterRole',
    },
    { key: 'specialAirPower', name: 'AIR.POW+', published: true, condition: 'all', stage: 'base' },
    {
      key: 'specialGroundPower',
      name: 'GND.POW+',
      published: true,
      condition: 'all',
      stage: 'base',
    },
  ],
};
export const target: Target = {
  id: 1,
  name: 'F-16C',
  category: 'AIRCRAFT',
  subcategory: 'FIGHTER',
  missionIds: [],
  order: 0,
  partOf: null,
  missionVariant: null,
  hp: 55,
  damageMultipliers: { missile: 1 },
  isAir: true,
  roleGroup: 'air',
  standardDamage: true,
};
export const missile: Weapon = {
  id: 1,
  name: 'MSL',
  category: 'MSL',
  order: 0,
  calculation: 'hits',
  primary: {
    baseDamage: 40,
    partMultipliers: {
      missilePower: 1.2000000476837158,
      missileAirPower: 1.100000023841858,
      missileGroundPower: 1.100000023841858,
    },
    targetMultiplierKey: 'missile',
  },
};
