import { useActor } from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";
import { createActor } from "../backend";
import type {
  LeaderboardEntryPublic,
  MatchResult,
  backendInterface,
} from "../backend";
import { useGameStore } from "../store/gameStore";
import { getWeaponLabel } from "../utils/gameUtils";

function formatSurvivalTime(seconds: bigint): string {
  const s = Number(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, "0")}`;
}

function PlacementBadge({ placement }: { placement: bigint }) {
  const n = Number(placement);
  const medals: Record<number, { label: string; cls: string }> = {
    1: { label: "#1 WINNER", cls: "text-primary border-primary bg-primary/10" },
    2: { label: "#2 PLACE", cls: "text-foreground border-border bg-muted/30" },
    3: {
      label: "#3 PLACE",
      cls: "text-[oklch(0.65_0.14_55)] border-[oklch(0.5_0.12_55)] bg-[oklch(0.65_0.14_55)]/10",
    },
  };
  const medal = medals[n] ?? {
    label: `#${n} PLACE`,
    cls: "text-muted-foreground border-border bg-transparent",
  };
  return (
    <span className={`tactical-text text-xs px-2 py-0.5 border ${medal.cls}`}>
      {medal.label}
    </span>
  );
}

export default function GameOver() {
  const { actor } = useActor<backendInterface>(createActor);
  const { gameState, playerName, playerId, sessionId, resetGame } =
    useGameStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryPublic[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchResult[]>([]);

  const localPlayer = gameState?.players.find((p) => p.id === playerId);
  const winner = gameState?.winner;
  const isWinner = winner === playerName;

  // Derive placement from kill feed / player list (rank by alive + kills)
  const playersSorted = [...(gameState?.players ?? [])].sort((a, b) => {
    if (a.alive !== b.alive) return a.alive ? -1 : 1;
    return Number(b.kills) - Number(a.kills);
  });
  const placement = BigInt(
    playersSorted.findIndex((p) => p.id === playerId) + 1 || 1,
  );
  const kills = localPlayer ? localPlayer.kills : 0n;
  const survivalSec = gameState ? gameState.matchTime / 1000n : 0n;

  useEffect(() => {
    if (!actor) return;
    actor
      .getLeaderboard()
      .then(setLeaderboard)
      .catch(() => {});
  }, [actor]);

  useEffect(() => {
    if (!actor || !sessionId) return;
    actor
      .getMatchHistory(sessionId)
      .then(setMatchHistory)
      .catch(() => {});
  }, [actor, sessionId]);

  // Background flicker for victory
  const bgClass = isWinner ? "bg-[oklch(0.08_0.015_50)]" : "bg-background";

  return (
    <div className={`fixed inset-0 ${bgClass} flex flex-col overflow-hidden`}>
      {/* Victory/Defeat animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isWinner ? (
          <>
            {/* Gold radial glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20"
              style={{
                background:
                  "radial-gradient(ellipse, oklch(0.65 0.24 50) 0%, transparent 70%)",
              }}
            />
            {/* Gold scan lines */}
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={`vline-pct-${(i + 1) * 14}`}
                className="absolute top-0 bottom-0 w-px opacity-10"
                style={{
                  left: `${(i + 1) * 14}%`,
                  background: "oklch(0.65 0.24 50)",
                }}
              />
            ))}
          </>
        ) : (
          <>
            {/* Red vignette for defeat */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 40%, oklch(0.3 0.2 25) 100%)",
              }}
            />
          </>
        )}
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,201,74,1) 1px, transparent 1px), linear-gradient(90deg, rgba(232,201,74,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-primary/50" />
      <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-primary/50" />
      <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-primary/50" />
      <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-primary/50" />

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto px-6 py-10">
          {/* Result banner */}
          <div className="text-center" data-ocid="gameover.result_banner">
            {isWinner ? (
              <>
                <div className="flex items-center justify-center gap-3 mb-1">
                  <div className="h-px w-16 bg-primary/60" />
                  <span className="tactical-text text-primary text-xs tracking-[0.5em]">
                    WINNER WINNER
                  </span>
                  <div className="h-px w-16 bg-primary/60" />
                </div>
                <h1
                  className="font-display font-black uppercase tracking-tighter"
                  style={{
                    fontSize: "clamp(2.5rem,7vw,4.5rem)",
                    color: "oklch(var(--primary))",
                  }}
                >
                  CHICKEN DINNER
                </h1>
                <p className="tactical-text text-primary/70 mt-1 tracking-widest text-xs pulse-tactical">
                  MISSION ACCOMPLISHED · OUTSTANDING PERFORMANCE
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-3 mb-1">
                  <div className="h-px w-12 bg-destructive/50" />
                  <span className="tactical-text text-destructive text-xs tracking-[0.4em]">
                    ELIMINATED
                  </span>
                  <div className="h-px w-12 bg-destructive/50" />
                </div>
                <h1
                  className="font-display font-black uppercase tracking-tighter"
                  style={{
                    fontSize: "clamp(2.2rem,6vw,3.8rem)",
                    color: "oklch(var(--foreground))",
                  }}
                >
                  MISSION FAILED
                </h1>
                {winner && (
                  <p className="tactical-text text-muted-foreground mt-1.5 text-xs tracking-widest">
                    SURVIVOR: <span className="text-primary">{winner}</span>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Stats trio */}
          <div
            className="hud-panel w-full p-5 grid grid-cols-3 gap-4"
            data-ocid="gameover.stats_panel"
          >
            {/* Placement */}
            <div className="flex flex-col items-center gap-2">
              <span
                className={`text-4xl font-black font-display ${isWinner ? "text-primary" : "text-foreground"}`}
              >
                #{String(placement)}
              </span>
              <PlacementBadge placement={placement} />
              <span className="tactical-text text-muted-foreground text-xs">
                PLACEMENT
              </span>
            </div>

            {/* Kills */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl font-black font-display text-destructive">
                {String(kills)}
              </span>
              <span className="tactical-text text-muted-foreground text-xs mt-2">
                ELIMINATIONS
              </span>
            </div>

            {/* Survival time */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-black font-display text-accent font-mono">
                {formatSurvivalTime(survivalSec)}
              </span>
              <span className="tactical-text text-muted-foreground text-xs mt-2">
                SURVIVED
              </span>
            </div>
          </div>

          {/* Final loadout */}
          {localPlayer && (
            <div
              className="hud-panel w-full px-5 py-3 flex items-center justify-between gap-4"
              data-ocid="gameover.loadout_panel"
            >
              <div className="flex flex-col gap-0.5">
                <span className="tactical-text text-muted-foreground text-xs">
                  FINAL WEAPON
                </span>
                <span className="font-mono font-bold text-primary">
                  {getWeaponLabel(localPlayer.weapon)}
                </span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="tactical-text text-muted-foreground text-xs">
                  HP
                </span>
                <span className="font-mono font-bold text-foreground">
                  {String(localPlayer.health)}
                </span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="tactical-text text-muted-foreground text-xs">
                  ARMOR
                </span>
                <span className="font-mono font-bold text-foreground">
                  {String(localPlayer.armor)}
                </span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="tactical-text text-muted-foreground text-xs">
                  AMMO
                </span>
                <span className="font-mono font-bold text-foreground">
                  {String(localPlayer.ammo)}
                </span>
              </div>
            </div>
          )}

          {/* Match history */}
          {matchHistory.length > 0 && (
            <div
              className="hud-panel w-full p-4"
              data-ocid="gameover.match_history"
            >
              <p className="tactical-text text-primary mb-3 tracking-widest text-xs">
                MATCH HISTORY (LAST 5)
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      {["MATCH", "PLACEMENT", "KILLS", "TIME"].map((h) => (
                        <th
                          key={h}
                          className="tactical-text text-muted-foreground text-xs pb-1.5 pr-4 font-normal"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matchHistory.slice(0, 5).map((m, i) => (
                      <tr
                        key={String(m.matchId)}
                        data-ocid={`gameover.match_history.item.${i + 1}`}
                        className="border-b border-border/30 last:border-0"
                      >
                        <td className="tactical-text text-muted-foreground text-xs py-1.5 pr-4">
                          #{String(m.matchId).slice(-4)}
                        </td>
                        <td className="tactical-text text-xs py-1.5 pr-4">
                          <span
                            className={
                              Number(m.placement) === 1
                                ? "text-primary"
                                : "text-foreground"
                            }
                          >
                            #{String(m.placement)}
                          </span>
                        </td>
                        <td className="tactical-text text-xs py-1.5 pr-4 text-destructive font-mono">
                          {String(m.kills)}
                        </td>
                        <td className="tactical-text text-xs py-1.5 font-mono text-muted-foreground">
                          {formatSurvivalTime(m.survivalTime / 1000n)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Global leaderboard */}
          {leaderboard.length > 0 && (
            <div
              className="hud-panel w-full p-4"
              data-ocid="gameover.leaderboard"
            >
              <p className="tactical-text text-primary mb-3 tracking-widest text-xs">
                ◆ GLOBAL LEADERBOARD
              </p>
              <div className="flex flex-col gap-0.5">
                {leaderboard.slice(0, 10).map((entry, i) => (
                  <div
                    key={entry.playerName}
                    data-ocid={`gameover.leaderboard.item.${i + 1}`}
                    className={`flex items-center justify-between py-1.5 px-2 transition-colors ${
                      entry.playerName === playerName
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`tactical-text text-xs w-5 text-right ${
                          i === 0
                            ? "text-primary font-bold"
                            : i === 1
                              ? "text-foreground"
                              : "text-muted-foreground"
                        }`}
                      >
                        {i === 0
                          ? "①"
                          : i === 1
                            ? "②"
                            : i === 2
                              ? "③"
                              : `${i + 1}`}
                      </span>
                      <span
                        className={`font-mono text-sm ${
                          entry.playerName === playerName
                            ? "text-primary font-bold"
                            : "text-foreground"
                        }`}
                      >
                        {entry.playerName}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <span className="tactical-text text-muted-foreground text-xs font-mono">
                        {String(entry.kills)}K
                      </span>
                      <span className="tactical-text text-muted-foreground text-xs font-mono">
                        {String(entry.wins)}W
                      </span>
                      <span className="tactical-text text-muted-foreground text-xs font-mono">
                        {String(entry.gamesPlayed)}G
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 w-full" data-ocid="gameover.actions">
            <button
              type="button"
              data-ocid="gameover.play_again_button"
              className="flex-1 py-3.5 bg-primary text-primary-foreground font-display font-bold text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors"
              onClick={resetGame}
            >
              ▶ DEPLOY AGAIN
            </button>
            <button
              type="button"
              data-ocid="gameover.lobby_button"
              className="flex-1 py-3.5 bg-transparent border border-border text-muted-foreground font-display font-bold text-sm tracking-widest uppercase hover:border-foreground hover:text-foreground transition-colors"
              onClick={resetGame}
            >
              ◀ MAIN MENU
            </button>
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
    </div>
  );
}
