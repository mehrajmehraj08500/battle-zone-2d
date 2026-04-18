import type { Viewport } from "../types/game";

// --- Coordinate transforms ---

/** World → screen (canvas pixel) */
export function worldToScreen(
  worldX: number,
  worldY: number,
  viewport: Viewport,
): { x: number; y: number } {
  return {
    x: (worldX - viewport.x) * viewport.scale + viewport.width / 2,
    y: (worldY - viewport.y) * viewport.scale + viewport.height / 2,
  };
}

/** Screen (canvas pixel) → world */
export function screenToWorld(
  screenX: number,
  screenY: number,
  viewport: Viewport,
): { x: number; y: number } {
  return {
    x: (screenX - viewport.width / 2) / viewport.scale + viewport.x,
    y: (screenY - viewport.height / 2) / viewport.scale + viewport.y,
  };
}

/** Center viewport on a world position */
export function centerViewportOn(
  worldX: number,
  worldY: number,
  viewport: Viewport,
): Viewport {
  return { ...viewport, x: worldX, y: worldY };
}

// --- Canvas setup ---

export function resizeCanvas(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
): { width: number; height: number } {
  const { offsetWidth: w, offsetHeight: h } = container;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.scale(dpr, dpr);
  return { width: w, height: h };
}

/** Create and configure a game canvas element */
export function createGameCanvas(container: HTMLElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.style.cursor = "crosshair";
  container.appendChild(canvas);
  resizeCanvas(canvas, container);
  return canvas;
}

// --- Drawing primitives ---

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fillColor: string,
  strokeColor?: string,
  lineWidth = 1,
) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fillColor;
  ctx.fill();
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fillColor: string,
  strokeColor?: string,
  lineWidth = 1,
) {
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, w, h);
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(x, y, w, h);
  }
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  font = "11px 'Geist Mono', monospace",
  align: CanvasTextAlign = "center",
) {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  lineWidth = 1,
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

// --- Player rendering ---

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  radius: number,
  angle: number,
  isLocal: boolean,
  alive: boolean,
  name: string,
  health: number,
  maxHealth = 100,
) {
  if (!alive) return;

  const bodyColor = isLocal ? "#e8c94a" : "#e05050";
  const outerColor = isLocal ? "rgba(232,201,74,0.35)" : "rgba(224,80,80,0.25)";

  // Outer glow ring
  drawCircle(ctx, sx, sy, radius + 4, outerColor);
  // Body
  drawCircle(
    ctx,
    sx,
    sy,
    radius,
    bodyColor,
    isLocal ? "#fff8d0" : "#ffa0a0",
    1.5,
  );

  // Direction arrow
  const arrowLen = radius + 6;
  const ax = sx + Math.cos(angle) * arrowLen;
  const ay = sy + Math.sin(angle) * arrowLen;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ax, ay);
  ctx.strokeStyle = isLocal ? "#fff8d0" : "#ffb0b0";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Name
  ctx.font = "bold 11px 'Geist Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = isLocal ? "#e8c94a" : "#f0f0f0";
  ctx.fillText(name, sx, sy - radius - 8);

  // Health bar
  const barW = 32;
  const barH = 4;
  const bx = sx - barW / 2;
  const by = sy - radius - 5;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(bx, by, barW, barH);
  const hpPct = Math.max(0, Math.min(1, health / maxHealth));
  const hpColor =
    hpPct > 0.5 ? "#4caf50" : hpPct > 0.25 ? "#ffc107" : "#f44336";
  ctx.fillStyle = hpColor;
  ctx.fillRect(bx, by, barW * hpPct, barH);
}

// --- Loot rendering ---

export function drawLoot(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  lootType: string,
  weaponType: string,
) {
  const colors: Record<string, string> = {
    Weapon: "#e8c94a",
    Health: "#4caf50",
    Armor: "#7ebce6",
  };
  const color = colors[lootType] ?? "#aaa";
  const size = 10;

  ctx.save();
  ctx.translate(sx, sy);
  ctx.beginPath();
  if (lootType === "Health") {
    // Cross shape
    ctx.fillStyle = color;
    ctx.fillRect(-2, -size / 2, 4, size);
    ctx.fillRect(-size / 2, -2, size, 4);
  } else if (lootType === "Armor") {
    // Shield diamond
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.7, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.7, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    // Weapon box
    ctx.rect(-size / 2, -size / 2, size, size);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#fff8";
    ctx.lineWidth = 1;
    ctx.stroke();
    // Weapon abbreviation
    ctx.font = "bold 7px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#111";
    ctx.fillText(weaponType.slice(0, 1), 0, 3);
  }
  ctx.restore();

  // Pulse ring
  const now = Date.now();
  const pulseAlpha = 0.3 + 0.2 * Math.sin(now / 400);
  drawCircle(ctx, sx, sy, size + 4, `rgba(255,255,255,${pulseAlpha})`);
}

// --- Safe zone rendering ---

export function drawSafeZone(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  nextRadius: number,
  viewport: Viewport,
) {
  const sc = worldToScreen(cx, cy, viewport);
  const sr = radius * viewport.scale;
  const snr = nextRadius * viewport.scale;

  // Danger outside zone
  ctx.save();
  ctx.beginPath();
  ctx.arc(sc.x, sc.y, sr, 0, Math.PI * 2);
  ctx.rect(viewport.width, 0, -viewport.width, viewport.height);
  ctx.fillStyle = "rgba(80, 0, 180, 0.12)";
  ctx.fill("evenodd");
  ctx.restore();

  // Zone border
  ctx.beginPath();
  ctx.arc(sc.x, sc.y, sr, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(120, 80, 255, 0.85)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Next zone
  if (snr > 0 && snr < sr) {
    ctx.beginPath();
    ctx.arc(sc.x, sc.y, snr, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 180, 60, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// --- Map grid ---

export function drawMapGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  mapSize: number,
  gridStep = 200,
) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= mapSize; gx += gridStep) {
    const s0 = worldToScreen(gx, 0, viewport);
    const s1 = worldToScreen(gx, mapSize, viewport);
    ctx.beginPath();
    ctx.moveTo(s0.x, s0.y);
    ctx.lineTo(s1.x, s1.y);
    ctx.stroke();
  }
  for (let gy = 0; gy <= mapSize; gy += gridStep) {
    const s0 = worldToScreen(0, gy, viewport);
    const s1 = worldToScreen(mapSize, gy, viewport);
    ctx.beginPath();
    ctx.moveTo(s0.x, s0.y);
    ctx.lineTo(s1.x, s1.y);
    ctx.stroke();
  }
  ctx.restore();
}

// --- Minimap ---

export function drawMinimap(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  _canvasHeight: number,
  mapSize: number,
  players: Array<{
    x: number;
    y: number;
    id: bigint;
    alive: boolean;
    isBot: boolean;
  }>,
  localPlayerId: bigint | null,
  safeZone: { centerX: number; centerY: number; radius: number },
  loots: Array<{ x: number; y: number }>,
) {
  const mmSize = 160;
  const mmPad = 12;
  const mx = canvasWidth - mmSize - mmPad;
  const my = mmPad;

  // Background
  ctx.fillStyle = "rgba(8, 14, 20, 0.88)";
  ctx.fillRect(mx, my, mmSize, mmSize);
  ctx.strokeStyle = "#e8c94a";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(mx, my, mmSize, mmSize);

  // Corner brackets
  const bLen = 10;
  ctx.strokeStyle = "#e8c94a";
  ctx.lineWidth = 2;
  const corners = [
    [mx, my],
    [mx + mmSize, my],
    [mx, my + mmSize],
    [mx + mmSize, my + mmSize],
  ] as const;
  for (let i = 0; i < corners.length; i++) {
    const [bx, by] = corners[i];
    const dx = i % 2 === 0 ? 1 : -1;
    const dy = i < 2 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(bx + dx * bLen, by);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx, by + dy * bLen);
    ctx.stroke();
  }

  const toMM = (wx: number, wy: number) => ({
    x: mx + (wx / mapSize) * mmSize,
    y: my + (wy / mapSize) * mmSize,
  });

  // Safe zone circle
  const szC = toMM(safeZone.centerX, safeZone.centerY);
  const szR = (safeZone.radius / mapSize) * mmSize;
  ctx.beginPath();
  ctx.arc(szC.x, szC.y, szR, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(120,80,255,0.7)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Loots (small dots)
  for (const l of loots.slice(0, 30)) {
    const p = toMM(l.x, l.y);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(100,200,100,0.6)";
    ctx.fill();
  }

  // Players
  for (const p of players) {
    if (!p.alive) continue;
    const pm = toMM(p.x, p.y);
    const isLocal = p.id === localPlayerId;
    ctx.beginPath();
    ctx.arc(pm.x, pm.y, isLocal ? 4 : 2.5, 0, Math.PI * 2);
    ctx.fillStyle = isLocal ? "#e8c94a" : p.isBot ? "#888" : "#e05050";
    ctx.fill();
  }
}
