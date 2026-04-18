import { d as countAlive, f as formatMatchTime, g as getWeaponLabel, e as getWeaponFireMode, j as jsxRuntimeExports, h as getArmorLabel, r as reactExports, b as useGameLoop, a as useGameStore, i as isInSafeZone, M as MAP_SIZE, k as getSafeZoneCountdown, B as BULLET_RADIUS } from "./index-CEJ732-U.js";
function StatBar({
  value,
  max,
  color,
  label,
  current
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-col gap-0.5",
      "data-ocid": `hud.${label.toLowerCase()}_bar`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-[9px] text-foreground/70", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-[9px] text-foreground/50", children: current })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-1.5 bg-black/60 border border-white/10 relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute inset-y-0 left-0 transition-all duration-150",
              style: { width: `${pct * 100}%`, background: color }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute inset-0 opacity-20",
              style: {
                backgroundImage: "repeating-linear-gradient(90deg, transparent 0, transparent 4px, rgba(255,255,255,0.08) 4px, rgba(255,255,255,0.08) 5px)"
              }
            }
          )
        ] })
      ]
    }
  );
}
function HUD({ player, gameState, playerId }) {
  var _a;
  const hp = Math.max(0, Math.min(100, Number(player.health)));
  const ar = Math.max(0, Math.min(100, Number(player.armor)));
  const ammo = Number(player.ammo);
  const kills = Number(player.kills);
  const alive = countAlive(gameState.players);
  const matchTime = formatMatchTime(gameState.matchTime);
  const weaponLabel = getWeaponLabel(player.weapon);
  const fireMode = getWeaponFireMode(player.weapon);
  const hpColor = hp > 50 ? "#4caf50" : hp > 25 ? "#ffc107" : "#f44336";
  const weaponColors = {
    Rifle: "#e8c94a",
    Sniper: "#7ebce6",
    Shotgun: "#e07c3a",
    Pistol: "#b0b8c0"
  };
  const wColor = weaponColors[String(player.weapon)] ?? "#e8c94a";
  const myKills = ((_a = gameState.players.find((p) => p.id === playerId)) == null ? void 0 : _a.kills) ?? 0n;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 pointer-events-none",
        "data-ocid": "hud.timer_panel",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hud-panel px-4 py-1 flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-[10px] text-foreground/50", children: "TIME" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-sm text-primary font-bold tracking-widest", children: matchTime })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hud-panel px-3 py-0.5 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-[9px] text-foreground/50", children: "ALIVE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-[10px] text-foreground", children: alive }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-[9px] text-foreground/30", children: "│" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-[9px] text-foreground/50", children: "KILLS" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-[10px] text-primary font-bold", children: Number(myKills) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "absolute bottom-3 left-1/2 -translate-x-1/2 flex items-stretch gap-0 pointer-events-none",
        style: { minWidth: 420 },
        "data-ocid": "hud.bottom_panel",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hud-panel px-4 py-3 flex flex-col justify-center gap-2.5 min-w-[200px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              StatBar,
              {
                value: hp,
                max: 100,
                color: hpColor,
                label: "HEALTH",
                current: `${hp}/100`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              StatBar,
              {
                value: ar,
                max: 100,
                color: "#7ebce6",
                label: "ARMOR",
                current: `${ar}/100`
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "hud-panel border-l-0 px-3 py-3 flex flex-col justify-center gap-1 min-w-[110px]",
              "data-ocid": "hud.gear_panel",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border border-blue-400/50 bg-blue-900/30 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1.5 bg-blue-400/70" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tactical-text text-[9px] text-blue-300/80", children: [
                    getArmorLabel(
                      player.armor > 66n ? "Heavy" : player.armor > 33n ? "Medium" : "Light"
                    ),
                    " ",
                    "Vest"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 border border-blue-400/50 bg-blue-900/30 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1.5 h-1 bg-blue-400/70" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tactical-text text-[9px] text-blue-300/80", children: [
                    getArmorLabel(player.armor > 50n ? "Medium" : "Light"),
                    " Helmet"
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "hud-panel border-l-0 px-4 py-3 flex flex-col justify-between min-w-[140px]",
              "data-ocid": "hud.weapon_panel",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "tactical-text text-[11px] font-bold",
                      style: { color: wColor },
                      children: weaponLabel
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "px-1.5 py-0.5 text-[8px] font-bold font-mono",
                      style: { background: wColor, color: "#111" },
                      children: fireMode
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "font-mono font-bold text-2xl leading-none",
                      style: { color: ammo < 6 ? "#f44336" : "#e8e8e8" },
                      children: ammo
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-[9px] text-foreground/40", children: "/ 180" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-0.5 flex-wrap", style: { maxWidth: 120 }, children: Array.from({ length: Math.min(ammo, 30) }, (_, i) => {
                  const pipKey = `pip${i}`;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-1 h-2",
                      style: { background: wColor, opacity: 0.7 }
                    },
                    pipKey
                  );
                }) })
              ]
            }
          )
        ]
      }
    ),
    kills > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "absolute top-16 right-4 hud-panel px-3 py-1.5 flex flex-col items-center pointer-events-none",
        "data-ocid": "hud.kills_badge",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-[8px] text-foreground/50", children: "KILLS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold text-2xl text-primary leading-none", children: kills })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute bottom-3 right-3 hud-panel px-2.5 py-2 pointer-events-none opacity-50",
        "data-ocid": "hud.controls_hint",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-0.5", children: [
          ["WASD", "MOVE"],
          ["MOUSE", "AIM/SHOOT"],
          ["F/E", "PICKUP"],
          ["H", "HEAL"]
        ].map(([key, action]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-[7px] text-primary bg-primary/10 px-1", children: key }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-[7px] text-foreground/40", children: action })
        ] }, key)) })
      }
    )
  ] });
}
const FADE_AFTER_MS = 5e3;
const REMOVE_AFTER_MS = 7e3;
function KillFeed({ killFeed, playerId }) {
  const [entries, setEntries] = reactExports.useState([]);
  const prevLenRef = reactExports.useRef(0);
  const timerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const newCount = killFeed.length - prevLenRef.current;
    if (newCount > 0) {
      const added = killFeed.slice(-newCount);
      const now = Date.now();
      setEntries((prev) => {
        const next = [
          ...prev,
          ...added.map((e, i) => ({
            ...e,
            _key: `${String(e.killerId)}_${String(e.victimId)}_${now + i}`,
            _age: 0
          }))
        ].slice(-6);
        return next;
      });
    }
    prevLenRef.current = killFeed.length;
  }, [killFeed]);
  reactExports.useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setEntries((prev) => {
        const now = Date.now();
        return prev.map((e) => ({
          ...e,
          _age: now - Number(String(e._key).split("_").pop())
        })).filter((e) => e._age < REMOVE_AFTER_MS);
      });
    }, 200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  if (entries.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "absolute top-16 left-3 flex flex-col gap-1 pointer-events-none",
      "data-ocid": "killfeed.panel",
      children: entries.map((e, i) => {
        const isFading = e._age > FADE_AFTER_MS;
        const opacity = isFading ? Math.max(
          0,
          1 - (e._age - FADE_AFTER_MS) / (REMOVE_AFTER_MS - FADE_AFTER_MS)
        ) : 1;
        const isMyKill = e.killerId === playerId;
        const isMyDeath = e.victimId === playerId;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-1.5 hud-panel px-2.5 py-1 transition-opacity duration-300",
            style: { opacity },
            "data-ocid": `killfeed.item.${i + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "tactical-text text-[10px] font-bold",
                  style: { color: isMyKill ? "#e8c94a" : "#e05050" },
                  children: e.killerName
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-[8px] text-foreground/40 border border-foreground/15 px-1", children: getWeaponLabel(e.weapon) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "tactical-text text-[10px]",
                  style: { color: isMyDeath ? "#f44336" : "#999" },
                  children: e.victimName
                }
              ),
              (isMyKill || isMyDeath) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "tactical-text text-[7px] px-1 font-bold",
                  style: {
                    background: isMyKill ? "#e8c94a22" : "#f4433622",
                    color: isMyKill ? "#e8c94a" : "#f44336",
                    border: `1px solid ${isMyKill ? "#e8c94a44" : "#f4433644"}`
                  },
                  children: isMyKill ? "YOU" : "RIP"
                }
              )
            ]
          },
          e._key
        );
      })
    }
  );
}
function ZoneWarning() {
  const [pulsePhase, setPulsePhase] = reactExports.useState(0);
  const rafRef = reactExports.useRef(0);
  const startRef = reactExports.useRef(Date.now());
  reactExports.useEffect(() => {
    const animate = () => {
      const elapsed = Date.now() - startRef.current;
      setPulsePhase(elapsed);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  const pulse = 0.5 + 0.5 * Math.sin(pulsePhase / 320);
  const vignetteAlpha = 0.08 + 0.14 * pulse;
  const borderAlpha = 0.3 + 0.4 * pulse;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 pointer-events-none",
        style: {
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(180, 0, 60, ${vignetteAlpha}) 100%)`,
          zIndex: 10
        },
        "data-ocid": "zone_warning.overlay"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 pointer-events-none",
        style: {
          boxShadow: `inset 0 0 80px rgba(180, 0, 60, ${borderAlpha}), inset 0 0 30px rgba(255, 30, 80, ${borderAlpha * 0.6})`,
          zIndex: 10
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none zone-warning-banner",
        style: { zIndex: 20 },
        "data-ocid": "zone_warning.banner",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-col items-center gap-1",
            style: { opacity: 0.7 + 0.3 * pulse },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "w-8 h-8 flex items-center justify-center border-2",
                  style: {
                    borderColor: `rgba(255, 50, 80, ${0.6 + 0.4 * pulse})`,
                    background: "rgba(180, 0, 40, 0.2)"
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "text-[14px] leading-none",
                      style: { color: "#ff3250" },
                      children: "!"
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "hud-panel px-4 py-1.5 text-center",
                  style: { borderColor: "rgba(255, 50, 80, 0.5)" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        className: "tactical-text text-[11px] font-bold",
                        style: { color: "#ff3250" },
                        children: "OUTSIDE SAFE ZONE"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "tactical-text text-[8px] text-foreground/50 mt-0.5", children: "MOVE TO SAFE AREA — TAKING DAMAGE" })
                  ]
                }
              )
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed top-3 left-1/2 -translate-x-1/2 pointer-events-none",
        style: { zIndex: 20, opacity: 0.4 + 0.4 * pulse },
        "data-ocid": "zone_warning.arrow_top",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "tactical-text text-[9px] px-2 py-0.5 flex items-center gap-1",
            style: {
              background: "rgba(180,0,40,0.3)",
              border: "1px solid rgba(255,50,80,0.4)",
              color: "#ff3250"
            },
            children: "▲ SAFE ZONE"
          }
        )
      }
    )
  ] });
}
function worldToScreen(worldX, worldY, viewport) {
  return {
    x: (worldX - viewport.x) * viewport.scale + viewport.width / 2,
    y: (worldY - viewport.y) * viewport.scale + viewport.height / 2
  };
}
function drawCircle(ctx, x, y, radius, fillColor, strokeColor, lineWidth = 1) {
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
function drawPlayer(ctx, sx, sy, radius, angle, isLocal, alive, name, health, maxHealth = 100) {
  if (!alive) return;
  const bodyColor = isLocal ? "#e8c94a" : "#e05050";
  const outerColor = isLocal ? "rgba(232,201,74,0.35)" : "rgba(224,80,80,0.25)";
  drawCircle(ctx, sx, sy, radius + 4, outerColor);
  drawCircle(
    ctx,
    sx,
    sy,
    radius,
    bodyColor,
    isLocal ? "#fff8d0" : "#ffa0a0",
    1.5
  );
  const arrowLen = radius + 6;
  const ax = sx + Math.cos(angle) * arrowLen;
  const ay = sy + Math.sin(angle) * arrowLen;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ax, ay);
  ctx.strokeStyle = isLocal ? "#fff8d0" : "#ffb0b0";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.font = "bold 11px 'Geist Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = isLocal ? "#e8c94a" : "#f0f0f0";
  ctx.fillText(name, sx, sy - radius - 8);
  const barW = 32;
  const barH = 4;
  const bx = sx - barW / 2;
  const by = sy - radius - 5;
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(bx, by, barW, barH);
  const hpPct = Math.max(0, Math.min(1, health / maxHealth));
  const hpColor = hpPct > 0.5 ? "#4caf50" : hpPct > 0.25 ? "#ffc107" : "#f44336";
  ctx.fillStyle = hpColor;
  ctx.fillRect(bx, by, barW * hpPct, barH);
}
function drawLoot(ctx, sx, sy, lootType, weaponType) {
  const colors = {
    Weapon: "#e8c94a",
    Health: "#4caf50",
    Armor: "#7ebce6"
  };
  const color = colors[lootType] ?? "#aaa";
  const size = 10;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.beginPath();
  if (lootType === "Health") {
    ctx.fillStyle = color;
    ctx.fillRect(-2, -size / 2, 4, size);
    ctx.fillRect(-size / 2, -2, size, 4);
  } else if (lootType === "Armor") {
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.7, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.7, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.rect(-size / 2, -size / 2, size, size);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#fff8";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = "bold 7px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#111";
    ctx.fillText(weaponType.slice(0, 1), 0, 3);
  }
  ctx.restore();
  const now = Date.now();
  const pulseAlpha = 0.3 + 0.2 * Math.sin(now / 400);
  drawCircle(ctx, sx, sy, size + 4, `rgba(255,255,255,${pulseAlpha})`);
}
function drawSafeZone(ctx, cx, cy, radius, nextRadius, viewport) {
  const sc = worldToScreen(cx, cy, viewport);
  const sr = radius * viewport.scale;
  const snr = nextRadius * viewport.scale;
  ctx.save();
  ctx.beginPath();
  ctx.arc(sc.x, sc.y, sr, 0, Math.PI * 2);
  ctx.rect(viewport.width, 0, -viewport.width, viewport.height);
  ctx.fillStyle = "rgba(80, 0, 180, 0.12)";
  ctx.fill("evenodd");
  ctx.restore();
  ctx.beginPath();
  ctx.arc(sc.x, sc.y, sr, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(120, 80, 255, 0.85)";
  ctx.lineWidth = 2.5;
  ctx.stroke();
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
function drawMapGrid(ctx, viewport, mapSize, gridStep = 200) {
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
function drawMinimap(ctx, canvasWidth, _canvasHeight, mapSize, players, localPlayerId, safeZone, loots) {
  const mmSize = 160;
  const mmPad = 12;
  const mx = canvasWidth - mmSize - mmPad;
  const my = mmPad;
  ctx.fillStyle = "rgba(8, 14, 20, 0.88)";
  ctx.fillRect(mx, my, mmSize, mmSize);
  ctx.strokeStyle = "#e8c94a";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(mx, my, mmSize, mmSize);
  const bLen = 10;
  ctx.strokeStyle = "#e8c94a";
  ctx.lineWidth = 2;
  const corners = [
    [mx, my],
    [mx + mmSize, my],
    [mx, my + mmSize],
    [mx + mmSize, my + mmSize]
  ];
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
  const toMM = (wx, wy) => ({
    x: mx + wx / mapSize * mmSize,
    y: my + wy / mapSize * mmSize
  });
  const szC = toMM(safeZone.centerX, safeZone.centerY);
  const szR = safeZone.radius / mapSize * mmSize;
  ctx.beginPath();
  ctx.arc(szC.x, szC.y, szR, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(120,80,255,0.7)";
  ctx.lineWidth = 1;
  ctx.stroke();
  for (const l of loots.slice(0, 30)) {
    const p = toMM(l.x, l.y);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(100,200,100,0.6)";
    ctx.fill();
  }
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
  { x: 1700, y: 1500, w: 80, h: 80 }
];
const BUILDINGS = [
  { x: 350, y: 350, w: 180, h: 140, label: "ALPHA" },
  { x: 800, y: 250, w: 200, h: 160, label: "BRAVO" },
  { x: 1200, y: 500, w: 220, h: 170, label: "CHARLIE" },
  { x: 400, y: 950, w: 190, h: 150, label: "DELTA" },
  { x: 1e3, y: 1e3, w: 240, h: 180, label: "EIKO" },
  { x: 1500, y: 900, w: 200, h: 160, label: "FOXTROT" },
  { x: 700, y: 1400, w: 200, h: 150, label: "GHOST" },
  { x: 1600, y: 1400, w: 180, h: 140, label: "HOTEL" }
];
function drawTerrain(ctx, vp) {
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
  for (const bld of BUILDINGS) {
    const s = worldToScreen(bld.x, bld.y, vp);
    const sw = bld.w * vp.scale;
    const sh = bld.h * vp.scale;
    ctx.fillStyle = "rgba(20, 35, 50, 0.92)";
    ctx.strokeStyle = "rgba(80, 120, 160, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.fillRect(s.x, s.y, sw, sh);
    ctx.strokeRect(s.x, s.y, sw, sh);
    const bLen = 8;
    ctx.strokeStyle = "rgba(120, 180, 220, 0.4)";
    ctx.lineWidth = 1.5;
    const corners = [
      [s.x, s.y, 1, 1],
      [s.x + sw, s.y, -1, 1],
      [s.x, s.y + sh, 1, -1],
      [s.x + sw, s.y + sh, -1, -1]
    ];
    for (const [cx, cy, dx, dy] of corners) {
      ctx.beginPath();
      ctx.moveTo(cx + dx * bLen, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * bLen);
      ctx.stroke();
    }
    if (sw > 30) {
      for (let wr = 0; wr < 2; wr++) {
        for (let wc = 0; wc < 3; wc++) {
          const wx = s.x + sw / 4 * (wc + 1);
          const wy = s.y + sh / 3 * (wr + 1);
          ctx.beginPath();
          ctx.arc(wx, wy, 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(180, 220, 255, 0.25)";
          ctx.fill();
        }
      }
    }
    if (vp.scale > 0.6) {
      ctx.font = `bold ${Math.max(7, 9 * vp.scale)}px 'Geist Mono', monospace`;
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(120, 180, 220, 0.6)";
      ctx.fillText(bld.label, s.x + sw / 2, s.y + sh / 2 + 4);
    }
  }
}
function drawBulletTrail(ctx, sx, sy, vx, vy) {
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
function GameCanvas() {
  const canvasRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  const { gameState } = useGameLoop();
  const playerId = useGameStore((s) => s.playerId);
  const bullets = useGameStore((s) => s.bullets);
  const particles = useGameStore((s) => s.particles);
  const floatingTexts = useGameStore((s) => s.floatingTexts);
  const viewport = useGameStore((s) => s.viewport);
  const setViewport = useGameStore((s) => s.setViewport);
  reactExports.useEffect(() => {
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
  reactExports.useEffect(() => {
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
      ctx.fillStyle = "#080e14";
      ctx.fillRect(0, 0, w, h);
      const gs2 = gameState;
      if (!gs2) {
        ctx.font = "bold 18px 'Geist Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#e8c94a66";
        ctx.fillText("CONNECTING TO SERVER...", w / 2, h / 2);
        ctx.restore();
        rafId = requestAnimationFrame(render);
        return;
      }
      const localPlayer2 = gs2.players.find((p) => p.id === playerId) ?? null;
      const vp = {
        ...viewport,
        x: localPlayer2 ? localPlayer2.x : MAP_SIZE / 2,
        y: localPlayer2 ? localPlayer2.y : MAP_SIZE / 2,
        width: w,
        height: h
      };
      const tl = worldToScreen(0, 0, vp);
      const br = worldToScreen(MAP_SIZE, MAP_SIZE, vp);
      ctx.fillStyle = "#0b1318";
      ctx.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
      ctx.strokeStyle = "rgba(232,201,74,0.3)";
      ctx.lineWidth = 2;
      ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
      drawMapGrid(ctx, vp, MAP_SIZE);
      drawTerrain(ctx, vp);
      drawSafeZone(
        ctx,
        gs2.safeZone.centerX,
        gs2.safeZone.centerY,
        gs2.safeZone.radius,
        gs2.safeZone.radius * 0.65,
        vp
      );
      for (const loot of gs2.loots) {
        if (loot.claimed) continue;
        const s = worldToScreen(loot.x, loot.y, vp);
        if (s.x < -30 || s.x > w + 30 || s.y < -30 || s.y > h + 30) continue;
        drawLoot(ctx, s.x, s.y, loot.lootType, loot.weaponType);
      }
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
          1
        );
      }
      for (const p of particles) {
        const s = worldToScreen(p.x, p.y, vp);
        if (s.x < -10 || s.x > w + 10 || s.y < -10 || s.y > h + 10) continue;
        const alpha = Math.max(0, p.life / p.maxLife);
        const hexAlpha = Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.5, p.size * alpha), 0, Math.PI * 2);
        ctx.fillStyle = p.color + hexAlpha;
        ctx.fill();
      }
      const sortedPlayers = [...gs2.players].sort(
        (a, b) => (a.alive ? 1 : 0) - (b.alive ? 1 : 0)
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
          Number(p.health)
        );
      }
      for (const ft of floatingTexts) {
        const s = worldToScreen(ft.x, ft.y, vp);
        const alpha = Math.max(0, ft.life / ft.maxLife);
        const hexAlpha = Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.font = `bold ${Math.round(12 + (1 - alpha) * 4)}px 'Geist Mono', monospace`;
        ctx.textAlign = "center";
        ctx.fillStyle = ft.color + hexAlpha;
        ctx.shadowColor = "#00000080";
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, s.x, s.y);
        ctx.shadowBlur = 0;
      }
      drawMinimap(
        ctx,
        w,
        h,
        MAP_SIZE,
        gs2.players,
        playerId ?? null,
        gs2.safeZone,
        gs2.loots.filter((l) => !l.claimed)
      );
      const mmX = w - 160 - 12 + 80;
      const mmLabelY = 12 + 160 + 14;
      ctx.font = "bold 8px 'Geist Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#e8c94a";
      const countdown = getSafeZoneCountdown(gs2.safeZone.nextShrinkTime);
      ctx.fillText(`SAFE ZONE CLOSING  ${countdown}`, mmX, mmLabelY);
      const alive = countAlive(gs2.players);
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
  const localPlayer = (gs == null ? void 0 : gs.players.find((p) => p.id === playerId)) ?? null;
  const inDanger = localPlayer && gs ? !isInSafeZone(localPlayer.x, localPlayer.y, gs.safeZone) : false;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: containerRef,
      className: "fixed inset-0 bg-background overflow-hidden",
      style: { cursor: "crosshair" },
      "data-ocid": "game.canvas_target",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "canvas",
          {
            ref: canvasRef,
            style: { cursor: "crosshair", display: "block" }
          }
        ),
        gs && localPlayer && /* @__PURE__ */ jsxRuntimeExports.jsx(HUD, { player: localPlayer, gameState: gs, playerId: playerId ?? null }),
        gs && /* @__PURE__ */ jsxRuntimeExports.jsx(KillFeed, { killFeed: gs.killFeed, playerId: playerId ?? null }),
        inDanger && /* @__PURE__ */ jsxRuntimeExports.jsx(ZoneWarning, {})
      ]
    }
  );
}
export {
  GameCanvas as default
};
