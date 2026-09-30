# Pac Mano

The language of an original maze-chase game inspired by familiar arcade mechanics.

## Language

**Maze-chase game**:
A game in which a player-controlled character navigates a maze while avoiding pursuing enemies.
_Avoid_: Pac-Man replica, exact clone

**Maze**:
The game's playfield, made of connected passages and barriers.
_Avoid_: Map, board

**Player character**:
The character controlled by the player, continuously moving through the maze and collecting pellets.
_Avoid_: Pac-Man

**Ghost**:
One of four pursuing enemies with a distinct behavior and recognizable appearance. Its current state determines whether contact is dangerous, edible, or harmless.
_Avoid_: Monster, pursuer

**Pellet**:
A collectible in the maze. Every pellet must be collected to complete a level.
_Avoid_: Dot, coin

**Power pellet**:
A pellet that temporarily enables the player character to eat ghosts.
_Avoid_: Energizer, power-up

**Level**:
A stage with a designed maze, completed by collecting every pellet.
_Avoid_: Round, map

**Campaign**:
The finite sequence of three levels, ending in victory when the last level is completed.
_Avoid_: Endless mode

**Life**:
One allowance for being caught by a dangerous ghost. Three lives are shared across the campaign; losing the last life ends the game.
_Avoid_: Heart, health point

**Caught**:
Contact between the player character and a dangerous ghost that costs a life.
_Avoid_: Hit, damage

**Power effect**:
The eight-second frightened period initiated by a power pellet; it does not provide blanket protection against every ghost. Another power pellet starts a fresh period and ghost-scoring chain.
_Avoid_: Invincibility, power mode

**Frightened ghost**:
A ghost affected by a power pellet that slows down, flees, and can be eaten.
_Avoid_: Vulnerable enemy, blue ghost

**Returning ghost**:
An eaten ghost traveling harmlessly through maze passages to the ghost pen. It cannot be eaten while returning.
_Avoid_: Dead ghost, returning enemy

**Regenerated ghost**:
A ghost that has returned to the pen and resumed its individual pursuit style. It is dangerous despite the previous power effect and can be frightened again by a fresh power pellet collected after its return.
_Avoid_: Invulnerable ghost, protected ghost

**Ghost pen**:
The central area from which ghosts enter the maze and to which eaten ghosts return before restarting pursuit.
_Avoid_: Ghost house, spawn room

**Side tunnel**:
A passage joining opposite sides of a maze, allowing travel between them.
_Avoid_: Portal, teleport

**Score**:
The points earned within a campaign by collecting pellets and eating ghosts.
_Avoid_: Points total

**Best score**:
The highest score saved from a completed or lost campaign on the same browser.
_Avoid_: High-score table, leaderboard

**Queued turn**:
The most recently requested direction, waiting until the player character can turn into a passage.
_Avoid_: Buffered input, direction queue

**Ready countdown**:
The three-second preparation period before play begins.
_Avoid_: Start delay
