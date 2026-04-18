import { u as useActor, a as useGameStore, r as reactExports, j as jsxRuntimeExports, g as getWeaponLabel, c as createActor } from "./index-CEJ732-U.js";
function formatSurvivalTime(seconds) {
  const s = Number(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, "0")}`;
}
function PlacementBadge({ placement }) {
  const n = Number(placement);
  const medals = {
    1: { label: "#1 WINNER", cls: "text-primary border-primary bg-primary/10" },
    2: { label: "#2 PLACE", cls: "text-foreground border-border bg-muted/30" },
    3: {
      label: "#3 PLACE",
      cls: "text-[oklch(0.65_0.14_55)] border-[oklch(0.5_0.12_55)] bg-[oklch(0.65_0.14_55)]/10"
    }
  };
  const medal = medals[n] ?? {
    label: `#${n} PLACE`,
    cls: "text-muted-foreground border-border bg-transparent"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `tactical-text text-xs px-2 py-0.5 border ${medal.cls}`, children: medal.label });
}
function GameOver() {
  const { actor } = useActor(createActor);
  const { gameState, playerName, playerId, sessionId, resetGame } = useGameStore();
  const [leaderboard, setLeaderboard] = reactExports.useState([]);
  const [matchHistory, setMatchHistory] = reactExports.useState([]);
  const localPlayer = gameState == null ? void 0 : gameState.players.find((p) => p.id === playerId);
  const winner = gameState == null ? void 0 : gameState.winner;
  const isWinner = winner === playerName;
  const playersSorted = [...(gameState == null ? void 0 : gameState.players) ?? []].sort((a, b) => {
    if (a.alive !== b.alive) return a.alive ? -1 : 1;
    return Number(b.kills) - Number(a.kills);
  });
  const placement = BigInt(
    playersSorted.findIndex((p) => p.id === playerId) + 1 || 1
  );
  const kills = localPlayer ? localPlayer.kills : 0n;
  const survivalSec = gameState ? gameState.matchTime / 1000n : 0n;
  reactExports.useEffect(() => {
    if (!actor) return;
    actor.getLeaderboard().then(setLeaderboard).catch(() => {
    });
  }, [actor]);
  reactExports.useEffect(() => {
    if (!actor || !sessionId) return;
    actor.getMatchHistory(sessionId).then(setMatchHistory).catch(() => {
    });
  }, [actor, sessionId]);
  const bgClass = isWinner ? "bg-[oklch(0.08_0.015_50)]" : "bg-background";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `fixed inset-0 ${bgClass} flex flex-col overflow-hidden`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [
      isWinner ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20",
            style: {
              background: "radial-gradient(ellipse, oklch(0.65 0.24 50) 0%, transparent 70%)"
            }
          }
        ),
        Array.from({ length: 6 }, (_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute top-0 bottom-0 w-px opacity-10",
            style: {
              left: `${(i + 1) * 14}%`,
              background: "oklch(0.65 0.24 50)"
            }
          },
          `vline-pct-${(i + 1) * 14}`
        ))
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute inset-0 opacity-15",
          style: {
            background: "radial-gradient(ellipse at center, transparent 40%, oklch(0.3 0.2 25) 100%)"
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute inset-0 opacity-[0.035]",
          style: {
            backgroundImage: "linear-gradient(rgba(232,201,74,1) 1px, transparent 1px), linear-gradient(90deg, rgba(232,201,74,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-primary/50" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-primary/50" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-primary/50" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-primary/50" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-5 w-full max-w-2xl mx-auto px-6 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", "data-ocid": "gameover.result_banner", children: isWinner ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-16 bg-primary/60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-primary text-xs tracking-[0.5em]", children: "WINNER WINNER" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-16 bg-primary/60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h1",
          {
            className: "font-display font-black uppercase tracking-tighter",
            style: {
              fontSize: "clamp(2.5rem,7vw,4.5rem)",
              color: "oklch(var(--primary))"
            },
            children: "CHICKEN DINNER"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "tactical-text text-primary/70 mt-1 tracking-widest text-xs pulse-tactical", children: "MISSION ACCOMPLISHED · OUTSTANDING PERFORMANCE" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-12 bg-destructive/50" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-destructive text-xs tracking-[0.4em]", children: "ELIMINATED" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-12 bg-destructive/50" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h1",
          {
            className: "font-display font-black uppercase tracking-tighter",
            style: {
              fontSize: "clamp(2.2rem,6vw,3.8rem)",
              color: "oklch(var(--foreground))"
            },
            children: "MISSION FAILED"
          }
        ),
        winner && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "tactical-text text-muted-foreground mt-1.5 text-xs tracking-widest", children: [
          "SURVIVOR: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: winner })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "hud-panel w-full p-5 grid grid-cols-3 gap-4",
          "data-ocid": "gameover.stats_panel",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: `text-4xl font-black font-display ${isWinner ? "text-primary" : "text-foreground"}`,
                  children: [
                    "#",
                    String(placement)
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PlacementBadge, { placement }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-muted-foreground text-xs", children: "PLACEMENT" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl font-black font-display text-destructive", children: String(kills) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-muted-foreground text-xs mt-2", children: "ELIMINATIONS" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-black font-display text-accent font-mono", children: formatSurvivalTime(survivalSec) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-muted-foreground text-xs mt-2", children: "SURVIVED" })
            ] })
          ]
        }
      ),
      localPlayer && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "hud-panel w-full px-5 py-3 flex items-center justify-between gap-4",
          "data-ocid": "gameover.loadout_panel",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-muted-foreground text-xs", children: "FINAL WEAPON" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold text-primary", children: getWeaponLabel(localPlayer.weapon) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-muted-foreground text-xs", children: "HP" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold text-foreground", children: String(localPlayer.health) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-muted-foreground text-xs", children: "ARMOR" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold text-foreground", children: String(localPlayer.armor) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-muted-foreground text-xs", children: "AMMO" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold text-foreground", children: String(localPlayer.ammo) })
            ] })
          ]
        }
      ),
      matchHistory.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "hud-panel w-full p-4",
          "data-ocid": "gameover.match_history",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "tactical-text text-primary mb-3 tracking-widest text-xs", children: "MATCH HISTORY (LAST 5)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b border-border", children: ["MATCH", "PLACEMENT", "KILLS", "TIME"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "th",
                {
                  className: "tactical-text text-muted-foreground text-xs pb-1.5 pr-4 font-normal",
                  children: h
                },
                h
              )) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: matchHistory.slice(0, 5).map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "tr",
                {
                  "data-ocid": `gameover.match_history.item.${i + 1}`,
                  className: "border-b border-border/30 last:border-0",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "tactical-text text-muted-foreground text-xs py-1.5 pr-4", children: [
                      "#",
                      String(m.matchId).slice(-4)
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "tactical-text text-xs py-1.5 pr-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "span",
                      {
                        className: Number(m.placement) === 1 ? "text-primary" : "text-foreground",
                        children: [
                          "#",
                          String(m.placement)
                        ]
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "tactical-text text-xs py-1.5 pr-4 text-destructive font-mono", children: String(m.kills) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "tactical-text text-xs py-1.5 font-mono text-muted-foreground", children: formatSurvivalTime(m.survivalTime / 1000n) })
                  ]
                },
                String(m.matchId)
              )) })
            ] }) })
          ]
        }
      ),
      leaderboard.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "hud-panel w-full p-4",
          "data-ocid": "gameover.leaderboard",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "tactical-text text-primary mb-3 tracking-widest text-xs", children: "◆ GLOBAL LEADERBOARD" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-0.5", children: leaderboard.slice(0, 10).map((entry, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                "data-ocid": `gameover.leaderboard.item.${i + 1}`,
                className: `flex items-center justify-between py-1.5 px-2 transition-colors ${entry.playerName === playerName ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/20"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `tactical-text text-xs w-5 text-right ${i === 0 ? "text-primary font-bold" : i === 1 ? "text-foreground" : "text-muted-foreground"}`,
                        children: i === 0 ? "①" : i === 1 ? "②" : i === 2 ? "③" : `${i + 1}`
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `font-mono text-sm ${entry.playerName === playerName ? "text-primary font-bold" : "text-foreground"}`,
                        children: entry.playerName
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tactical-text text-muted-foreground text-xs font-mono", children: [
                      String(entry.kills),
                      "K"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tactical-text text-muted-foreground text-xs font-mono", children: [
                      String(entry.wins),
                      "W"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tactical-text text-muted-foreground text-xs font-mono", children: [
                      String(entry.gamesPlayed),
                      "G"
                    ] })
                  ] })
                ]
              },
              entry.playerName
            )) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 w-full", "data-ocid": "gameover.actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "gameover.play_again_button",
            className: "flex-1 py-3.5 bg-primary text-primary-foreground font-display font-bold text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors",
            onClick: resetGame,
            children: "▶ DEPLOY AGAIN"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "gameover.lobby_button",
            className: "flex-1 py-3.5 bg-transparent border border-border text-muted-foreground font-display font-bold text-sm tracking-widest uppercase hover:border-foreground hover:text-foreground transition-colors",
            onClick: resetGame,
            children: "◀ MAIN MENU"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "tactical-text text-muted-foreground/40 text-xs", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " · Built with love using",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`,
            className: "text-primary/60 hover:text-primary transition-colors",
            target: "_blank",
            rel: "noreferrer",
            children: "caffeine.ai"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  GameOver as default
};
