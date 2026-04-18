// Re-export backend types for frontend use
export type {
  GameState,
  PlayerPublic,
  LootPublic,
  SafeZonePublic,
  KillFeedEntry,
  LeaderboardEntryPublic,
  MatchResult,
  SessionId,
  PlayerId,
  LootId,
} from "../backend";

export {
  GamePhase,
  WeaponType,
  ArmorTier,
  LootType,
} from "../backend";

// Frontend-specific types
export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ownerId: bigint;
  createdAt: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
  mouseX: number;
  mouseY: number;
  interact: boolean;
  heal: boolean;
}

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export type WeaponStats = {
  damage: number;
  range: number;
  fireRate: number;
  bulletSpeed: number;
  ammoCapacity: number;
  label: string;
  color: string;
};

export const WEAPON_STATS: Record<string, WeaponStats> = {
  Pistol: {
    damage: 25,
    range: 300,
    fireRate: 400,
    bulletSpeed: 8,
    ammoCapacity: 15,
    label: "USP-S",
    color: "#b0b8c0",
  },
  Rifle: {
    damage: 40,
    range: 500,
    fireRate: 200,
    bulletSpeed: 12,
    ammoCapacity: 30,
    label: "M416",
    color: "#e8c94a",
  },
  Shotgun: {
    damage: 80,
    range: 150,
    fireRate: 800,
    bulletSpeed: 6,
    ammoCapacity: 8,
    label: "S12K",
    color: "#c87c3a",
  },
  Sniper: {
    damage: 95,
    range: 900,
    fireRate: 1500,
    bulletSpeed: 20,
    ammoCapacity: 5,
    label: "AWM",
    color: "#7ebce6",
  },
};

export const MAP_SIZE = 2000;
export const PLAYER_RADIUS = 14;
export const BULLET_RADIUS = 4;
export const LOOT_RADIUS = 12;
export const SAFE_ZONE_DAMAGE_COLOR = "rgba(80, 0, 180, 0.18)";
