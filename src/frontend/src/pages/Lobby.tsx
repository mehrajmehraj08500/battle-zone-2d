import { useActor } from "@caffeineai/core-infrastructure";
import { useEffect, useRef, useState } from "react";
import { createActor } from "../backend";
import type { backendInterface } from "../backend";
import { GamePhase } from "../backend";
import { useGameLoop } from "../hooks/useGameLoop";
import { useGameStore } from "../store/gameStore";

// Animated particle dot for background
interface Dot {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
}

function useDots(count: number) {
  const [dots] = useState<Dot[]>(() =>
    Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      speedX: (Math.random() - 0.5) * 0.02,
      speedY: (Math.random() - 0.5) * 0.02,
    })),
  );
  const [positions, setPositions] = useState(
    dots.map((d) => ({ x: d.x, y: d.y })),
  );

  useEffect(() => {
    let frame: number;
    const tick = () => {
      setPositions((prev) =>
        prev.map((pos, i) => ({
          x: (pos.x + dots[i].speedX + 100) % 100,
          y: (pos.y + dots[i].speedY + 100) % 100,
        })),
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
  "TITAN",
];

export default function Lobby() {
  const { actor } = useActor<backendInterface>(createActor);
  const [name, setName] = useState("");
  const [sessionInput, setSessionInput] = useState("");
  const [tab, setTab] = useState<"create" | "join">("create");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [playerCount, setPlayerCount] = useState(1);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const dots = useDots(40);

  const { setSessionId, setPlayerId, setPlayerName, setIsConnecting, phase } =
    useGameStore();

  // Activate game loop (no-op in Lobby)
  useGameLoop();

  // Random callsign suggestion
  const suggestCallsign = () => {
    const pick =
      SQUAD_CALLSIGNS[Math.floor(Math.random() * SQUAD_CALLSIGNS.length)];
    const num = Math.floor(Math.random() * 99) + 1;
    setName(`${pick}_${num}`);
  };

  // Poll player count for active session
  useEffect(() => {
    if (!createdSessionId || !actor || phase !== GamePhase.Lobby) return;
    const interval = setInterval(async () => {
      try {
        const sid = BigInt(createdSessionId);
        const result = await actor.getGameState(sid);
        if (result.__kind__ === "ok") {
          setPlayerCount(result.ok.players.length);
        }
      } catch {
        /* silent */
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [createdSessionId, actor, phase]);

  const copySessionId = async () => {
    if (!createdSessionId) return;
    await navigator.clipboard.writeText(createdSessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      let sid: bigint;
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

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Animated dot field */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {dots.map((dot) => (
          <div
            key={`dot-pos-${dot.x.toFixed(3)}-${dot.size}`}
            className="absolute rounded-full bg-primary"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              opacity: dot.opacity,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,201,74,1) 1px, transparent 1px), linear-gradient(90deg, rgba(232,201,74,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Scan line */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(232,201,74,0.012) 50%, transparent 100%)",
          animation: "scan-line 4s linear infinite",
        }}
      />

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-primary/60" />
      <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-primary/60" />
      <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-primary/60" />
      <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-primary/60" />

      {/* Status strip */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="tactical-text text-accent text-xs tracking-[0.3em]">
          SYSTEM ONLINE
        </span>
        <span className="tactical-text text-muted-foreground text-xs">
          {"// "}
        </span>
        <span className="tactical-text text-muted-foreground text-xs">
          {new Date().toLocaleTimeString("en-US", { hour12: false })}
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md px-6">
        {/* Title block */}
        <div className="text-center">
          <div className="tactical-text text-muted-foreground tracking-[0.6em] text-xs mb-2">
            ▶ TACTICAL DEPLOYMENT SYSTEM
          </div>
          <h1
            className="font-display font-black uppercase tracking-tighter leading-none"
            style={{
              fontSize: "clamp(3rem, 8vw, 5rem)",
              color: "oklch(var(--primary))",
            }}
          >
            WARZONE
          </h1>
          <p className="tactical-text text-muted-foreground mt-1 tracking-[0.25em] text-xs">
            BATTLE ROYALE · TOP-DOWN · MULTI-SQUAD
          </p>
        </div>

        {/* Main panel */}
        <div className="hud-panel w-full p-6 flex flex-col gap-5">
          {/* Tab row */}
          <div className="flex border border-border overflow-hidden">
            <button
              type="button"
              data-ocid="lobby.create_tab"
              className={`flex-1 py-2.5 tactical-text text-xs transition-colors ${
                tab === "create"
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setTab("create");
                setCreatedSessionId(null);
              }}
            >
              ◆ NEW MATCH
            </button>
            <button
              type="button"
              data-ocid="lobby.join_tab"
              className={`flex-1 py-2.5 tactical-text text-xs transition-colors ${
                tab === "join"
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                setTab("join");
                setCreatedSessionId(null);
              }}
            >
              ◆ JOIN SESSION
            </button>
          </div>

          {/* Callsign input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="lobby-name"
                className="tactical-text text-muted-foreground text-xs"
              >
                CALLSIGN / OPERATOR ID
              </label>
              <button
                type="button"
                onClick={suggestCallsign}
                className="tactical-text text-primary/70 hover:text-primary text-xs transition-colors"
              >
                [RANDOM]
              </button>
            </div>
            <input
              ref={nameInputRef}
              id="lobby-name"
              data-ocid="lobby.name_input"
              className="bg-black/60 border border-border text-foreground font-mono text-sm px-3 py-2.5 outline-none focus:border-primary transition-colors w-full placeholder:text-muted-foreground/40"
              placeholder="Enter your callsign..."
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              maxLength={20}
              autoComplete="off"
            />
          </div>

          {/* Session ID (join) */}
          {tab === "join" && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="lobby-session"
                className="tactical-text text-muted-foreground text-xs"
              >
                SESSION ID
              </label>
              <input
                id="lobby-session"
                data-ocid="lobby.session_input"
                className="bg-black/60 border border-border text-foreground font-mono text-sm px-3 py-2.5 outline-none focus:border-primary transition-colors w-full placeholder:text-muted-foreground/40"
                placeholder="Paste session ID from host..."
                value={sessionInput}
                onChange={(e) => setSessionInput(e.target.value.trim())}
              />
            </div>
          )}

          {/* Created session panel */}
          {tab === "create" && isSessionCreated && (
            <div className="border border-primary/30 bg-primary/5 p-3 flex flex-col gap-3">
              {/* Session ID share row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="tactical-text text-muted-foreground text-xs">
                    SESSION ID
                  </span>
                  <span className="font-mono text-primary text-sm truncate">
                    {createdSessionId}
                  </span>
                </div>
                <button
                  type="button"
                  data-ocid="lobby.copy_session_button"
                  onClick={copySessionId}
                  className={`tactical-text text-xs px-3 py-1.5 border transition-colors shrink-0 ${
                    copied
                      ? "border-accent text-accent"
                      : "border-primary/50 text-primary hover:border-primary"
                  }`}
                >
                  {copied ? "✓ COPIED" : "COPY"}
                </button>
              </div>

              {/* Player count */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: 4 }, (_, i) => {
                    const slotKey = `slot${i}`;
                    return (
                      <div
                        key={slotKey}
                        data-ocid={`lobby.player_slot.${i + 1}`}
                        className={`w-5 h-5 border ${
                          i < playerCount
                            ? "bg-primary border-primary"
                            : "bg-transparent border-border"
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="tactical-text text-muted-foreground text-xs">
                  {playerCount}/4 OPERATORS READY
                </span>
                {!canStartMulti && (
                  <span className="tactical-text text-muted-foreground/50 text-xs">
                    — NEED 2+ TO START
                  </span>
                )}
              </div>

              {/* Multiplayer start (only if 2+ players) */}
              {canStartMulti && (
                <button
                  type="button"
                  data-ocid="lobby.start_multiplayer_button"
                  className="w-full py-2.5 bg-accent text-accent-foreground font-display font-bold text-sm tracking-widest uppercase hover:bg-accent/90 transition-colors disabled:opacity-50"
                  onClick={handleStartMultiplayer}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="pulse-tactical">LAUNCHING...</span>
                  ) : (
                    "▶ START MATCH"
                  )}
                </button>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <p
              data-ocid="lobby.error_state"
              className="tactical-text text-destructive text-xs flex items-center gap-1.5"
            >
              <span className="text-base leading-none">⚠</span>
              {error}
            </p>
          )}

          {/* Primary CTA */}
          {tab === "create" && !isSessionCreated && (
            <button
              type="button"
              data-ocid="lobby.primary_button"
              className="w-full py-3 bg-primary text-primary-foreground font-display font-bold text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreate}
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <span className="pulse-tactical">INITIALIZING...</span>
              ) : (
                "◆ CREATE SESSION"
              )}
            </button>
          )}

          {tab === "join" && (
            <button
              type="button"
              data-ocid="lobby.join_button"
              className="w-full py-3 bg-primary text-primary-foreground font-display font-bold text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleJoin}
              disabled={loading || !name.trim() || !sessionInput.trim()}
            >
              {loading ? (
                <span className="pulse-tactical">DEPLOYING...</span>
              ) : (
                "◆ JOIN BATTLE"
              )}
            </button>
          )}

          {/* Solo/Bot play */}
          <button
            type="button"
            data-ocid="lobby.solo_bots_button"
            className="w-full py-2.5 bg-transparent border border-border text-muted-foreground font-display font-bold text-xs tracking-widest uppercase hover:border-primary hover:text-foreground transition-colors disabled:opacity-40"
            onClick={handleStartWithBots}
            disabled={loading || !name.trim()}
          >
            {loading ? (
              <span className="pulse-tactical">SPAWNING BOTS...</span>
            ) : (
              "▶ SOLO PLAY vs BOTS"
            )}
          </button>
        </div>

        {/* Controls grid */}
        <div className="hud-panel w-full px-4 py-3 grid grid-cols-3 gap-x-4 gap-y-1.5">
          {[
            ["WASD", "MOVE"],
            ["MOUSE", "AIM"],
            ["LMB", "SHOOT"],
            ["F/E", "LOOT"],
            ["H", "HEAL"],
            ["TAB", "STATS"],
          ].map(([key, action]) => (
            <p
              key={key}
              className="tactical-text text-muted-foreground text-xs"
            >
              <span className="text-primary">{key}</span> {action}
            </p>
          ))}
        </div>

        <p className="tactical-text text-muted-foreground/40 text-xs">
          © {new Date().getFullYear()} · Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary/60 hover:text-primary transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
