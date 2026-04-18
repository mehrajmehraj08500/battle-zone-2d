import { useEffect, useRef } from "react";
import HUD from "../components/HUD";
import KillFeed from "../components/KillFeed";
import ZoneWarning from "../components/ZoneWarning";
import { useGameLoop } from "../hooks/useGameLoop";
import { useGameStore } from "../store/gameStore";
import { BULLET_RADIUS, MAP_SIZE } from "../types/game";
import {
  drawCircle,
  drawLoot,
  drawMapGrid,
  drawMinimap,
  drawPlayer,
  drawSafeZone,
  worldToScreen,
} from "../utils/canvas";
import {
  countAlive,
  getSafeZoneCountdown,
  isInSafeZone,
} from "../utils/gameUtils";

// Terrain obstacles for visual depth (static)
const OBSTACLES = [
  { x: 200, y: 180, w: 80, h: 60 },
  { x: 420, y: 320, w: 100, h: 40 },
  { x: 650, y: 200, w: 60, h: 90 },
  { x: 900, y: 450, w: 120, h: 50 },
  { x: 1100, y: 300, w: 80, h: 80 },
  { x: 1350, y: 600, w: 100, h: 60 },
  { x: 300, y: 700, w: 90, h: 70 },
  { x: 750, y: 900, w: 140, h: 55 },
  { x: 1200, y: 850, w: 110, h: 45 },
  { x: 500, y: 1100, w: 85, h: 65 },
  { x: 1600, y: 400, w: 95, h: 75 },
  { x: 1800, y: 700, w: 70, h: 90 },
  { x: 400, y: 1500, w: 130, h: 50 },
  { x: 1400, y: 1300, w: 100, h: 60 },
  { x: 800, y: 1600, w: 120, h: 45 },
  { x: 1700, y: 1500, w: 80, h: 80 },
];

// Buildings (larger structures)
const BUILDINGS = [
  { x: 350, y: 350, w: 180, h: 140, label: "ALPHA" },
  { x: 800, y: 250, w: 200, h: 160, label: "BRAVO" },
  { x: 1200, y: 500, w: 220, h: 170, label: "CHARLIE" },
  { x: 400, y: 950, w: 190, h: 150, label: "DELTA" },
  { x: 1000, y: 1000, w: 240, h: 180, label: "EIKO" },
  { x: 1500, y: 900, w: 200, h: 160, label: "FOXTROT" },
  { x: 700, y: 1400, w: 200, h: 150, label: "GHOST" },
  { x: 1600, y: 1400, w: 180, h: 140, label: "HOTEL" },
];

function drawTerrain(
  ctx: CanvasRenderingContext2D,
  vp: { x: number; y: number; width: number; height: number; scale: number },
) {
  // Obstacles
  for (const ob of OBSTACLES) {
    const s = worldToScreen(ob.x, ob.y, vp);
    const sw = ob.w * vp.scale;
    const sh = ob.h * vp.scale;
    ctx.fillStyle = "rgba(30, 50, 40, 0.9)";
    ctx.strokeStyle = "rgba(60, 90, 60, 0.6)";
    ctx.lineWidth = 1;
    ctx.fillRect(s.x, s.y, sw, sh);
    ctx.strokeRect(s.x, s.y, sw, sh);
  }

  // Buildings
  for (const bld of BUILDINGS) {
    const s = worldToScreen(bld.x, bld.y, vp);
    const sw = bld.w * vp.scale;
    const sh = bld.h * vp.scale;

    // Building body
    ctx.fillStyle = "rgba(20, 35, 50, 0.92)";
    ctx.strokeStyle = "rgba(80, 120, 160, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.fillRect(s.x, s.y, sw, sh);
    ctx.strokeRect(s.x, s.y, sw, sh);

    // Corner brackets
    const bLen = 8;
    ctx.strokeStyle = "rgba(120, 180, 220, 0.4)";
    ctx.lineWidth = 1.5;
    const corners = [
      [s.x, s.y, 1, 1],
      [s.x + sw, s.y, -1, 1],
      [s.x, s.y + sh, 1, -1],
      [s.x + sw, s.y + sh, -1, -1],
    ] as const;
    for (const [cx, cy, dx, dy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx + dx * bLen, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * bLen);
      ctx.stroke();
    }

    // Window dots
    if (sw > 30) {
      for (let wr = 0; wr < 2; wr++) {
        for (let wc = 0; wc < 3; wc++) {
          const wx = s.x + (sw / 4) * (wc + 1);
          const wy = s.y + (sh / 3) * (wr + 1);
          ctx.beginPath();
          ctx.arc(wx, wy, 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(180, 220, 255, 0.25)";
          ctx.fill();
        }
      }
    }

    // Label
    if (vp.scale > 0.6) {
      ctx.font = `bold ${Math.max(7, 9 * vp.scale)}px 'Geist Mono', monospace`;
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(120, 180, 220, 0.6)";
      ctx.fillText(bld.label, s.x + sw / 2, s.y + sh / 2 + 4);
    }
  }
}

function drawBulletTrail(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  vx: number,
  vy: number,
) {
  const trailLen = 3;
  const tx = sx - vx * trailLen;
  const ty = sy - vy * trailLen;

  const grad = ctx.createLinearGradient(tx, ty, sx, sy);
  grad.addColorStop(0, "rgba(255, 238, 100, 0)");
  grad.addColorStop(1, "rgba(255, 238, 100, 0.9)");

  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(sx, sy);
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { gameState } = useGameLoop();
  const playerId = useGameStore((s) => s.playerId);
  const bullets = useGameStore((s) => s.bullets);
  const particles = useGameStore((s) => s.particles);
  const floatingTexts = useGameStore((s) => s.floatingTexts);
  const viewport = useGameStore((s) => s.viewport);
  const setViewport = useGameStore((s) => s.setViewport);

  // Resize canvas on mount + container size change
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      setViewport({ width: w, height: h });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [setViewport]);

  // 60fps render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = 0;
    const render = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Map background
      ctx.fillStyle = "#080e14";
      ctx.fillRect(0, 0, w, h);

      const gs = gameState;
      if (!gs) {
        // Waiting overlay
        ctx.font = "bold 18px 'Geist Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#e8c94a66";
        ctx.fillText("CONNECTING TO SERVER...", w / 2, h / 2);
        ctx.restore();
        rafId = requestAnimationFrame(render);
        return;
      }

      const localPlayer = gs.players.find((p) => p.id === playerId) ?? null;

      // Build viewport centered on local player
      const vp = {
        ...viewport,
        x: localPlayer ? localPlayer.x : MAP_SIZE / 2,
        y: localPlayer ? localPlayer.y : MAP_SIZE / 2,
        width: w,
        height: h,
      };

      // Map territory fill
      const tl = worldToScreen(0, 0, vp);
      const br = worldToScreen(MAP_SIZE, MAP_SIZE, vp);
      ctx.fillStyle = "#0b1318";
      ctx.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);

      // Map border
      ctx.strokeStyle = "rgba(232,201,74,0.3)";
      ctx.lineWidth = 2;
      ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);

      // Grid + terrain
      drawMapGrid(ctx, vp, MAP_SIZE);
      drawTerrain(ctx, vp);

      // Safe zone
      drawSafeZone(
        ctx,
        gs.safeZone.centerX,
        gs.safeZone.centerY,
        gs.safeZone.radius,
        gs.safeZone.radius * 0.65,
        vp,
      );

      // Loot
      for (const loot of gs.loots) {
        if (loot.claimed) continue;
        const s = worldToScreen(loot.x, loot.y, vp);
        // Cull off-screen
        if (s.x < -30 || s.x > w + 30 || s.y < -30 || s.y > h + 30) continue;
        drawLoot(ctx, s.x, s.y, loot.lootType, loot.weaponType);
      }

      // Bullets with trails
      for (const b of bullets) {
        const s = worldToScreen(b.x, b.y, vp);
        if (s.x < -20 || s.x > w + 20 || s.y < -20 || s.y > h + 20) continue;
        drawBulletTrail(ctx, s.x, s.y, b.vx * vp.scale, b.vy * vp.scale);
        drawCircle(
          ctx,
          s.x,
          s.y,
          BULLET_RADIUS * vp.scale,
          "#fff8aa",
          "#ffee66",
          1,
        );
      }

      // Particles
      for (const p of particles) {
        const s = worldToScreen(p.x, p.y, vp);
        if (s.x < -10 || s.x > w + 10 || s.y < -10 || s.y > h + 10) continue;
        const alpha = Math.max(0, p.life / p.maxLife);
        const hexAlpha = Math.round(alpha * 255)
          .toString(16)
          .padStart(2, "0");
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.5, p.size * alpha), 0, Math.PI * 2);
        ctx.fillStyle = p.color + hexAlpha;
        ctx.fill();
      }

      // Players (dead ones first so alive appear on top)
      const sortedPlayers = [...gs.players].sort(
        (a, b) => (a.alive ? 1 : 0) - (b.alive ? 1 : 0),
      );
      for (const p of sortedPlayers) {
        const s = worldToScreen(p.x, p.y, vp);
        if (s.x < -50 || s.x > w + 50 || s.y < -50 || s.y > h + 50) continue;
        drawPlayer(
          ctx,
          s.x,
          s.y,
          14 * vp.scale,
          p.angle,
          p.id === playerId,
          p.alive,
          p.name,
          Number(p.health),
        );
      }

      // Floating damage texts
      for (const ft of floatingTexts) {
        const s = worldToScreen(ft.x, ft.y, vp);
        const alpha = Math.max(0, ft.life / ft.maxLife);
        const hexAlpha = Math.round(alpha * 255)
          .toString(16)
          .padStart(2, "0");
        ctx.font = `bold ${Math.round(12 + (1 - alpha) * 4)}px 'Geist Mono', monospace`;
        ctx.textAlign = "center";
        ctx.fillStyle = ft.color + hexAlpha;
        // Shadow
        ctx.shadowColor = "#00000080";
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, s.x, s.y);
        ctx.shadowBlur = 0;
      }

      // Minimap
      drawMinimap(
        ctx,
        w,
        h,
        MAP_SIZE,
        gs.players,
        playerId ?? null,
        gs.safeZone,
        gs.loots.filter((l) => !l.claimed),
      );

      // Minimap label
      const mmX = w - 160 - 12 + 80;
      const mmLabelY = 12 + 160 + 14;
      ctx.font = "bold 8px 'Geist Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#e8c94a";
      const countdown = getSafeZoneCountdown(gs.safeZone.nextShrinkTime);
      ctx.fillText(`SAFE ZONE CLOSING  ${countdown}`, mmX, mmLabelY);

      // Match time + alive count (below minimap label)
      const alive = countAlive(gs.players);
      ctx.font = "9px 'Geist Mono', monospace";
      ctx.fillStyle = "#888";
      ctx.fillText(`ALIVE: ${alive}`, mmX, mmLabelY + 14);

      ctx.restore();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [gameState, playerId, bullets, particles, floatingTexts, viewport]);

  const gs = gameState;
  const localPlayer = gs?.players.find((p) => p.id === playerId) ?? null;
  const inDanger =
    localPlayer && gs
      ? !isInSafeZone(localPlayer.x, localPlayer.y, gs.safeZone)
      : false;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-background overflow-hidden"
      style={{ cursor: "crosshair" }}
      data-ocid="game.canvas_target"
    >
      <canvas
        ref={canvasRef}
        style={{ cursor: "crosshair", display: "block" }}
      />

      {/* React-rendered HUD overlays */}
      {gs && localPlayer && (
        <HUD player={localPlayer} gameState={gs} playerId={playerId ?? null} />
      )}

      {gs && <KillFeed killFeed={gs.killFeed} playerId={playerId ?? null} />}

      {inDanger && <ZoneWarning />}
    </div>
  );
}
