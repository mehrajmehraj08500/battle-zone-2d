import type { GameState, PlayerPublic } from "../types/game";
import {
  countAlive,
  formatMatchTime,
  getArmorLabel,
  getWeaponFireMode,
  getWeaponLabel,
} from "../utils/gameUtils";

interface HUDProps {
  player: PlayerPublic;
  gameState: GameState;
  playerId: bigint | null;
}

function StatBar({
  value,
  max,
  color,
  label,
  current,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  current: string;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div
      className="flex flex-col gap-0.5"
      data-ocid={`hud.${label.toLowerCase()}_bar`}
    >
      <div className="flex justify-between items-center">
        <span className="tactical-text text-[9px] text-foreground/70">
          {label}
        </span>
        <span className="tactical-text text-[9px] text-foreground/50">
          {current}
        </span>
      </div>
      <div className="h-1.5 bg-black/60 border border-white/10 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-150"
          style={{ width: `${pct * 100}%`, background: color }}
        />
        {/* Scanline effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0, transparent 4px, rgba(255,255,255,0.08) 4px, rgba(255,255,255,0.08) 5px)",
          }}
        />
      </div>
    </div>
  );
}

export default function HUD({ player, gameState, playerId }: HUDProps) {
  const hp = Math.max(0, Math.min(100, Number(player.health)));
  const ar = Math.max(0, Math.min(100, Number(player.armor)));
  const ammo = Number(player.ammo);
  const kills = Number(player.kills);
  const alive = countAlive(gameState.players);
  const matchTime = formatMatchTime(gameState.matchTime);
  const weaponLabel = getWeaponLabel(player.weapon);
  const fireMode = getWeaponFireMode(player.weapon);

  // Health color
  const hpColor = hp > 50 ? "#4caf50" : hp > 25 ? "#ffc107" : "#f44336";

  // Weapon color
  const weaponColors: Record<string, string> = {
    Rifle: "#e8c94a",
    Sniper: "#7ebce6",
    Shotgun: "#e07c3a",
    Pistol: "#b0b8c0",
  };
  const wColor = weaponColors[String(player.weapon)] ?? "#e8c94a";

  const myKills = gameState.players.find((p) => p.id === playerId)?.kills ?? 0n;

  return (
    <>
      {/* ─── Top-center: timer + stats ─── */}
      <div
        className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 pointer-events-none"
        data-ocid="hud.timer_panel"
      >
        <div className="hud-panel px-4 py-1 flex items-center gap-4">
          <span className="tactical-text text-[10px] text-foreground/50">
            TIME
          </span>
          <span className="tactical-text text-sm text-primary font-bold tracking-widest">
            {matchTime}
          </span>
        </div>
        <div className="hud-panel px-3 py-0.5 flex items-center gap-3">
          <span className="tactical-text text-[9px] text-foreground/50">
            ALIVE
          </span>
          <span className="tactical-text text-[10px] text-foreground">
            {alive}
          </span>
          <span className="tactical-text text-[9px] text-foreground/30">│</span>
          <span className="tactical-text text-[9px] text-foreground/50">
            KILLS
          </span>
          <span className="tactical-text text-[10px] text-primary font-bold">
            {Number(myKills)}
          </span>
        </div>
      </div>

      {/* ─── Bottom HUD ─── */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-stretch gap-0 pointer-events-none"
        style={{ minWidth: 420 }}
        data-ocid="hud.bottom_panel"
      >
        {/* Health + Armor */}
        <div className="hud-panel px-4 py-3 flex flex-col justify-center gap-2.5 min-w-[200px]">
          <StatBar
            value={hp}
            max={100}
            color={hpColor}
            label="HEALTH"
            current={`${hp}/100`}
          />
          <StatBar
            value={ar}
            max={100}
            color="#7ebce6"
            label="ARMOR"
            current={`${ar}/100`}
          />
        </div>

        {/* Armor tier + gear */}
        <div
          className="hud-panel border-l-0 px-3 py-3 flex flex-col justify-center gap-1 min-w-[110px]"
          data-ocid="hud.gear_panel"
        >
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 border border-blue-400/50 bg-blue-900/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-400/70" />
            </div>
            <span className="tactical-text text-[9px] text-blue-300/80">
              {getArmorLabel(
                player.armor > 66n
                  ? "Heavy"
                  : player.armor > 33n
                    ? "Medium"
                    : "Light",
              )}{" "}
              Vest
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 border border-blue-400/50 bg-blue-900/30 flex items-center justify-center">
              <div className="w-1.5 h-1 bg-blue-400/70" />
            </div>
            <span className="tactical-text text-[9px] text-blue-300/80">
              {getArmorLabel(player.armor > 50n ? "Medium" : "Light")} Helmet
            </span>
          </div>
        </div>

        {/* Weapon panel */}
        <div
          className="hud-panel border-l-0 px-4 py-3 flex flex-col justify-between min-w-[140px]"
          data-ocid="hud.weapon_panel"
        >
          <div className="flex items-center justify-between">
            <span
              className="tactical-text text-[11px] font-bold"
              style={{ color: wColor }}
            >
              {weaponLabel}
            </span>
            <div
              className="px-1.5 py-0.5 text-[8px] font-bold font-mono"
              style={{ background: wColor, color: "#111" }}
            >
              {fireMode}
            </div>
          </div>

          {/* Ammo display */}
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-mono font-bold text-2xl leading-none"
              style={{ color: ammo < 6 ? "#f44336" : "#e8e8e8" }}
            >
              {ammo}
            </span>
            <span className="tactical-text text-[9px] text-foreground/40">
              / 180
            </span>
          </div>

          {/* Bullet pip row */}
          <div className="flex gap-0.5 flex-wrap" style={{ maxWidth: 120 }}>
            {Array.from({ length: Math.min(ammo, 30) }, (_, i) => {
              const pipKey = `pip${i}`;
              return (
                <div
                  key={pipKey}
                  className="w-1 h-2"
                  style={{ background: wColor, opacity: 0.7 }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Kills badge (top right of kills display) ─── */}
      {kills > 0 && (
        <div
          className="absolute top-16 right-4 hud-panel px-3 py-1.5 flex flex-col items-center pointer-events-none"
          data-ocid="hud.kills_badge"
        >
          <span className="tactical-text text-[8px] text-foreground/50">
            KILLS
          </span>
          <span className="font-mono font-bold text-2xl text-primary leading-none">
            {kills}
          </span>
        </div>
      )}

      {/* ─── Controls hint (bottom right) ─── */}
      <div
        className="absolute bottom-3 right-3 hud-panel px-2.5 py-2 pointer-events-none opacity-50"
        data-ocid="hud.controls_hint"
      >
        <div className="flex flex-col gap-0.5">
          {[
            ["WASD", "MOVE"],
            ["MOUSE", "AIM/SHOOT"],
            ["F/E", "PICKUP"],
            ["H", "HEAL"],
          ].map(([key, action]) => (
            <div key={key} className="flex gap-2 items-center">
              <span className="tactical-text text-[7px] text-primary bg-primary/10 px-1">
                {key}
              </span>
              <span className="tactical-text text-[7px] text-foreground/40">
                {action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
