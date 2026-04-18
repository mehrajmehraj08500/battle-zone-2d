# Design Brief

## Direction

Tactical Military HUD — A high-contrast, brutalist battle royale interface designed for intense gameplay clarity and tactical readout immersion.

## Tone

Raw brutalist military aesthetic — sharp angles, zero decoration, high contrast. Confidence through functional restraint; every pixel serves the game.

## Differentiation

HUD overlays as tactical readouts: scan-line minimap, broadcast-style kill feed, technical status bars. The game canvas dominates; UI is overlay only, never interrupts gameplay.

## Color Palette

| Token          | OKLCH         | Role                              |
| -------------- | ------------- | --------------------------------- |
| background     | 0.08 0 0      | Deep charcoal, game canvas base   |
| foreground     | 0.92 0 0      | Bright white, HUD text            |
| card           | 0.12 0.01 260 | Subtle panel backgrounds          |
| primary        | 0.65 0.24 50  | Bright tactical amber/yellow      |
| accent         | 0.72 0.2 155  | Muted olive-green, health status  |
| destructive    | 0.55 0.28 25  | Vivid red, kills/danger/alerts    |
| border         | 0.25 0.01 260 | Dark grey, panel edges            |

## Typography

- Display: Space Grotesk — sharp geometric sans, all-caps tactical labels and scoring
- Body: DM Sans — compact readouts, weapon names, ammo counts
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-xl font-bold tracking-wide`, tactical `text-xs font-mono uppercase tracking-widest`, body `text-sm`

## Elevation & Depth

Minimal shadow hierarchy. HUD panels use transparent dark backgrounds with thin borders and subtle backdrop blur; no elevation. Focus on contrast and border definition over depth effects.

## Structural Zones

| Zone           | Background         | Border                    | Notes                              |
| -------------- | ------------------ | ------------------------- | ---------------------------------- |
| Game Canvas    | black/0.08         | none                      | Full viewport, gameplay focus      |
| HUD Panels     | black/40 + blur    | foreground/20 thin        | Minimap, kill feed, status bars    |
| Lobby/Results  | card bg            | subtle border             | Centered modal overlays on canvas  |

## Spacing & Rhythm

Compact micro-spacing (4px base unit). HUD elements grouped in tight clusters; no breathing room—tactical density. Section gaps (16px) create hierarchy; panels use 8px internal padding for tight readouts.

## Component Patterns

- Buttons: sharp corners (`rounded-none`), primary yellow background, hover darkens. On secondary: thin border, no fill.
- Status Bars: flat design, 6px height, thin borders, solid fills (no gradients). Health=accent-green, armor=primary-yellow, ammo=muted.
- Badges: monospace labels, uppercase, minimal padding, tight tracking.

## Motion

- Entrance: scan-line wipe from top (minimap loads). Kill feed slides in from edge with fade.
- Hover: quick color shift (150ms), no scale. Tactical blips pulse gently on active waypoints.
- Decorative: scan-line effect on minimap (2s loop), subtle background pulsing on alerts.

## Constraints

- No rounded corners except for canvas safety zone indicators (minimal radius only).
- High contrast always (foreground/background 0.84 difference, primary/background 0.57). No low-contrast text.
- Minimal decorative shadows; focus on crisp borders and clean geometry.

## Signature Detail

Tactical scan-line animation on the minimap: a bright amber line sweeps top-to-bottom every 2 seconds, reinforcing the "radar" metaphor and adding controlled visual energy without distraction.
