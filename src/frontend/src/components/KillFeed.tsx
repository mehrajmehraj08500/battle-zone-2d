import { useEffect, useRef, useState } from "react";
import type { KillFeedEntry } from "../types/game";
import { getWeaponLabel } from "../utils/gameUtils";

interface KillFeedEntry2 extends KillFeedEntry {
  _key: string;
  _age: number; // ms since added
}

const MAX_ENTRIES = 6;
const FADE_AFTER_MS = 5000;
const REMOVE_AFTER_MS = 7000;

interface Props {
  killFeed: KillFeedEntry[];
  playerId: bigint | null;
}

export default function KillFeed({ killFeed, playerId }: Props) {
  const [entries, setEntries] = useState<KillFeedEntry2[]>([]);
  const prevLenRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect new kill feed entries and add them with age tracking
  useEffect(() => {
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
            _age: 0,
          })),
        ].slice(-MAX_ENTRIES);
        return next;
      });
    }
    prevLenRef.current = killFeed.length;
  }, [killFeed]);

  // Age the entries over time
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setEntries((prev) => {
        const now = Date.now();
        return prev
          .map((e) => ({
            ...e,
            _age: now - Number(String(e._key).split("_").pop()),
          }))
          .filter((e) => e._age < REMOVE_AFTER_MS);
      });
    }, 200);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (entries.length === 0) return null;

  return (
    <div
      className="absolute top-16 left-3 flex flex-col gap-1 pointer-events-none"
      data-ocid="killfeed.panel"
    >
      {entries.map((e, i) => {
        const isFading = e._age > FADE_AFTER_MS;
        const opacity = isFading
          ? Math.max(
              0,
              1 - (e._age - FADE_AFTER_MS) / (REMOVE_AFTER_MS - FADE_AFTER_MS),
            )
          : 1;
        const isMyKill = e.killerId === playerId;
        const isMyDeath = e.victimId === playerId;

        return (
          <div
            key={e._key}
            className="flex items-center gap-1.5 hud-panel px-2.5 py-1 transition-opacity duration-300"
            style={{ opacity }}
            data-ocid={`killfeed.item.${i + 1}`}
          >
            {/* Killer name */}
            <span
              className="tactical-text text-[10px] font-bold"
              style={{ color: isMyKill ? "#e8c94a" : "#e05050" }}
            >
              {e.killerName}
            </span>

            {/* Weapon tag */}
            <span className="tactical-text text-[8px] text-foreground/40 border border-foreground/15 px-1">
              {getWeaponLabel(e.weapon)}
            </span>

            {/* Victim name */}
            <span
              className="tactical-text text-[10px]"
              style={{ color: isMyDeath ? "#f44336" : "#999" }}
            >
              {e.victimName}
            </span>

            {/* Indicator if it involves local player */}
            {(isMyKill || isMyDeath) && (
              <span
                className="tactical-text text-[7px] px-1 font-bold"
                style={{
                  background: isMyKill ? "#e8c94a22" : "#f4433622",
                  color: isMyKill ? "#e8c94a" : "#f44336",
                  border: `1px solid ${isMyKill ? "#e8c94a44" : "#f4433644"}`,
                }}
              >
                {isMyKill ? "YOU" : "RIP"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
