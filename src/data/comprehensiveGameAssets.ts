// Counter-Strike 2 Weapon Mechanics & Ballistics Specifications

export interface WeaponBallistics {
  id: string;
  name: string;
  type: string;
  cost: number;
  origin: string;
  caliber: string;
  magazineCapacity: number;
  reserveAmmo: number;
  fireRateRPM: number;
  reloadTimeEmpty: number; // in seconds
  movementSpeed: number; // in u/s (250 is base knife)
  killAward: number;
  damage: number;
  armorPenetration: number; // percentage
  penetrationPower: number; // wallbang capacity (1 = low, 2 = medium, 3 = high)
  rangeModifier: number; // damage drop per 500 units
  inaccuracyStand: number;
  inaccuracyCrouch: number;
  recoilAngleVariance: number;
  recoilMagnitude: number;
  sprayPattern: [number, number][]; // (x, y) offset for bullets 1 to 30
}

export const CS2_BALLISTICS_DATABASE: Record<string, WeaponBallistics> = {
  'ak47': {
    id: 'ak47',
    name: 'AK-47',
    type: 'Assault Rifle',
    cost: 2700,
    origin: 'Soviet Union',
    caliber: '7.62x39mm',
    magazineCapacity: 30,
    reserveAmmo: 90,
    fireRateRPM: 600,
    reloadTimeEmpty: 2.43,
    movementSpeed: 215,
    killAward: 300,
    damage: 36,
    armorPenetration: 77.5,
    penetrationPower: 2,
    rangeModifier: 0.98,
    inaccuracyStand: 7.01,
    inaccuracyCrouch: 5.41,
    recoilAngleVariance: 0.2,
    recoilMagnitude: 30,
    sprayPattern: [
      [0, 0], [0, 2], [-1, 5], [-1, 8], [-1, 12],
      [-2, 16], [-3, 19], [-4, 21], [-3, 23], [-1, 24],
      [2, 24], [5, 24], [7, 24], [8, 23], [8, 22],
      [7, 21], [5, 21], [2, 21], [-2, 21], [-5, 21],
      [-7, 21], [-8, 20], [-8, 19], [-6, 18], [-3, 18],
      [1, 18], [4, 18], [6, 18], [7, 18], [7, 17]
    ]
  },
  'm4a4': {
    id: 'm4a4',
    name: 'M4A4',
    type: 'Assault Rifle',
    cost: 3100,
    origin: 'United States',
    caliber: '5.56x45mm NATO',
    magazineCapacity: 30,
    reserveAmmo: 90,
    fireRateRPM: 666,
    reloadTimeEmpty: 3.1,
    movementSpeed: 225,
    killAward: 300,
    damage: 33,
    armorPenetration: 70.0,
    penetrationPower: 2,
    rangeModifier: 0.97,
    inaccuracyStand: 5.5,
    inaccuracyCrouch: 4.2,
    recoilAngleVariance: 0.15,
    recoilMagnitude: 23,
    sprayPattern: [
      [0, 0], [0, 1.8], [0, 4.2], [0, 6.8], [-1, 9.5],
      [-1.5, 12.2], [-2, 14.5], [-2.5, 16.0], [-2, 17.0], [-1, 17.5],
      [1, 17.5], [3, 17.5], [5, 17.5], [6, 17.0], [6.5, 16.5],
      [6, 15.8], [4.5, 15.5], [2, 15.5], [-1, 15.5], [-3.5, 15.5],
      [-5, 15.5], [-6, 15.0], [-6, 14.5], [-4.5, 14.0], [-2, 14.0],
      [1, 14.0], [3.5, 14.0], [5, 14.0], [5.5, 13.8], [5, 13.5]
    ]
  },
  'awp': {
    id: 'awp',
    name: 'AWP (Arctic Warfare Police)',
    type: 'Sniper Rifle',
    cost: 4750,
    origin: 'United Kingdom',
    caliber: '.338 Lapua Magnum',
    magazineCapacity: 5,
    reserveAmmo: 30,
    fireRateRPM: 41,
    reloadTimeEmpty: 3.67,
    movementSpeed: 200,
    killAward: 100,
    damage: 115,
    armorPenetration: 97.5,
    penetrationPower: 3,
    rangeModifier: 0.99,
    inaccuracyStand: 1.5,
    inaccuracyCrouch: 1.0,
    recoilAngleVariance: 0.05,
    recoilMagnitude: 80,
    sprayPattern: [[0, 0], [0, 15], [0, 30], [0, 45], [0, 60]]
  },
  'deagle': {
    id: 'deagle',
    name: 'Desert Eagle',
    type: 'Pistol',
    cost: 700,
    origin: 'Israel / USA',
    caliber: '.50 Action Express',
    magazineCapacity: 7,
    reserveAmmo: 35,
    fireRateRPM: 267,
    reloadTimeEmpty: 2.2,
    movementSpeed: 230,
    killAward: 300,
    damage: 53,
    armorPenetration: 93.2,
    penetrationPower: 2,
    rangeModifier: 0.85,
    inaccuracyStand: 6.2,
    inaccuracyCrouch: 4.8,
    recoilAngleVariance: 0.35,
    recoilMagnitude: 55,
    sprayPattern: [[0, 0], [0, 8], [0, 18], [0, 30], [1, 42], [2, 54], [3, 65]]
  }
};
