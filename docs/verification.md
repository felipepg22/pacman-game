# Verification evidence

Verified on 29 September 2026 (America/Sao_Paulo), using Node 20.18.1 and npm 10.8.2. Implementation was explicitly authorized by the owner; the original deferred PRD remains intact.

## Rule and content checks

`npm test`: **33 passing behavioral tests**, using the public campaign command/time/state boundary and deterministic authored-maze fixtures. No test mutates campaign state or uses private helpers.

| Requirement group | Observable evidence |
| --- | --- |
| Movement, stories 5–12 | Continuous movement, wall stops, reversal within a corridor, centered turns, early queued turns, latest request replacement, tunnels; browser checks cover arrows/WASD. |
| Collection and precedence, 13–20 | Pellet scores, all-pellet completion, final collection over dangerous contact, immediate power pickup, eight seconds, warning at two seconds, fresh-duration reset. |
| Ghosts and regeneration, 21–32 | Distinct direct/ahead/patrol/approach-or-retreat pursuit, frightened speed/fleeing, staggered releases, capture chain, harmless/inedible return, dangerous immediate regeneration, fresh power before/after regeneration, dangerous regenerated contact while another ghost remains frightened. |
| Lives and progression, 33–41 | Three lives, one loss per contact event, preserved pellets/score, reset positions/power, last-life game over, lost life and score carried between levels, final victory, increasing ghost speeds with fixed player/power settings. |
| Mazes, 38–39 | Three distinct 25×25 mazes; BFS reaches every passage and all 225/261/249 pellets; central pellet-free pen, valid starts, exactly one connected side-tunnel pair each, four power pellets per maze. |
| Pause/restart, 43–46 | Ready countdown and playing freeze; active power and release timers freeze; paused direction commands do not alter the player; explicit resume and fresh campaign restart. |

The fifth-capture cap is encoded in the scoring rule. With four ghosts and dangerous regeneration, a fifth frightened capture without a new power pellet is unreachable in ordinary play. Tests exercise the full reachable 200/400/800/1,600 chain and its reset rather than manufacturing an impossible state.

`npm run typecheck` and `npm run build` pass. Vite produces a static `dist/` with no external runtime assets or network service. Source, dependencies, lockfile, npm cache, browser binaries, test outputs, and temporary browser profiles stay inside the project; the browser script configures local temporary directories.

## Browser acceptance

The actual HTML menus, keyboard inputs, Canvas presentation, and local persistence are exercised in **Chromium 145** and **WebKit 26**, through six scenarios per engine: **12 acceptance checks passed**. A separate production-preview smoke check passed start, countdown, play, and pause without browser errors.

1. Keyboard start, three-second countdown, steering, pause/resume, restart, and mute persistence.
2. Equivalent arrow/WASD collection behavior.
3. Automatic focus/tab pause with explicit resume.
4. Three level transitions, victory, and persisted best score.
5. Three catches, game over, keyboard play again, and persisted best score after loss.
6. Reduced-motion preference, four different ghost silhouettes, visible controls, and no horizontal overflow at 1024×768.

Campaign ending checks supply tiny authored mazes at the content boundary. The loss fixture uses immediate releases. All actions still use the actual player interface; production has no debug controls or campaign-finishing hooks. Browser clocks provide controlled elapsed time. The focus test switches browser tabs and uses a native blur event fallback when the host does not transfer OS focus.

Chromium title and gameplay screenshots were inspected for hierarchy, readability, visible controls, and distinct silhouette legend. The renderer disables decorative mouth oscillation and power-pellet pulsing under reduced motion. Web Audio effects are synthesized locally after a user gesture; mute persistence and absence of browser errors are covered. Audible sound quality was not manually assessed.

**Firefox limitation:** Playwright Firefox 146 was installed and launch attempted both with and without a window, including an alternative graphics configuration. The host reports `sandbox_extension_issue_file_to_process ... Operation not permitted` and `RenderCompositorSWGL failed mapping default framebuffer`, then launch times out. The Mac was reported locked. Firefox application flows could not be exercised in this session. Chrome, Edge, and Safari branded binaries were not separately tested; Chromium/WebKit engine checks provide compatibility evidence, not a claim of branded-browser execution.

To repeat on an unlocked desktop:

```sh
npm run browsers:install
npm run test:browser
```

To repeat only the engines exercised here:

```sh
npm run test:browser -- --project=chromium --project=webkit
```

Add `--headed` for visible windows. Browser launch timeout is bounded at 15 seconds to make host failures explicit.

## Campaign tuning and playtesting

`npm run playtest` runs five reproducible pilots on the shipped mazes with default movement speeds, active ghosts, real collision rules, and three shared lives. Each pilot uses only observed state, turn commands, and elapsed time. The pilots seek remaining pellets, with four variants adding caution around dangerous ghosts.

| Pilot | Outcome | Campaign time | Lives lost | First level |
| --- | --- | --- | --- | --- |
| Greedy, no ghost avoidance | Game over in level 1 | 75.9 s | 3 | Three pellets remained |
| Caution 1 | Victory | 264.7 s | 1 | 89.3 s |
| Caution 2 | Victory | 301.0 s | 2 | 74.3 s |
| Caution 4 | Victory | 306.4 s | 1 | 95.9 s |
| Caution 8 | Victory | 269.4 s | 0 | 78.8 s |

The route-aware pilots complete in **4.4–5.1 minutes**, around the lower edge of the approximate 5–10-minute target, with an approachable first level for players who plan their route. Human navigation, reaction time, and learning can lengthen a campaign; that is an inference, not measured human evidence. This is an automated playtesting proxy plus browser flow checks, not a full human campaign or accessibility user study. Exact duration is deliberately not asserted as a gameplay invariant.

## Delivery and accessibility

The README provides installation, launch, controls, build/preview, verification, tuning, and architecture instructions. HTML buttons have visible keyboard focus; status, controls, ghost identities, and objectives are visible. Best score and mute preferences tolerate unavailable storage. Colors are configurable in `PALETTE`, sounds in `SOUND`, and speeds/releases in `DEFAULT_CONFIG`.

No hosted deployment, account, backend, bonus fruit/lives, mobile controls, or mid-campaign save was introduced. The specification's original implementation gate and publication history remain preserved.
