# Pac Mano — Locally Playable Maze-chase Game

Status: ready-for-agent
Implementation: deferred; explicit user authorization is required before coding.

## Problem Statement

The project owner wants a small, complete portfolio game that demonstrates a polished playable loop and understandable engineering. The concept needs a concrete, shared specification before implementation begins, so movement, ghost behavior, scoring, progression, accessibility, and delivery do not depend on later guesswork.

Players should be able to enjoy a recognizable maze-chase experience locally in a desktop browser, learn its rules quickly, and complete a short campaign. The project currently contains a confirmed design, a domain glossary, an architectural decision, and verified research into ghost regeneration. There is no game implementation, existing test suite, or build system yet.

## Solution

Create **Pac Mano**, an original retro arcade maze-chase game with three authored levels, four recognizable ghosts with distinct pursuit styles, and three lives shared across the campaign. The player character continuously navigates passages, collects every pellet to complete each level, and uses power pellets to frighten and eat ghosts.

Provide clear controls, a ready countdown, visible campaign status, pause and restart, local best-score persistence, sound effects, and accessible HTML menus. Deliver a locally playable desktop-browser project with clear run instructions and a static production build. Keep all project material inside the existing project directory.

Use the verified original arcade regeneration rule: returning ghosts are harmless; after reaching the ghost pen, regenerated ghosts immediately resume individual pursuit and become dangerous despite the previous power effect. A fresh power pellet collected after regeneration can frighten them again. There is no fixed post-return protection timer.

## User Stories

1. As a player, I want to launch Pac Mano locally in a desktop browser, so that I can play without an account or hosted service.
2. As a player, I want the title screen to explain the controls and objective, so that I understand how to begin.
3. As a keyboard user, I want to operate menus and controls without a mouse, so that I can start and manage the campaign using the keyboard.
4. As a player, I want a three-second ready countdown before play begins, so that I have time to prepare.
5. As a player, I want to steer using either arrow keys or WASD, so that I can use familiar controls.
6. As a player, I want the player character to move continuously through passages, so that the game has an arcade rhythm.
7. As a player, I want an early direction press to create a queued turn, so that timing a junction does not require a perfectly timed keypress.
8. As a player, I want my latest direction request to replace the queued turn, so that I can correct a previous input.
9. As a player, I want the player character to stop at walls, so that movement remains predictable.
10. As a player, I want immediate reversal within a corridor, so that I can react to an approaching ghost.
11. As a player, I want turns to occur at passage centers, so that movement stays aligned with the maze.
12. As a player, I want to traverse the side tunnel joining opposite edges, so that I have an additional route through each maze.
13. As a player, I want normal pellets to award 10 points, so that collecting them steadily increases my score.
14. As a player, I want power pellets to award 50 points, so that their collection has a clear scoring reward.
15. As a player, I want collecting every pellet to complete a level, so that the objective is concrete.
16. As a player, I want level completion to win over a simultaneous dangerous-ghost collision, so that collecting the final pellet produces a clear successful outcome.
17. As a player, I want a power pellet to take effect immediately on collection, so that same-moment contact uses the new power state.
18. As a player, I want the power effect to last eight seconds, so that its duration is predictable.
19. As a player, I want a warning during the final two seconds of the power effect, so that I can prepare for danger returning.
20. As a player, I want another power pellet to start a fresh eight-second effect and ghost-scoring chain, so that its consequences are consistent.
21. As a player, I want frightened ghosts to slow down and flee, so that the power effect visibly changes the chase.
22. As a player, I want each of the four ghosts to have a recognizable appearance and pursuit style, so that I can learn how to react to it.
23. As a player, I want direct pursuit, pursuit aimed ahead, alternating patrol and pursuit, and approach-or-retreat behavior, so that ghosts create different tactical problems.
24. As a player, I want ghost releases to be staggered, so that I have a safe opportunity to begin moving.
25. As a player, I want consecutive frightened-ghost captures to award 200, 400, 800, and 1,600 points, so that a successful chain is rewarded.
26. As a player, I want further captures in the same power effect to award at most 1,600 points each, so that scoring has a clear upper step.
27. As a player, I want a returning ghost to travel harmlessly through passages to the ghost pen, so that its recovery route is understandable.
28. As a player, I want returning ghosts to be neither dangerous nor edible, so that their state has consistent contact rules.
29. As a player, I want a regenerated ghost to resume its individual pursuit immediately, so that returning to the pen has a clear end state.
30. As a player, I want regenerated ghosts to be dangerous despite the previous power effect, so that the selected original regeneration rule is consistent.
31. As a player, I want a fresh power pellet collected after regeneration to make that ghost edible again immediately, so that I can counter its renewed pursuit.
32. As a player, I want a power pellet collected while a ghost is returning not to preserve frightened status after regeneration, so that return timing follows the selected rule.
33. As a player, I want three lives shared across the campaign, so that failure has a limited but understandable cost.
34. As a player, I want being caught to preserve my score and collected pellets, so that one mistake does not erase my level progress.
35. As a player, I want being caught to reset character positions and clear the power effect, so that play restarts from a consistent state.
36. As a player, I want overlapping dangerous ghosts to cost at most one life at a time, so that one collision event cannot consume multiple lives.
37. As a player, I want losing my last life to show game over, so that the end of the campaign is explicit.
38. As a player, I want three distinct compact mazes with fixed walls, a central ghost pen, and one pair of side tunnels each, so that progression offers variety within familiar rules.
39. As a player, I want every pellet to be reachable, so that every level can be completed.
40. As a player, I want ghost speed to increase across levels while player speed and power duration stay constant, so that difficulty rises without changing my basic controls.
41. As a player, I want completing the third level to show victory, so that the campaign has a definite successful ending.
42. As a player, I want score, best score, lives, level, and remaining power time to remain visible during play, so that I can assess my situation.
43. As a player, I want Escape or P to pause the game, so that I can take a break.
44. As a player, I want leaving the tab to pause automatically and require explicit resume, so that the campaign does not progress while I am away.
45. As a player, I want gameplay and its timers to remain stopped while paused, so that pausing does not consume an advantage or cost a life.
46. As a player, I want restart to begin a fresh campaign, so that I can try again from the beginning.
47. As a player, I want my best score saved locally when a campaign ends in loss or victory, so that I can compare future attempts on the same browser.
48. As a player, I want sound effects and a persistent mute preference, so that I can choose whether to hear audio feedback.
49. As a player, I want original geometric characters and a clean retro arcade presentation with restrained effects, so that Pac Mano has a coherent identity.
50. As a player who cannot rely on color differences, I want ghosts to have distinguishable shapes, so that I can recognize them.
51. As a player who requests reduced motion, I want decorative motion to honor my operating-system preference, so that presentation respects that preference.
52. As a player, I want an approachable first level and a successful campaign lasting roughly 5–10 minutes, so that I can enjoy a complete experience in a short session.
53. As a player, I want support for current desktop Chrome, Edge, Firefox, and Safari, so that I can use a familiar browser.
54. As a project owner, I want clear installation, local launch, and build instructions, so that others can reproduce the playable portfolio project.
55. As a project owner, I want campaign rules separated from browser rendering, so that the engineering is inspectable and gameplay behavior can be tested directly.
56. As a project owner, I want speeds, release delays, maze dimensions, colors, and sound details configurable, so that playtesting can improve the experience without changing agreed mechanics.
57. As a project owner, I want sources, dependencies, documentation, caches, and generated artifacts to stay inside the project directory, so that the project remains contained.
58. As a project owner, I want meaningful checks of campaign rules, maze reachability, and browser flows, so that completion is supported by observable evidence.
59. As a project owner, I want PRD publication to preserve the instruction to defer implementation, so that documentation readiness does not trigger unauthorized coding.

## Implementation Decisions

- **Architecture:** Use TypeScript, Canvas 2D for game graphics, accessible HTML menus and status text, and Vite for local development and a static production build. Follow the accepted architectural decision, “Browser APIs instead of a game engine.”
- **Responsibilities:** Build campaign rules and state, authored maze content, browser input and presentation, audio feedback, and local persistence. Keep the campaign rules independent of rendering and browser services. Exact module boundaries and interface names remain implementation choices.
- **Campaign behavior boundary:** Express rule changes through player commands and controlled elapsed time, with observable campaign state available to presentation and verification. This is the high-level expression of the already-approved separation between rules and rendering; it is not a commitment to specific files or private structures.
- **Movement:** Continuous movement supports arrows and WASD. Stop at walls, reverse immediately in a corridor, turn at passage centers, and retain only the latest queued direction until it becomes valid.
- **Authored mazes:** Provide three distinct compact mazes. Each has fixed walls, reachable pellets, a central ghost pen, and one pair of side tunnels. All pellets, including power pellets, contribute to the completion objective.
- **Pursuit:** Four ghosts use direct chase, aiming ahead of the player, alternating patrol and pursuit, and approaching from far away but retreating nearby. Release them in a staggered sequence. Frightened ghosts slow down and flee.
- **Power:** A power pellet begins an eight-second effect with a warning in its last two seconds. Another power pellet resets its duration and ghost-scoring chain. Ghost state, rather than a blanket player invulnerability flag, determines contact consequences.
- **Ghost regeneration:** Returning ghosts travel harmlessly through passages and cannot be eaten. On reaching the pen, they immediately resume their individual pursuit as dangerous ghosts. The previous power effect does not frighten them again; a fresh power pellet collected after regeneration does. Collecting a power pellet during return does not preserve frightened status after regeneration. No fixed post-return recovery or immunity timer is used.
- **Event precedence:** Process collection first so new power applies immediately. Completion of the level takes precedence over simultaneous dangerous contact. Otherwise, one collision event can consume at most one life.
- **Lives and progression:** Share three lives and accumulated score across all levels. Being caught preserves collected pellets and score, resets character positions, and clears the power effect. Losing the last life ends the campaign; completing the third level ends it in victory.
- **Scoring:** Award 10 points for a normal pellet and 50 for a power pellet. Consecutive captures within one power effect award 200, 400, 800, then 1,600 points, with subsequent captures capped at 1,600 each.
- **Player flow:** Provide title and controls, a three-second ready countdown, play, level transitions, and victory or game over. Show current score, best score, lives, level, and remaining power time. Restart starts a fresh campaign.
- **Pause:** Escape or P pauses. Leaving the tab pauses automatically and requires explicit resume. Suspend gameplay progression and gameplay timers during pause.
- **Persistence:** Save the highest completed or lost campaign score locally on the same browser. Persist mute preference. No account or server-side data contract is needed.
- **Presentation and accessibility:** Use original geometric characters, clean retro arcade styling, restrained effects, sound effects, visible controls, keyboard-accessible menus, color-independent ghost shapes, and reduced decorative motion when requested by the operating system.
- **Difficulty and tuning:** Target an approachable first level and approximately 5–10 minutes for a successful campaign. Increase ghost speed across levels while keeping player speed and power duration constant. The user delegated exact speeds, release delays, maze dimensions, colors, and sound details; keep these configurable and assess them through playtesting.
- **Delivery:** Provide a locally playable project, run instructions, and a static production build targeting current desktop Chrome, Edge, Firefox, and Safari. Use a compatible available Node runtime for tooling. Keep project dependencies, lockfiles, caches, and generated outputs inside the project directory.
- **Execution gate:** This PRD specifies future work. Its ready-for-agent status does not authorize implementation; coding must wait for an explicit user request to begin.

## Testing Decisions

- **Good tests:** Assert externally observable player and campaign behavior. Exercise commands, elapsed time, maze content, and resulting state rather than private helpers, internal call counts, render implementation, or data layout.
- **Principal seam:** Prefer one public campaign behavior boundary for rules testing, covering the campaign as a whole rather than creating separate test-only interfaces for every ghost, pellet, or timer. This carries forward the user's approved rule/rendering separation and gameplay verification.
- **Browser seam:** Use the actual player-facing browser interface for start, keyboard controls, pause, automatic tab pause and explicit resume, restart, local best-score and mute persistence, level transitions, game over, and victory. These are the previously agreed browser flows, expanded into observable acceptance checks.
- **Prior art:** No implementation, test harness, existing seams, or prior tests currently exist. Establish the campaign boundary at the highest useful level and avoid unnecessary additional testing interfaces.
- **Movement scenarios:** Verify wall stopping, immediate corridor reversal, turns at passage centers, early queued turns, latest-input replacement, side-tunnel traversal, and equivalent arrow/WASD behavior.
- **Power and regeneration scenarios:** Verify eight-second duration, the final two-second warning, reset on another power pellet, frightened behavior, harmless return, immediate dangerous regeneration, a fresh pellet after regeneration, and a pellet collected during return. Include dangerous regenerated contact while other ghosts remain frightened.
- **Scoring and failure scenarios:** Verify pellet values, capture progression and cap, chain reset, preserved score and pellets on life loss, position and power resets, at-most-one-life loss per collision event, and game over on the last life.
- **Progression and precedence scenarios:** Verify that collecting all pellets completes each level, that final-pellet completion wins over simultaneous dangerous contact, that power pickup affects same-moment contact, that lives and score carry across the three levels, and that the final level leads to victory.
- **Maze validation:** Check the authored level definitions through maze loading and campaign behavior, including reachability of every pellet, passage connectivity, valid starts and ghost pen, and connected side-tunnel endpoints. These checks should protect playability rather than mirror the maze representation.
- **Deterministic scenarios:** Control elapsed time, player commands, and known maze fixtures so failures are reproducible. Assert the agreed pursuit characteristics without locking tests to incidental route choices or decorative frames.
- **Browser and presentation verification:** Check usable menus and visible status, distinct ghost shapes, reduced decorative motion, sound and mute behavior, and supported desktop browsers. Record which browsers were actually exercised.
- **Completion evidence:** Require relevant rule tests, maze checks, TypeScript checking, a successful production build, and browser acceptance checks. Assess approachability and the campaign-duration target with playtesting; do not treat a single exact run time as an invariant.

## Out of Scope

- Starting implementation as part of PRD publication.
- Mobile or touch-first controls, installed desktop or mobile apps.
- Public hosting or deployment.
- Accounts, online leaderboards, multiplayer, a backend, and networked gameplay.
- Endless play, procedural maze generation, a level editor, moving walls, or levels beyond the three-level campaign.
- Bonus fruit, bonus lives, background music, and mid-game saves.
- Exact reproduction of the original game's graphics, mazes, complete chase/scatter schedule, release schedules, or full rule set.
- A two-second post-return recovery delay or five-second ghost-protection timer; both were superseded by the selected regeneration rule.

## Further Notes

- The user confirmed the design and explicitly requested that implementation not begin yet. Documentation and tracker readiness must preserve that instruction.
- This PRD synthesizes the confirmed conversation, the project glossary, the accepted browser-API architectural decision, and the recorded ghost-regeneration research. It introduces no new product interview.
- The original ghost rule was checked against the [original arcade disassembly](http://cubeman.org/arcade-source/pacman.asm) and the first-hand [Pac-Man Dossier](https://pacman.holenet.info/). Pac Mano retains the accepted simplification of immediate individual pursuit upon regeneration rather than copying the original chase/scatter and house-release schedules.
- No hard deadline was specified. Exact tuning remains delegated, and the approximate campaign-duration target should guide playtesting.
- No game code or tests were implemented or run in producing this PRD.
