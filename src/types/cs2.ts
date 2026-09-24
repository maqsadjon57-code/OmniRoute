// Counter-Strike 2 Core Types & Interfaces

export type Team = 'CT' | 'T';

export type WeaponCategory = 'gear' | 'pistols' | 'mid-tier' | 'rifles' | 'grenades';

export type WeaponType = 
  | 'glock' 
  | 'usp' 
  | 'p250' 
  | 'dual-berettas' 
  | 'tec9' 
  | 'deagle'
  | 'nova' 
  | 'xm1014' 
  | 'mp5sd' 
  | 'p90' 
  | 'mac10' 
  | 'mp9'
  | 'galil' 
  | 'famas' 
  | 'ak47' 
  | 'm4a4' 
  | 'm4a1s' 
  | 'ssg08' 
  | 'sg553' 
  | 'aug' 
  | 'awp'
  | 'knife-karambit' 
  | 'knife-butterfly' 
  | 'knife-bayonet' 
  | 'knife-flip'
  | 'flashbang' 
  | 'smokegrenade' 
  | 'hegrenade' 
  | 'molotov' 
  | 'decoy'
  | 'armor' 
  | 'helmet' 
  | 'zeus' 
  | 'defuser';

export type SkinRarity = 'consumer' | 'industrial' | 'milspec' | 'restricted' | 'classified' | 'covert' | 'contraband' | 'extraordinary';

export interface SkinItem {
  id: string;
  weaponType: WeaponType;
  name: string;
  weaponName: string;
  rarity: SkinRarity;
  rarityColor: string;
  priceUSD: number;
  patternSeed: number;
  floatValue: number;
  wearCategory: 'Factory New' | 'Minimal Wear' | 'Field-Tested' | 'Well-Worn' | 'Battle-Scarred';
  description: string;
  flavorText: string;
  finishType: 'laser' | 'custom' | 'patina' | 'anodized' | 'hydrographic';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  metallic: number;
  roughness: number;
  patternType?: 'dragon' | 'lotus' | 'empress' | 'printstream' | 'redline' | 'ruby' | 'sapphire' | 'asiimov' | 'doppler';
  statTrak?: boolean;
  inspectAngles?: [number, number, number];
}

export interface BuyMenuItem {
  id: string;
  column: number; // 1 to 5
  slot: number; // 1 to 5
  weaponType: WeaponType;
  nameRu: string;
  nameEn: string;
  category: WeaponCategory;
  price: number;
  keyNumber: number;
  team: 'BOTH' | 'T' | 'CT';
  icon: string;
  damage: number;
  fireRate: number;
  recoil: number;
  magazineSize: number;
  reserveAmmo: number;
  isEquipped?: boolean;
  canAfford?: boolean;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  armor: number;
  hasHelmet: boolean;
  money: number;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  mvps: number;
  ping: number;
  hasDefuseKit: boolean;
  hasBomb: boolean;
  currentWeapon: WeaponType;
  equippedWeapons: {
    primary?: WeaponType;
    secondary: WeaponType;
    knife: WeaponType;
    grenades: WeaponType[];
    zeus?: boolean;
  };
  weaponAmmo: Record<WeaponType, { current: number; max: number; reserve: number }>;
}

export interface BotEntity {
  id: string;
  name: string; // e.g., 'БОТ Колин', 'БОТ Муха'
  team: Team;
  health: number;
  maxHealth: number;
  weapon: WeaponType;
  position: [number, number, number];
  rotation: number;
  targetPosition: [number, number, number];
  isAlive: boolean;
  state: 'idle' | 'patrol' | 'alert' | 'aiming' | 'shooting' | 'dead';
  aimTarget?: [number, number, number];
  lastShotTime: number;
  patrolWaypointIndex: number;
  color: string;
}

export interface KillfeedEvent {
  id: string;
  killer: string;
  killerTeam: Team;
  victim: string;
  victimTeam: Team;
  weapon: WeaponType;
  weaponName: string;
  isHeadshot: boolean;
  isWallbang: boolean;
  isNoScope: boolean;
  isThroughSmoke: boolean;
  timestamp: number;
}

export interface MapCardInfo {
  id: string;
  name: string;
  location: string;
  badge: string;
  description: string;
  previewUrl: string;
  isCompetitive: boolean;
  activeDuty: boolean;
  callouts: string[];
}

export interface PracticeSettings {
  openParty: boolean;
  grenadeCamera: boolean;
  infiniteAmmo: boolean;
  infiniteWarmup: boolean;
  botDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
  botCount: number;
  enableRadar: boolean;
}

export type GameMode = 'premier' | 'competitive' | 'wingman' | 'casual' | 'deathmatch' | 'practice';

export interface AccoladeCard {
  id: string;
  playerName: string;
  avatarUrl: string;
  title: string; // "The Most Valuable MVP", "The Rearguard", etc.
  subtitle: string;
  kills: number;
  deaths: number;
  assists: number;
  adr: number;
  hsPercentage: number;
  mvpStars: number;
  team: Team;
}
