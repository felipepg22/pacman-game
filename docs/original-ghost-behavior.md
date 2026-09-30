# Original Pac-Man ghost regeneration

This note concerns the original arcade game's regenerated-ghost rules, not all of its mechanics.

## Verified behavior

- Eaten ghosts return as harmless eyes to the ghost pen.
- A regenerated ghost returns to normal pursuit and can catch Pac-Man even while other ghosts remain frightened from the same energizer.
- Regeneration clears that ghost's frightened state. It does not reapply the still-active energizer effect to the regenerated ghost.
- A fresh energizer collected after regeneration can frighten the ghost again immediately.
- An energizer collected while the ghost is still returning does not preserve frightened status after regeneration.
- The regeneration transition does not grant a five-second immunity timer.

## Evidence

- [The Pac-Man Dossier](https://pacman.holenet.info/#The_Basics) is a first-hand technical account based on original ROM disassembly and controlled gameplay tests. Its account of eaten ghosts returning to the pen and rejoining pursuit agrees with the original state transitions.
- [Commented original arcade disassembly](http://cubeman.org/arcade-source/pacman.asm): collision logic at `0x171D–0x1775` ignores returning eyes and distinguishes frightened from dangerous ghosts; regeneration at `0x10F7–0x10FE` clears Blinky's frightened flag at `0x4DA7`; a fresh energizer at `0x1A70–0x1A84` sets the four frightened flags again.

## Pac Mano decision

The user selected the original regeneration rule, replacing the custom five-second protection period: return harmlessly, restart individual pursuit as a dangerous ghost, and become edible again only after a fresh power pellet collected after regeneration. Pac Mano retains immediate individual pursuit rather than copying the original chase/scatter and house-release schedules.
