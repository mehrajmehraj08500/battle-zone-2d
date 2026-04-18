import { useActor } from "@caffeineai/core-infrastructure";
import { useCallback, useEffect, useRef } from "react";
import { GamePhase, createActor } from "../backend";
import type { backendInterface } from "../backend";
import { useGameStore } from "../store/gameStore";
import type { InputState } from "../types/game";
import {
  computeLocalMovement,
  createBullet,
  createFloatingText,
  getNearbyLoot,
  spawnMuzzleFlash,
} from "../utils/gameUtils";

const POLL_INTERVAL = 500;
const TICK_INTERVAL = 50;
const SHOOT_COOLDOWN_MS = 250;

export function useGameLoop() {
  const { actor, isFetching } = useActor<backendInterface>(createActor);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<number>(0);

  const phase = useGameStore((s) => s.phase);
  const setGameState = useGameStore((s) => s.setGameState);
  const addBullet = useGameStore((s) => s.addBullet);
  const addParticle = useGameStore((s) => s.addParticle);
  const addFloatingText = useGameStore((s) => s.addFloatingText);
  const updateBullets = useGameStore((s) => s.updateBullets);
  const tickParticles = useGameStore((s) => s.tickParticles);
  const tickFloatingTexts = useGameStore((s) => s.tickFloatingTexts);
  const setLastShootTime = useGameStore((s) => s.setLastShootTime);
  const setLastTickTime = useGameStore((s) => s.setLastTickTime);

  // --- Backend poll: getGameState every 500ms ---
  const startPoll = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      const { sessionId, actor: a } = {
        sessionId: useGameStore.getState().sessionId,
        actor,
      };
      if (!a || !sessionId) return;
      try {
        const result = await a.getGameState(sessionId);
        if (result.__kind__ === "ok") setGameState(result.ok);
      } catch {
        /* silent */
      }
    }, POLL_INTERVAL);
  }, [actor, setGameState]);

  // --- Backend tick every 200ms ---
  const startBackendTick = useCallback(() => {
    let lastBackendTick = 0;
    const backendTickInterval = 200;

    return async (now: number) => {
      if (now - lastBackendTick < backendTickInterval) return;
      lastBackendTick = now;
      const sessionId = useGameStore.getState().sessionId;
      if (!actor || !sessionId) return;
      try {
        const result = await actor.tickGame(sessionId);
        if (result.__kind__ === "ok") setGameState(result.ok);
      } catch {
        /* silent */
      }
    };
  }, [actor, setGameState]);

  // --- Local input tick ---
  const startLocalTick = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);

    tickRef.current = setInterval(async () => {
      const state = useGameStore.getState();
      if (state.phase !== GamePhase.InGame) return;
      const { sessionId: sid, playerId: pid, gameState: gs } = state;
      if (!gs || !pid || !sid || !actor) return;

      const player = gs.players.find((p) => p.id === pid);
      if (!player?.alive) return;

      const inp = state.input;
      const healFn = actor.useHealthItem.bind(actor);

      const newPos = computeLocalMovement(player, inp);
      const aimAngle = Math.atan2(
        inp.mouseY - window.innerHeight / 2,
        inp.mouseX - window.innerWidth / 2,
      );

      if (inp.up || inp.down || inp.left || inp.right) {
        try {
          await actor.movePlayer(sid, pid, newPos.x, newPos.y, aimAngle);
        } catch {
          /* silent */
        }
      }

      if (inp.heal) {
        healFn(sid, pid).catch(() => {
          /* silent */
        });
      }

      if (inp.interact) {
        const nearLoot = getNearbyLoot(player, gs.loots);
        if (nearLoot) {
          try {
            await actor.pickupLoot(sid, pid, nearLoot.id);
            addFloatingText(
              createFloatingText(
                player.x,
                player.y - 20,
                `+ ${nearLoot.lootType}`,
                "#4caf50",
              ),
            );
          } catch {
            /* silent */
          }
        }
      }

      if (inp.shoot) {
        const now = Date.now();
        if (now - state.lastShootTime >= SHOOT_COOLDOWN_MS) {
          setLastShootTime(now);

          const vp = state.viewport;
          const worldMouseX = (inp.mouseX - vp.width / 2) / vp.scale + player.x;
          const worldMouseY =
            (inp.mouseY - vp.height / 2) / vp.scale + player.y;

          const bullet = createBullet(
            pid,
            player.x,
            player.y,
            worldMouseX,
            worldMouseY,
            player.weapon,
          );
          addBullet(bullet);

          const flashAngle = Math.atan2(
            worldMouseY - player.y,
            worldMouseX - player.x,
          );
          for (const p of spawnMuzzleFlash(player.x, player.y, flashAngle)) {
            addParticle(p);
          }

          try {
            await actor.shootBullet(sid, pid, worldMouseX, worldMouseY);
          } catch {
            /* silent */
          }
        }
      }

      setLastTickTime(Date.now());
    }, TICK_INTERVAL);
  }, [
    actor,
    addBullet,
    addParticle,
    addFloatingText,
    setLastShootTime,
    setLastTickTime,
  ]);

  // --- rAF loop for visual updates ---
  const startRaf = useCallback(
    (backendTickFn?: (now: number) => Promise<void>) => {
      let lastFrame = 0;

      const loop = (now: number) => {
        const dt = Math.min(now - lastFrame, 50);
        lastFrame = now;

        updateBullets();
        tickParticles(dt);
        tickFloatingTexts(dt);

        if (backendTickFn) {
          backendTickFn(now).catch(() => {});
        }

        animRef.current = requestAnimationFrame(loop);
      };

      animRef.current = requestAnimationFrame(loop);
    },
    [updateBullets, tickParticles, tickFloatingTexts],
  );

  // Start/stop loops based on phase
  useEffect(() => {
    if (phase !== GamePhase.InGame || isFetching || !actor) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = 0;
      }
      return;
    }

    startPoll();
    startLocalTick();
    const backendTickFn = startBackendTick();
    startRaf(backendTickFn);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [
    phase,
    actor,
    isFetching,
    startPoll,
    startLocalTick,
    startBackendTick,
    startRaf,
  ]);

  const gameState = useGameStore((s) => s.gameState);
  return { gameState, phase };
}

// Keyboard/mouse input listener — attach once at app level
export function useInputListener() {
  const setInput = useGameStore((s) => s.setInput);

  useEffect(() => {
    const keyMap: Record<string, keyof InputState> = {
      w: "up",
      arrowup: "up",
      s: "down",
      arrowdown: "down",
      a: "left",
      arrowleft: "left",
      d: "right",
      arrowright: "right",
      f: "interact",
      e: "interact",
      h: "heal",
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mapped = keyMap[key];
      if (mapped) setInput({ [mapped]: true });
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mapped = keyMap[key];
      if (mapped) setInput({ [mapped]: false });
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0)
        setInput({ shoot: true, mouseX: e.clientX, mouseY: e.clientY });
    };
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 0) setInput({ shoot: false });
    };
    const onMouseMove = (e: MouseEvent) => {
      setInput({ mouseX: e.clientX, mouseY: e.clientY });
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [setInput]);
}
