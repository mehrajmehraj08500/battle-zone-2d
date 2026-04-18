import { create } from "zustand";
import { GamePhase } from "../backend";
import type {
  Bullet,
  FloatingText,
  GameState,
  InputState,
  Particle,
  Viewport,
} from "../types/game";

interface GameStore {
  // Session/identity
  sessionId: bigint | null;
  playerId: bigint | null;
  playerName: string;

  // Game state (from backend)
  gameState: GameState | null;
  phase: GamePhase;

  // Local visual/input state
  bullets: Bullet[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  input: InputState;
  viewport: Viewport;

  // UI state
  isConnecting: boolean;
  error: string | null;
  lastTickTime: number;
  lastShootTime: number;

  // Actions
  setSessionId: (id: bigint | null) => void;
  setPlayerId: (id: bigint | null) => void;
  setPlayerName: (name: string) => void;
  setPhase: (phase: GamePhase) => void;
  setGameState: (state: GameState) => void;
  setIsConnecting: (v: boolean) => void;
  setError: (err: string | null) => void;

  addBullet: (bullet: Bullet) => void;
  removeBullet: (id: string) => void;
  updateBullets: () => void;

  addParticle: (particle: Particle) => void;
  tickParticles: (dt: number) => void;

  addFloatingText: (ft: FloatingText) => void;
  tickFloatingTexts: (dt: number) => void;

  setInput: (input: Partial<InputState>) => void;
  setViewport: (vp: Partial<Viewport>) => void;
  setLastTickTime: (t: number) => void;
  setLastShootTime: (t: number) => void;

  resetGame: () => void;
}

const defaultInput: InputState = {
  up: false,
  down: false,
  left: false,
  right: false,
  shoot: false,
  mouseX: 0,
  mouseY: 0,
  interact: false,
  heal: false,
};

const defaultViewport: Viewport = {
  x: 0,
  y: 0,
  width: 1280,
  height: 720,
  scale: 1,
};

export const useGameStore = create<GameStore>((set) => ({
  sessionId: null,
  playerId: null,
  playerName: "",
  gameState: null,
  phase: GamePhase.Lobby,
  bullets: [],
  particles: [],
  floatingTexts: [],
  input: defaultInput,
  viewport: defaultViewport,
  isConnecting: false,
  error: null,
  lastTickTime: 0,
  lastShootTime: 0,

  setSessionId: (id) => set({ sessionId: id }),
  setPlayerId: (id) => set({ playerId: id }),
  setPlayerName: (name) => set({ playerName: name }),
  setPhase: (phase) => set({ phase }),
  setGameState: (gameState) => {
    const newPhase = gameState.phase;
    set({ gameState, phase: newPhase });
  },
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setError: (error) => set({ error }),

  addBullet: (bullet) => set((s) => ({ bullets: [...s.bullets, bullet] })),
  removeBullet: (id) =>
    set((s) => ({ bullets: s.bullets.filter((b) => b.id !== id) })),
  updateBullets: () => {
    const now = Date.now();
    set((s) => ({
      bullets: s.bullets
        .map((b) => ({ ...b, x: b.x + b.vx, y: b.y + b.vy }))
        .filter((b) => now - b.createdAt < 2000),
    }));
  },

  addParticle: (particle) =>
    set((s) => ({ particles: [...s.particles, particle] })),
  tickParticles: (dt) =>
    set((s) => ({
      particles: s.particles
        .map((p) => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          life: p.life - dt,
          vx: p.vx * 0.96,
          vy: p.vy * 0.96,
        }))
        .filter((p) => p.life > 0),
    })),

  addFloatingText: (ft) =>
    set((s) => ({ floatingTexts: [...s.floatingTexts, ft] })),
  tickFloatingTexts: (dt) =>
    set((s) => ({
      floatingTexts: s.floatingTexts
        .map((ft) => ({ ...ft, y: ft.y - 0.5 * dt, life: ft.life - dt }))
        .filter((ft) => ft.life > 0),
    })),

  setInput: (input) => set((s) => ({ input: { ...s.input, ...input } })),
  setViewport: (vp) => set((s) => ({ viewport: { ...s.viewport, ...vp } })),
  setLastTickTime: (t) => set({ lastTickTime: t }),
  setLastShootTime: (t) => set({ lastShootTime: t }),

  resetGame: () =>
    set({
      sessionId: null,
      playerId: null,
      gameState: null,
      phase: GamePhase.Lobby,
      bullets: [],
      particles: [],
      floatingTexts: [],
      input: defaultInput,
      error: null,
      lastTickTime: 0,
      lastShootTime: 0,
    }),
}));

// Selector helpers
export const selectPlayer = (playerId: bigint | null) => (state: GameStore) =>
  state.gameState?.players.find((p) => p.id === playerId) ?? null;
