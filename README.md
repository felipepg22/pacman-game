# Pac Mano

**Three mazes. Four ghosts. One more try.** 👻

```text
        ###########
     ################
   ############  ##
 ################
 ##############
#############        o     o     o     O
 ##############
 ################
   ################
     ################
        ###########
```

An original maze-chase game for desktop browsers. Collect every pellet, find your rhythm, and turn the chase around with a well-timed power pellet. Make it through all three levels to finish the campaign.

- **Three authored mazes:** a new set of passages to learn at every level.
- **Four ghost personalities:** direct pursuit, aiming ahead, patrol and pursuit, and approach-or-retreat behavior keep you on your toes.
- **Three shared lives:** your score and remaining lives travel with you through the campaign.
- **Synthesized sound effects:** a little arcade sparkle, with a mute preference that stays saved locally.
- **A best score to chase:** completed and lost campaigns can set your next local record.

## Jump in 🎮

Requires Node.js 20.18+ (verified with 20.18.1) and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite and start a campaign. No account, backend, or external assets are needed. Just bring your keyboard.

## Controls

| Action | Keys |
| --- | --- |
| Steer through the maze | Arrow keys or WASD |
| Pause or resume | Escape or P |
| Move between menu controls | Tab |
| Activate a focused menu button | Enter |

Need a breather? Leaving the tab or browser pauses play automatically; resume explicitly when you're ready. Restart begins a fresh campaign. Your sound preference persists locally between visits.

## Rules of the maze

Collect every pellet to complete a level. Clear the third level for victory, and keep an eye on those three shared lives: losing the last one ends the campaign.

| Collect or capture | Points |
| --- | --- |
| Normal pellet | 10 |
| Power pellet | 50 |
| Consecutive frightened ghosts in one power effect | 200 → 400 → 800 → 1,600; further captures stay at 1,600 |

**Turn the chase around.** A power pellet frightens ghosts for eight seconds, with a warning in the final two. Another power pellet starts a fresh eight-second timer and resets the capture chain.

**Watch the comeback.** Returning ghosts, shown as eyes, are harmless and cannot be eaten. Once they reach the ghost pen, they immediately become dangerous again, even while the earlier power effect is still running. A fresh power pellet can frighten a regenerated ghost.

**Keep your progress.** Being caught costs a life but preserves your score and collected pellets. Positions reset and the power effect clears. Collecting the final pellet completes the level even if you make dangerous contact at the same moment.

Best score is saved when a campaign ends in victory or game over. Restarting an unfinished campaign does not save that score. Storage or audio restrictions do not prevent play.

## Build and preview

```sh
npm run build
npm run preview
```

The static production output is in `dist/`. Serve it over HTTP rather than opening `index.html` through `file://`.

## Verification

```sh
npm test
npm run typecheck
npm run build
npm run browsers:install
npm run test:browser
npm run playtest
```

Browser checks target Chromium, Firefox, and WebKit, one at a time. Add `-- --headed` to the browser test command to show their windows. Browser binaries, temporary profiles, and test artifacts are saved under `.cache/` in this project. npm's cache is also configured locally through `.npmrc`. The browser runner sets its own cache path on every platform.

Recorded browser runs exercised Chromium and WebKit; Firefox launch was blocked on the verification host. See [verification evidence](docs/verification.md) for coverage, tuning results, and limitations, including which engines and branded browsers were exercised.

## Under the hood

The game uses TypeScript, Canvas 2D, accessible HTML controls, and synthesized Web Audio effects. The runtime has no framework dependencies, and campaign rules stay independent of browser presentation.

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
