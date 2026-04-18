import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SafeZonePublic {
    centerX: number;
    centerY: number;
    damagePerTick: bigint;
    radius: number;
    nextShrinkTime: bigint;
    phase: bigint;
}
export interface LootPublic {
    x: number;
    y: number;
    id: LootId;
    armorTier: ArmorTier;
    claimed: boolean;
    weaponType: WeaponType;
    lootType: LootType;
    amount: bigint;
}
export type SessionId = bigint;
export type LootId = bigint;
export interface GameState {
    matchTime: bigint;
    winner?: string;
    loots: Array<LootPublic>;
    killFeed: Array<KillFeedEntry>;
    players: Array<PlayerPublic>;
    safeZone: SafeZonePublic;
    sessionId: SessionId;
    phase: GamePhase;
}
export type PlayerId = bigint;
export interface MatchResult {
    survivalTime: bigint;
    placement: bigint;
    matchId: SessionId;
    playerName: string;
    kills: bigint;
}
export interface LeaderboardEntryPublic {
    gamesPlayed: bigint;
    wins: bigint;
    playerName: string;
    kills: bigint;
}
export interface KillFeedEntry {
    victimName: string;
    victimId: PlayerId;
    killerId: PlayerId;
    timestamp: bigint;
    killerName: string;
    weapon: WeaponType;
}
export interface PlayerPublic {
    x: number;
    y: number;
    id: PlayerId;
    alive: boolean;
    angle: number;
    armor: bigint;
    ammo: bigint;
    name: string;
    isBot: boolean;
    kills: bigint;
    weapon: WeaponType;
    health: bigint;
}
export enum ArmorTier {
    Light = "Light",
    Medium = "Medium",
    Heavy = "Heavy"
}
export enum GamePhase {
    Lobby = "Lobby",
    GameOver = "GameOver",
    InGame = "InGame"
}
export enum LootType {
    Weapon = "Weapon",
    Health = "Health",
    Armor = "Armor"
}
export enum WeaponType {
    Shotgun = "Shotgun",
    Rifle = "Rifle",
    Pistol = "Pistol",
    Sniper = "Sniper"
}
export interface backendInterface {
    createSession(playerName: string): Promise<SessionId>;
    getGameState(sessionId: SessionId): Promise<{
        __kind__: "ok";
        ok: GameState;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getLeaderboard(): Promise<Array<LeaderboardEntryPublic>>;
    getMatchHistory(sessionId: SessionId): Promise<Array<MatchResult>>;
    joinSession(sessionId: SessionId, playerName: string): Promise<{
        __kind__: "ok";
        ok: PlayerId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    movePlayer(sessionId: SessionId, playerId: PlayerId, x: number, y: number, angle: number): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    pickupLoot(sessionId: SessionId, playerId: PlayerId, lootId: LootId): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    shootBullet(sessionId: SessionId, playerId: PlayerId, targetX: number, targetY: number): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    startGame(sessionId: SessionId): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    tickGame(sessionId: SessionId): Promise<{
        __kind__: "ok";
        ok: GameState;
    } | {
        __kind__: "err";
        err: string;
    }>;
    useHealthItem(sessionId: SessionId, playerId: PlayerId): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
