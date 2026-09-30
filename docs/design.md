# Pac Mano Design

Status: confirmed; implementation deferred at the user's request.

## Confirmed foundations

- Purpose: a small, complete portfolio game with a polished playable loop.
- Identity: familiar maze-chase mechanics with an original name, maze, and visual identity.
- First platform: desktop browser with keyboard controls.
- Constraints: technology is flexible; completing the game takes priority over extra features. No required technology or deadline was specified.
- Project boundary: all game files and documentation belong inside `/Users/felipepg/projetos/pacman-game`.
- The game's name is **Pac Mano**. The project directory remains `pacman-game`.

## Design review

All design decisions are settled. The user confirmed shared understanding and explicitly requested that implementation not begin yet.

## Confirmed game design

- Collect every pellet to complete a level.
- Power pellets temporarily allow the player character to eat ghosts.
- Bonus fruit is outside the first version's scope.
- The campaign has three designed levels with increasing difficulty, followed by a final victory screen.
- Movement is continuous. Direction inputs are buffered until the requested turn becomes valid.
- Controls support arrow keys and WASD.
- There are four ghosts with distinct pursuit styles and recognizable appearances.
- Presentation uses a clean retro arcade style, original geometric characters, and restrained effects.
- Include sound effects and a mute control; music is outside the first version's scope.

## Confirmed campaign rules

- Three lives are shared across the campaign. Being caught preserves collected pellets and score, resets character positions, and clears the power effect. Losing the last life ends the game.
- Power effects last eight seconds, with a warning during the last two seconds. Another power pellet resets the duration and ghost-scoring chain.
- Eaten ghosts return harmlessly through passages to the central ghost pen, then immediately restart their individual pursuit styles as dangerous ghosts. Their prior frightened state does not resume; a fresh power pellet collected after return can frighten them again.
- There is no fixed post-return immunity timer. The earlier two-second recovery and five-second protection proposals are superseded.
- Normal pellets award 10 points; power pellets award 50 points.
- Consecutive ghosts within one power effect award 200, 400, 800, and 1,600 points; subsequent captures are capped at 1,600 points each.
- Save the best score locally when a campaign ends in loss or victory. Accounts and online leaderboards are outside the first version's scope.
- Ghost personalities: direct chase; aiming ahead of the player; alternating patrol and pursuit; and approaching from far away but retreating nearby.
- Ghosts have distinct shapes as well as colors.
- Difficulty starts approachable, targeting approximately 5–10 minutes for a successful campaign. Ghost speed increases across levels; player speed and power duration remain constant.
- Each of the three distinct, compact mazes has reachable pellets, a central ghost pen, and one pair of side tunnels.
- Ghost releases are staggered to provide a safe start. Walls remain fixed.

## Confirmed event and movement rules

- Process collectible pickup first; a power pellet takes effect immediately.
- Level completion takes precedence over a simultaneous dangerous-ghost collision.
- Outside a level-completion event, overlapping ghosts can cost at most one life at a time.
- Stop at walls, allow immediate reversal within a corridor, and turn at passage centers.
- The latest direction request replaces the queued turn.

## Confirmed interface and usability

- Flow: title and controls, three-second ready countdown, play, level transition, and victory or game over.
- Display current score, best score, remaining lives, current level, and remaining power time.
- Escape or P pauses. Leaving the tab automatically pauses; resuming requires an explicit player action.
- Restart begins a fresh campaign. Mid-game saves and bonus lives are outside scope.
- Menus are keyboard-accessible and controls remain visible.
- Mute preference persists between visits.
- Ghost shapes are distinguishable without relying on color.
- Honor the operating system's reduced-motion preference for decorative motion.

## Confirmed ghost return details

- Eaten ghosts travel harmlessly through maze passages to the central ghost pen.
- Returning ghosts cannot be eaten and cannot catch the player.
- Upon arrival, ghosts immediately resume their individual pursuit styles and become dangerous, even if the previous power effect remains active for other ghosts.
- Normal frightened ghosts slow down and flee. Other ghosts' frightened state is not changed by one ghost's regeneration.
- A fresh power pellet collected after regeneration makes a regenerated ghost frightened and edible immediately.
- A power pellet collected while a ghost is still returning does not leave it frightened after regeneration.
- No two-second recovery delay or five-second immunity timer is used.
- Original contact and regeneration behavior were verified and selected by the user; evidence is recorded in `original-ghost-behavior.md`.
- Resuming individual pursuit styles immediately is Pac Mano's accepted simplification of the original game's chase/scatter and release schedules.

## Confirmed architecture

- Use TypeScript, Canvas 2D for game graphics, HTML for menus and accessible interface text, and Vite for local development and building.
- Separate game rules from browser rendering so movement, collision, timers, and progression can be tested directly.
- Use the already-available compatible Node runtime for tooling. Project dependencies, lockfiles, caches, documentation, and generated outputs stay inside the project folder.
- The engine choice is recorded in `adr/0001-browser-apis-instead-of-a-game-engine.md`.

## Confirmed delivery and verification

- Deliver a locally playable game with clear run instructions and a static production build.
- Target current desktop Chrome, Edge, Firefox, and Safari.
- Test movement, scoring, power timers, ghost regeneration, collision precedence, and progression.
- Verify that every authored maze's pellets are reachable.
- Browser checks cover starting, pausing, restarting, and finishing a campaign.

## Delegated implementation tuning

- Exact movement speeds, ghost-release delays, maze dimensions, colors, and sound details may be selected and tuned during implementation.
- Keep tuning values configurable and preserve the agreed mechanics.
- Use playtesting to assess the approachable first level and approximate 5–10 minute successful campaign target.

## Documentation

Settled domain terms live in `../CONTEXT.md`. Architectural decision records will be added under `adr/` when a consequential trade-off warrants one.

The design interview is complete. Implementation must wait for the user to explicitly request starting it.
