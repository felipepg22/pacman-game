# Pac Mano

An original desktop-browser maze-chase game. Collect every pellet across three authored mazes, outsmart four ghost personalities, and finish a campaign with three shared lives.

## Run locally

Requires Node.js 20.18+ (verified with 20.18.1) and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. No account, backend, or external assets are needed. Keyboard controls: **arrows or WASD** to steer; **Escape or P** to pause and resume. Menus support Tab and Enter. Leaving the browser pauses play and requires explicit resume. Restart begins a new campaign; sound preference persists locally.

## Build

```sh
npm run build
npm run preview
```

The static production output is in `dist/`. Serve it over HTTP rather than opening `index.html` through `file://`. The game uses TypeScript, Canvas 2D, accessible HTML controls, and synthesized Web Audio effects. The runtime has no framework dependencies.

## Rules

Normal pellets award 10 points; power pellets award 50 and frighten ghosts for eight seconds, with a warning in the final two. Ghost captures award 200, 400, 800, then 1,600 points. Another power pellet resets the timer and chain.

Returning eyes are harmless and cannot be eaten. At the pen they immediately become dangerous, even while the earlier power effect remains active. A fresh power pellet can frighten a regenerated ghost. Being caught preserves score and collected pellets, resets positions, and clears power. The final pellet wins over a simultaneous dangerous contact.

Best score is saved when a campaign ends in victory or game over. Restarting an unfinished campaign does not save that score. Storage or audio restrictions do not prevent play.

## Verification

```sh
npm test
npm run typecheck
npm run build
npm run browsers:install
npm run test:browser
npm run playtest
```

Browser checks use Chromium, Firefox, and WebKit, one at a time. Add `-- --headed` to show their windows. Browser binaries, temporary profiles, and test artifacts are saved under `.cache/` in this project. npm's cache is also configured locally through `.npmrc`. The browser runner sets its own cache path on every platform. See [verification evidence](docs/verification.md) for exercised engines, coverage, tuning results, and limitations.

## Engineering and tuning

- `src/game.ts`: browser-independent campaign commands and elapsed-time progression.
- `src/types.ts`: observable campaign state, authored-maze and tuning contracts.
- `src/mazes.ts`: three 25×25 authored passage networks.
- `src/main.ts`, `src/render.ts`: browser controls, menus, HUD, and graphics.
- `src/audio.ts`, `src/storage.ts`: sound feedback and resilient local persistence.
- `tests/rules/`: deterministic behavioral scenarios and maze connectivity.
- `tests/browser/`: actual interface flows, using tiny maze content fixtures for campaign endings.

Movement speeds and ghost-release delays live in `DEFAULT_CONFIG`; dimensions and walls are defined by the maze rows. The renderer's `PALETTE` and audio's `SOUND` keep colors and sound details configurable. Player speed and eight-second power duration remain constant across levels; ghost speeds increase. Ghosts differ in shape as well as color, and decorative animation respects reduced-motion preference.

## Design history

The [requirements](.scratch/pac-mano/spec.md) and [confirmed design](docs/design.md) retain their original instruction to defer implementation. Implementation began only after the owner's explicit request. See also the [domain glossary](CONTEXT.md), [architecture decision](docs/adr/0001-browser-apis-instead-of-a-game-engine.md), and [ghost-regeneration research](docs/original-ghost-behavior.md).
