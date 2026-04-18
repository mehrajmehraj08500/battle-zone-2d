import { u as useActor, r as reactExports, a as useGameStore, b as useGameLoop, G as GamePhase, j as jsxRuntimeExports, c as createActor } from "./index-CEJ732-U.js";
function useDots(count) {
  const [dots] = reactExports.useState(
    () => Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      speedX: (Math.random() - 0.5) * 0.02,
      speedY: (Math.random() - 0.5) * 0.02
    }))
  );
  const [positions, setPositions] = reactExports.useState(
    dots.map((d) => ({ x: d.x, y: d.y }))
  );
  reactExports.useEffect(() => {
    let frame;
    const tick = () => {
      setPositions(
        (prev) => prev.map((pos, i) => ({
          x: (pos.x + dots[i].speedX + 100) % 100,
          y: (pos.y + dots[i].speedY + 100) % 100
        }))
      );
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [dots]);
  return dots.map((d, i) => ({ ...d, x: positions[i].x, y: positions[i].y }));
}
const SQUAD_CALLSIGNS = [
  "GHOST",
  "VIPER",
  "REAPER",
  "SHADOW",
  "WOLF",
  "HAWK",
  "COBRA",
  "TITAN"
];
function Lobby() {
  const { actor } = useActor(createActor);
  const [name, setName] = reactExports.useState("");
  const [sessionInput, setSessionInput] = reactExports.useState("");
  const [tab, setTab] = reactExports.useState("create");
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [createdSessionId, setCreatedSessionId] = reactExports.useState(null);
  const [copied, setCopied] = reactExports.useState(false);
  const [playerCount, setPlayerCount] = reactExports.useState(1);
  const nameInputRef = reactExports.useRef(null);
  const dots = useDots(40);
  const { setSessionId, setPlayerId, setPlayerName, setIsConnecting, phase } = useGameStore();
  useGameLoop();
  const suggestCallsign = () => {
    const pick = SQUAD_CALLSIGNS[Math.floor(Math.random() * SQUAD_CALLSIGNS.length)];
    const num = Math.floor(Math.random() * 99) + 1;
    setName(`${pick}_${num}`);
  };
  reactExports.useEffect(() => {
    if (!createdSessionId || !actor || phase !== GamePhase.Lobby) return;
    const interval = setInterval(async () => {
      try {
        const sid = BigInt(createdSessionId);
        const result = await actor.getGameState(sid);
        if (result.__kind__ === "ok") {
          setPlayerCount(result.ok.players.length);
        }
      } catch {
      }
    }, 2e3);
    return () => clearInterval(interval);
  }, [createdSessionId, actor, phase]);
  const copySessionId = async () => {
    if (!createdSessionId) return;
    await navigator.clipboard.writeText(createdSessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  const handleCreate = async () => {
    if (!actor || !name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setIsConnecting(true);
      const sid = await actor.createSession(name.trim());
      setSessionId(sid);
      setPlayerName(name.trim());
      const joinResult = await actor.joinSession(sid, name.trim());
      if (joinResult.__kind__ === "err") throw new Error(joinResult.err);
      setPlayerId(joinResult.ok);
      setCreatedSessionId(String(sid));
      setPlayerCount(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create session");
    } finally {
      setLoading(false);
      setIsConnecting(false);
    }
  };
  const handleJoin = async () => {
    if (!actor || !name.trim() || !sessionInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setIsConnecting(true);
      const sid = BigInt(sessionInput.trim());
      const joinResult = await actor.joinSession(sid, name.trim());
      if (joinResult.__kind__ === "err") throw new Error(joinResult.err);
      setSessionId(sid);
      setPlayerId(joinResult.ok);
      setPlayerName(name.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join session");
    } finally {
      setLoading(false);
      setIsConnecting(false);
    }
  };
  const handleStartWithBots = async () => {
    if (!actor || !name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setIsConnecting(true);
      let sid;
      if (createdSessionId) {
        sid = BigInt(createdSessionId);
      } else {
        sid = await actor.createSession(name.trim());
        setSessionId(sid);
        setPlayerName(name.trim());
        const joinResult = await actor.joinSession(sid, name.trim());
        if (joinResult.__kind__ === "err") throw new Error(joinResult.err);
        setPlayerId(joinResult.ok);
        setCreatedSessionId(String(sid));
      }
      const startResult = await actor.startGame(sid);
      if (startResult.__kind__ === "err") throw new Error(startResult.err);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start game");
    } finally {
      setLoading(false);
      setIsConnecting(false);
    }
  };
  const handleStartMultiplayer = async () => {
    if (!actor || !createdSessionId) return;
    setLoading(true);
    setError(null);
    try {
      const sid = BigInt(createdSessionId);
      const startResult = await actor.startGame(sid);
      if (startResult.__kind__ === "err") throw new Error(startResult.err);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start game");
    } finally {
      setLoading(false);
    }
  };
  const isSessionCreated = !!createdSessionId;
  const canStartMulti = isSessionCreated && playerCount >= 2;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: dots.map((dot) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute rounded-full bg-primary",
        style: {
          left: `${dot.x}%`,
          top: `${dot.y}%`,
          width: `${dot.size}px`,
          height: `${dot.size}px`,
          opacity: dot.opacity
        }
      },
      `dot-pos-${dot.x.toFixed(3)}-${dot.size}`
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-0 opacity-[0.04] pointer-events-none",
        style: {
          backgroundImage: "linear-gradient(rgba(232,201,74,1) 1px, transparent 1px), linear-gradient(90deg, rgba(232,201,74,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-0 pointer-events-none",
        style: {
          background: "linear-gradient(to bottom, transparent 0%, rgba(232,201,74,0.012) 50%, transparent 100%)",
          animation: "scan-line 4s linear infinite"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-primary/60" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-primary/60" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-primary/60" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-primary/60" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-accent animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-accent text-xs tracking-[0.3em]", children: "SYSTEM ONLINE" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-muted-foreground text-xs", children: "// " }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-muted-foreground text-xs", children: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", { hour12: false }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-col items-center gap-6 w-full max-w-md px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tactical-text text-muted-foreground tracking-[0.6em] text-xs mb-2", children: "▶ TACTICAL DEPLOYMENT SYSTEM" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "h1",
          {
            className: "font-display font-black uppercase tracking-tighter leading-none",
            style: {
              fontSize: "clamp(3rem, 8vw, 5rem)",
              color: "oklch(var(--primary))"
            },
            children: "WARZONE"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "tactical-text text-muted-foreground mt-1 tracking-[0.25em] text-xs", children: "BATTLE ROYALE · TOP-DOWN · MULTI-SQUAD" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hud-panel w-full p-6 flex flex-col gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex border border-border overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "lobby.create_tab",
              className: `flex-1 py-2.5 tactical-text text-xs transition-colors ${tab === "create" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`,
              onClick: () => {
                setTab("create");
                setCreatedSessionId(null);
              },
              children: "◆ NEW MATCH"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "lobby.join_tab",
              className: `flex-1 py-2.5 tactical-text text-xs transition-colors ${tab === "join" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`,
              onClick: () => {
                setTab("join");
                setCreatedSessionId(null);
              },
              children: "◆ JOIN SESSION"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: "lobby-name",
                className: "tactical-text text-muted-foreground text-xs",
                children: "CALLSIGN / OPERATOR ID"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: suggestCallsign,
                className: "tactical-text text-primary/70 hover:text-primary text-xs transition-colors",
                children: "[RANDOM]"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: nameInputRef,
              id: "lobby-name",
              "data-ocid": "lobby.name_input",
              className: "bg-black/60 border border-border text-foreground font-mono text-sm px-3 py-2.5 outline-none focus:border-primary transition-colors w-full placeholder:text-muted-foreground/40",
              placeholder: "Enter your callsign...",
              value: name,
              onChange: (e) => setName(e.target.value.toUpperCase()),
              maxLength: 20,
              autoComplete: "off"
            }
          )
        ] }),
        tab === "join" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              htmlFor: "lobby-session",
              className: "tactical-text text-muted-foreground text-xs",
              children: "SESSION ID"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "lobby-session",
              "data-ocid": "lobby.session_input",
              className: "bg-black/60 border border-border text-foreground font-mono text-sm px-3 py-2.5 outline-none focus:border-primary transition-colors w-full placeholder:text-muted-foreground/40",
              placeholder: "Paste session ID from host...",
              value: sessionInput,
              onChange: (e) => setSessionInput(e.target.value.trim())
            }
          )
        ] }),
        tab === "create" && isSessionCreated && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-primary/30 bg-primary/5 p-3 flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-muted-foreground text-xs", children: "SESSION ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-primary text-sm truncate", children: createdSessionId })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                "data-ocid": "lobby.copy_session_button",
                onClick: copySessionId,
                className: `tactical-text text-xs px-3 py-1.5 border transition-colors shrink-0 ${copied ? "border-accent text-accent" : "border-primary/50 text-primary hover:border-primary"}`,
                children: copied ? "✓ COPIED" : "COPY"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: Array.from({ length: 4 }, (_, i) => {
              const slotKey = `slot${i}`;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  "data-ocid": `lobby.player_slot.${i + 1}`,
                  className: `w-5 h-5 border ${i < playerCount ? "bg-primary border-primary" : "bg-transparent border-border"}`
                },
                slotKey
              );
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tactical-text text-muted-foreground text-xs", children: [
              playerCount,
              "/4 OPERATORS READY"
            ] }),
            !canStartMulti && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "tactical-text text-muted-foreground/50 text-xs", children: "— NEED 2+ TO START" })
          ] }),
          canStartMulti && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "lobby.start_multiplayer_button",
              className: "w-full py-2.5 bg-accent text-accent-foreground font-display font-bold text-sm tracking-widest uppercase hover:bg-accent/90 transition-colors disabled:opacity-50",
              onClick: handleStartMultiplayer,
              disabled: loading,
              children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pulse-tactical", children: "LAUNCHING..." }) : "▶ START MATCH"
            }
          )
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "p",
          {
            "data-ocid": "lobby.error_state",
            className: "tactical-text text-destructive text-xs flex items-center gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base leading-none", children: "⚠" }),
              error
            ]
          }
        ),
        tab === "create" && !isSessionCreated && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "lobby.primary_button",
            className: "w-full py-3 bg-primary text-primary-foreground font-display font-bold text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            onClick: handleCreate,
            disabled: loading || !name.trim(),
            children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pulse-tactical", children: "INITIALIZING..." }) : "◆ CREATE SESSION"
          }
        ),
        tab === "join" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "lobby.join_button",
            className: "w-full py-3 bg-primary text-primary-foreground font-display font-bold text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            onClick: handleJoin,
            disabled: loading || !name.trim() || !sessionInput.trim(),
            children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pulse-tactical", children: "DEPLOYING..." }) : "◆ JOIN BATTLE"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "lobby.solo_bots_button",
            className: "w-full py-2.5 bg-transparent border border-border text-muted-foreground font-display font-bold text-xs tracking-widest uppercase hover:border-primary hover:text-foreground transition-colors disabled:opacity-40",
            onClick: handleStartWithBots,
            disabled: loading || !name.trim(),
            children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pulse-tactical", children: "SPAWNING BOTS..." }) : "▶ SOLO PLAY vs BOTS"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hud-panel w-full px-4 py-3 grid grid-cols-3 gap-x-4 gap-y-1.5", children: [
        ["WASD", "MOVE"],
        ["MOUSE", "AIM"],
        ["LMB", "SHOOT"],
        ["F/E", "LOOT"],
        ["H", "HEAL"],
        ["TAB", "STATS"]
      ].map(([key, action]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "p",
        {
          className: "tactical-text text-muted-foreground text-xs",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: key }),
            " ",
            action
          ]
        },
        key
      )) }),
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
    ] })
  ] });
}
export {
  Lobby as default
};
