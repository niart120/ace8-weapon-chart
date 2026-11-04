export const missions = [
  { id: '1', name: 'PROLOGUE' },
  ...Array.from({ length: 23 }, (_, i) => ({ id: String(i + 2), name: `M${i + 1}` })),
  { id: '25day1', name: 'M24' },
  { id: '25day2', name: 'M25' },
  ...Array.from({ length: 5 }, (_, i) => ({ id: String(i + 26), name: `M${i + 26}` })),
] as const;

export const targetSubcategories = {
  AIRCRAFT: [
    'FIGHTER',
    'MULTIROLE',
    'ATTACKER',
    'ELECTRONIC WARFARE',
    'BOMBER',
    'SUPPORT',
    'ROTORCRAFT',
    'UAV',
    'OTHER',
    'PARTS',
  ],
  GROUND: [
    'AIR DEFENSE',
    'ARMOR',
    'ARTILLERY',
    'FORTIFICATION',
    'COMMAND & RADAR',
    'SUPPORT',
    'LAND WARSHIP',
    'OTHER',
    'PARTS',
  ],
  SHIP: ['WARSHIP', 'SMALL CRAFT', 'TRANSPORT', 'OTHER', 'PARTS'],
  STRUCTURE: ['MILITARY', 'INDUSTRIAL', 'OTHER', 'PARTS'],
  OTHER: ['MISSILE', 'UAV', 'OTHER', 'PARTS'],
  EXCLUDED: ['OTHER', 'PARTS'],
} as const;
