export const missions = [
  { id: 0, name: 'PROLOGUE' },
  ...Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `M${i + 1}` })),
] as const;

export const visibleMissions = missions.filter((mission) => mission.id !== 0);
export function isSelectableMission(id: number): boolean {
  return id !== 14 && visibleMissions.some((mission) => mission.id === id);
}

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
