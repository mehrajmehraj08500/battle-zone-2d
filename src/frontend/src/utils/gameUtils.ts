import {
  LOOT_RADIUS,
  MAP_SIZE,
  PLAYER_RADIUS,
  WEAPON_STATS,
} from "../types/game";
import type {
  Bullet,
  FloatingText,
  InputState,
  LootPublic,
  Particle,
  PlayerPublic,
  WeaponType,
} from "../types/game";

// --- Math helpers ---

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function dist(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function angle(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function normVec(dx: number, dy: number): { x: number; y: number } {
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: dx / len, y: dy / len };
}

// --- Player movement (local prediction) ---

export const PLAYER_SPEED = 3.2;
export const PLAYER_DIAGONAL_FACTOR = Math.SQRT1_2;

export function computeLocalMovement(
  player: PlayerPublic,
  input: InputState,
  mapSize = MAP_SIZE,
): { x: number; y: number; angle: number } {
  let dx = 0;
  let dy = 0;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;

  const isDiag = dx !== 0 && dy !== 0;
  const speed = PLAYER_SPEED * (isDiag ? PLAYER_DIAGONAL_FACTOR : 1);

  const newX = clamp(
    player.x + dx * speed,
    PLAYER_RADIUS,
    mapSize - PLAYER_RADIUS,
  );
  const newY = clamp(
    player.y + dy * speed,
    PLAYER_RADIUS,
    mapSize - PLAYER_RADIUS,
  );

  return { x: newX, y: newY, angle: player.angle };
}

// --- Bullet creation ---

export function createBullet(
  ownerId: bigint,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  weaponType: WeaponType | string,
): Bullet {
  const stats = WEAPON_STATS[weaponType as string] ?? WEAPON_STATS.Pistol;
  const dir = normVec(targetX - startX, targetY - startY);
  return {
    id: `b_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    x: startX,
    y: startY,
    vx: dir.x * stats.bulletSpeed,
    vy: dir.y * stats.bulletSpeed,
    ownerId,
    createdAt: Date.now(),
  };
}

// --- Particle spawning ---

export function spawnMuzzleFlash(
  x: number,
  y: number,
  angle: number,
  count = 8,
): Particle[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const spread = (Math.random() - 0.5) * 0.8;
    const a = angle + spread;
    const speed = 2 + Math.random() * 3;
    return {
      id: `mf_${now}_${i}`,
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 200 + Math.random() * 100,
      maxLife: 300,
      color: Math.random() > 0.5 ? "#ffdd44" : "#ff8800",
      size: 2 + Math.random() * 2,
    };
  });
}

export function spawnHitParticles(x: number, y: number, count = 6): Particle[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 1 + Math.random() * 2;
    return {
      id: `hp_${now}_${i}`,
      x,
      y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      life: 300 + Math.random() * 200,
      maxLife: 500,
      color: "#e05050",
      size: 2 + Math.random() * 3,
    };
  });
}

export function createFloatingText(
  x: number,
  y: number,
  text: string,
  color = "#e8c94a",
): FloatingText {
  return {
    id: `ft_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    x,
    y,
    text,
    color,
    life: 1200,
    maxLife: 1200,
  };
}

// --- Loot pickup detection ---

export function getNearbyLoot(
  player: PlayerPublic,
  loots: LootPublic[],
  pickupRadius = PLAYER_RADIUS + LOOT_RADIUS + 8,
): LootPublic | null {
  let nearest: LootPublic | null = null;
  let nearestDist = Number.POSITIVE_INFINITY;
  for (const loot of loots) {
    if (loot.claimed) continue;
    const d = dist(player.x, player.y, loot.x, loot.y);
    if (d < pickupRadius && d < nearestDist) {
      nearest = loot;
      nearestDist = d;
    }
  }
  return nearest;
}

// --- Safe zone damage ---

export function isInSafeZone(
  x: number,
  y: number,
  zone: { centerX: number; centerY: number; radius: number },
): boolean {
  return dist(x, y, zone.centerX, zone.centerY) <= zone.radius;
}

// --- Time formatting ---

export function formatTime(ms: bigint): string {
  const totalSecs = Number(ms) / 1000;
  const mins = Math.floor(totalSecs / 60);
  const secs = Math.floor(totalSecs % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatMatchTime(matchTime: bigint): string {
  const secs = Number(matchTime);
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// --- Weapon display ---

export function getWeaponLabel(weapon: WeaponType | string): string {
  return WEAPON_STATS[weapon as string]?.label ?? String(weapon);
}

export function getWeaponFireMode(weapon: WeaponType | string): string {
  const modes: Record<string, string> = {
    Rifle: "AUTO",
    Pistol: "SEMI",
    Shotgun: "PUMP",
    Sniper: "BOLT",
  };
  return modes[weapon as string] ?? "SEMI";
}

// --- Armor label ---

export function getArmorLabel(tier: string): string {
  const labels: Record<string, string> = {
    Light: "Level 1",
    Medium: "Level 2",
    Heavy: "Level 3",
  };
  return labels[tier] ?? "None";
}

// --- HUD safe zone countdown ---

export function getSafeZoneCountdown(nextShrinkTime: bigint): string {
  const now = BigInt(Date.now()) * 1000000n; // nanos
  const diff = nextShrinkTime - now;
  if (diff <= 0n) return "00:00";
  const secs = Number(diff / 1000000000n);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// --- Kill feed formatting ---

export function formatKillFeed(entry: {
  killerName: string;
  victimName: string;
  weapon: WeaponType | string;
}): string {
  return `${entry.killerName} [${getWeaponLabel(entry.weapon)}] ${entry.victimName}`;
}

// --- Alive count ---

export function countAlive(players: PlayerPublic[]): number {
  return players.filter((p) => p.alive).length;
}

// --- Random ID ---

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
