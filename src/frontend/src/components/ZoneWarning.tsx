import { useEffect, useRef, useState } from "react";

export default function ZoneWarning() {
  const [pulsePhase, setPulsePhase] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    const animate = () => {
      const elapsed = Date.now() - startRef.current;
      // Pulse at ~2Hz, intensify over time
      setPulsePhase(elapsed);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Pulsing red vignette intensity: 0.08 to 0.22
  const pulse = 0.5 + 0.5 * Math.sin(pulsePhase / 320);
  const vignetteAlpha = 0.08 + 0.14 * pulse;
  const borderAlpha = 0.3 + 0.4 * pulse;

  return (
    <>
      {/* Full-screen vignette flash */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(180, 0, 60, ${vignetteAlpha}) 100%)`,
          zIndex: 10,
        }}
        data-ocid="zone_warning.overlay"
      />

      {/* Animated border */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 80px rgba(180, 0, 60, ${borderAlpha}), inset 0 0 30px rgba(255, 30, 80, ${borderAlpha * 0.6})`,
          zIndex: 10,
        }}
      />

      {/* Warning banner */}
      <div
        className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none zone-warning-banner"
        style={{ zIndex: 20 }}
        data-ocid="zone_warning.banner"
      >
        <div
          className="flex flex-col items-center gap-1"
          style={{ opacity: 0.7 + 0.3 * pulse }}
        >
          {/* Danger icon */}
          <div
            className="w-8 h-8 flex items-center justify-center border-2"
            style={{
              borderColor: `rgba(255, 50, 80, ${0.6 + 0.4 * pulse})`,
              background: "rgba(180, 0, 40, 0.2)",
            }}
          >
            <span
              className="text-[14px] leading-none"
              style={{ color: "#ff3250" }}
            >
              !
            </span>
          </div>

          <div
            className="hud-panel px-4 py-1.5 text-center"
            style={{ borderColor: "rgba(255, 50, 80, 0.5)" }}
          >
            <p
              className="tactical-text text-[11px] font-bold"
              style={{ color: "#ff3250" }}
            >
              OUTSIDE SAFE ZONE
            </p>
            <p className="tactical-text text-[8px] text-foreground/50 mt-0.5">
              MOVE TO SAFE AREA — TAKING DAMAGE
            </p>
          </div>
        </div>
      </div>

      {/* Directional arrows pointing to safe zone center (top/bottom/left/right edges) */}
      <div
        className="fixed top-3 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ zIndex: 20, opacity: 0.4 + 0.4 * pulse }}
        data-ocid="zone_warning.arrow_top"
      >
        <div
          className="tactical-text text-[9px] px-2 py-0.5 flex items-center gap-1"
          style={{
            background: "rgba(180,0,40,0.3)",
            border: "1px solid rgba(255,50,80,0.4)",
            color: "#ff3250",
          }}
        >
          ▲ SAFE ZONE
        </div>
      </div>
    </>
  );
}
