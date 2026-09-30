import { LEVELS } from './mazes';
import type { CampaignState, Character, Direction, GameConfig, GameEvent, Ghost, MazeDefinition, Point } from './types';

export const DEFAULT_CONFIG: GameConfig = {
  playerSpeed: 4.5,
  ghostSpeeds: [2.6, 2.9, 3.2],
  frightenedSpeed: 1.7,
  returningSpeed: 6,
  releaseDelays: [2, 6, 10, 14],
  readySeconds: 3,
  powerSeconds: 8,
  collisionRadius: 0.55,
};
const DIRECTIONS: Direction[] = ['up', 'left', 'down', 'right'];
const DELTA: Record<Direction, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const OPPOSITE: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };
const key = (p: Point) => `${p.x},${p.y}`;
const centered = (p: Point) => Math.abs(p.x - Math.round(p.x)) < 1e-7 && Math.abs(p.y - Math.round(p.y)) < 1e-7;

/** Browser-independent campaign; commands and elapsed seconds are its only inputs. */
export class Campaign {
  readonly config: GameConfig;
  state: CampaignState;
  private events: GameEvent[] = [];
  private captures = 0;
  private pausedPhase: 'playing' | 'ready' = 'playing';

  constructor(readonly levels: MazeDefinition[] = LEVELS, config: Partial<GameConfig> = {}) {
    if (!levels.length) throw new Error('A campaign needs a maze.');
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = this.initialState();
  }

  private initialState(): CampaignState {
    return { phase: 'title', maze: this.levels[0], levelIndex: 0, score: 0, lives: 3, powerRemaining: 0, powerWarning: false, readyRemaining: 0, elapsed: 0, player: { ...this.levels[0].playerStart, direction: 'left' }, ghosts: [], pellets: new Map(), queuedDirection: null };
  }

  start(): void {
    if (this.state.phase !== 'title') return;
    this.loadLevel();
    this.events.push('start');
  }

  restart(): void {
    this.events = [];
    this.state = this.initialState();
    this.start();
  }

  advanceLevel(): void {
    if (this.state.phase !== 'level-complete') return;
    this.state.levelIndex++;
    this.loadLevel();
  }

  pause(): void {
    if (this.state.phase !== 'playing' && this.state.phase !== 'ready') return;
    this.pausedPhase = this.state.phase;
    this.state.phase = 'paused';
  }

  resume(): void {
    if (this.state.phase === 'paused') this.state.phase = this.pausedPhase;
  }

  turn(direction: Direction): void {
    if (!['ready', 'playing'].includes(this.state.phase)) return;
    this.state.queuedDirection = direction;
    if (direction === OPPOSITE[this.state.player.direction]) {
      this.state.player.direction = direction;
      this.state.queuedDirection = null;
    }
  }

  drainEvents(): GameEvent[] {
    const result = this.events;
    this.events = [];
    return result;
  }

  private loadLevel(): void {
    const maze = this.levels[this.state.levelIndex];
    this.state.maze = maze;
    this.state.pellets = new Map();
    maze.rows.forEach((row, y) => [...row].forEach((cell, x) => {
      if (cell === '.' || cell === 'o') this.state.pellets.set(`${x},${y}`, cell === '.' ? 'pellet' : 'power');
    }));
    this.resetCharacters();
  }

  private resetCharacters(): void {
    this.state.player = { ...this.state.maze.playerStart, direction: 'left' };
    this.state.ghosts = Array.from({ length: 4 }, (_, id) => ({ ...this.state.maze.pen, id, direction: 'up' as Direction, mode: 'waiting' as const, releaseRemaining: this.config.releaseDelays[id] ?? id * 4 }));
    this.state.powerRemaining = 0;
    this.state.powerWarning = false;
    this.state.queuedDirection = null;
    this.state.readyRemaining = this.config.readySeconds;
    this.state.elapsed = 0;
    this.captures = 0;
    this.state.phase = this.config.readySeconds > 0 ? 'ready' : 'playing';
  }

  update(seconds: number): void {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    let remaining = seconds;
    if (this.state.phase === 'ready') {
      const used = Math.min(remaining, this.state.readyRemaining);
      this.state.readyRemaining = Math.max(0, this.state.readyRemaining - used);
      remaining -= used;
      if (this.state.readyRemaining < 1e-9) this.state.phase = 'playing';
    }
    while (remaining > 1e-9 && this.state.phase === 'playing') {
      const dt = Math.min(remaining, 1 / 120);
      this.step(dt);
      remaining -= dt;
    }
  }

  private step(dt: number): void {
    this.state.elapsed += dt;
    this.state.powerRemaining = Math.max(0, this.state.powerRemaining - dt);
    if (this.state.powerRemaining < 1e-9) {
      this.state.powerRemaining = 0;
      for (const ghost of this.state.ghosts) if (ghost.mode === 'frightened') ghost.mode = 'chasing';
    }
    this.state.powerWarning = this.state.powerRemaining > 0 && this.state.powerRemaining <= 2;
    this.collect();
    if (this.state.phase !== 'playing') return;
    this.move(this.state.player, this.config.playerSpeed * dt, () => {
      const queued = this.state.queuedDirection;
      if (queued && this.neighbor(this.state.player, queued)) {
        this.state.player.direction = queued;
        this.state.queuedDirection = null;
      }
    }, () => this.collect());
    if (this.state.phase !== 'playing') return;
    for (const ghost of this.state.ghosts) {
      if (ghost.mode === 'waiting') {
        ghost.releaseRemaining = Math.max(0, ghost.releaseRemaining - dt);
        if (ghost.releaseRemaining <= 1e-9) ghost.mode = this.state.powerRemaining > 0 ? 'frightened' : 'chasing';
        else continue;
      }
      const speed = ghost.mode === 'returning' ? this.config.returningSpeed : ghost.mode === 'frightened' ? this.config.frightenedSpeed : (this.config.ghostSpeeds[this.state.levelIndex] ?? this.config.ghostSpeeds.at(-1) ?? 3);
      this.move(ghost, speed * dt, () => this.steerGhost(ghost), () => this.regenerate(ghost));
      this.regenerate(ghost);
    }
    this.contact();
  }

  private collect(): void {
    if (!centered(this.state.player)) return;
    const location = key({ x: Math.round(this.state.player.x), y: Math.round(this.state.player.y) });
    const pellet = this.state.pellets.get(location);
    if (!pellet) return;
    this.state.pellets.delete(location);
    this.state.score += pellet === 'power' ? 50 : 10;
    this.events.push(pellet);
    if (pellet === 'power') {
      this.state.powerRemaining = this.config.powerSeconds;
      this.state.powerWarning = false;
      this.captures = 0;
      for (const ghost of this.state.ghosts) if (ghost.mode === 'chasing' || ghost.mode === 'frightened') {
        ghost.mode = 'frightened';
        ghost.direction = OPPOSITE[ghost.direction];
      }
    }
    if (!this.state.pellets.size) {
      this.state.phase = this.state.levelIndex === this.levels.length - 1 ? 'victory' : 'level-complete';
      this.events.push(this.state.phase === 'victory' ? 'victory' : 'level');
    }
  }

  private contact(): void {
    const width = this.state.maze.rows[0].length;
    const contacts = this.state.ghosts.filter(ghost => {
      let dx = Math.abs(ghost.x - this.state.player.x);
      if (Math.abs(ghost.y - this.state.maze.tunnelRow) < 0.1 && Math.abs(this.state.player.y - ghost.y) < 0.1) dx = Math.min(dx, width - dx);
      return Math.hypot(dx, ghost.y - this.state.player.y) < this.config.collisionRadius;
    });
    if (contacts.some(ghost => ghost.mode === 'chasing')) {
      this.state.lives--;
      this.events.push('caught');
      this.resetCharacters();
      if (this.state.lives === 0) this.state.phase = 'game-over';
      return;
    }
    for (const ghost of contacts) if (ghost.mode === 'frightened') {
      this.state.score += 200 * 2 ** Math.min(this.captures++, 3);
      ghost.mode = 'returning';
      this.events.push('eat');
    }
  }

  private neighbor(p: Point, direction: Direction): Point | null {
    const d = DELTA[direction];
    const maze = this.state.maze;
    let x = Math.round(p.x) + d.x;
    const y = Math.round(p.y) + d.y;
    if (y === maze.tunnelRow) x = (x + maze.rows[0].length) % maze.rows[0].length;
    return maze.rows[y]?.[x] !== undefined && maze.rows[y][x] !== '#' ? { x, y } : null;
  }

  private move(character: Character, distance: number, choose: () => void, arrive: () => void): void {
    while (distance > 1e-9) {
      if (centered(character)) {
        character.x = Math.round(character.x);
        character.y = Math.round(character.y);
        choose();
        if (!this.neighbor(character, character.direction)) return;
      }
      const d = DELTA[character.direction];
      const coordinate = d.x ? character.x : character.y;
      const sign = d.x || d.y;
      const target = sign > 0 ? Math.floor(coordinate + 1e-7) + 1 : Math.ceil(coordinate - 1e-7) - 1;
      const movement = Math.min(distance, Math.abs(target - coordinate));
      character.x += d.x * movement;
      character.y += d.y * movement;
      distance -= movement;
      if (Math.abs(movement - Math.abs(target - coordinate)) < 1e-7) {
        const width = this.state.maze.rows[0].length;
        if (character.x < 0) character.x += width;
        if (character.x >= width) character.x -= width;
        arrive();
        if (this.state.phase !== 'playing') return;
      }
    }
  }

  private regenerate(ghost: Ghost): void {
    if (ghost.mode === 'returning' && Math.hypot(ghost.x - this.state.maze.pen.x, ghost.y - this.state.maze.pen.y) < 1e-7) ghost.mode = 'chasing';
  }

  private steerGhost(ghost: Ghost): void {
    this.regenerate(ghost);
    let choices = DIRECTIONS.filter(direction => this.neighbor(ghost, direction));
    if (ghost.mode !== 'returning' && choices.length > 1) choices = choices.filter(direction => direction !== OPPOSITE[ghost.direction]);
    const player = this.state.player;
    let target: Point = player;
    if (ghost.mode === 'returning') target = this.state.maze.pen;
    else if (ghost.id === 1) {
      const delta = DELTA[player.direction];
      target = { x: player.x + delta.x * 3, y: player.y + delta.y * 3 };
    } else if (ghost.id === 2 && Math.floor(this.state.elapsed / 7) % 2 === 0) target = { x: this.state.maze.rows[0].length - 2, y: 1 };
    else if (ghost.id === 3 && Math.hypot(player.x - ghost.x, player.y - ghost.y) < 5) target = { x: 1, y: this.state.maze.rows.length - 2 };
    const distances = ghost.mode !== 'frightened' ? this.distancesTo(this.nearestPassage(target)) : null;
    let best = choices[0];
    let bestValue = Infinity;
    for (const direction of choices) {
      const next = this.neighbor(ghost, direction)!;
      const distance = distances?.get(key(next)) ?? Math.hypot(next.x - target.x, next.y - target.y);
      const value = ghost.mode === 'frightened' ? -Math.hypot(next.x - player.x, next.y - player.y) : distance;
      if (value < bestValue) { bestValue = value; best = direction; }
    }
    if (best) ghost.direction = best;
  }

  private distancesTo(target: Point): Map<string, number> {
    const queue = [target];
    const distances = new Map([[key(target), 0]]);
    for (let i = 0; i < queue.length; i++) {
      const p = queue[i];
      for (const direction of DIRECTIONS) {
        const next = this.neighbor(p, direction);
        if (next && !distances.has(key(next))) { distances.set(key(next), distances.get(key(p))! + 1); queue.push(next); }
      }
    }
    return distances;
  }

  private nearestPassage(target: Point): Point {
    let closest = this.state.maze.pen;
    let distance = Infinity;
    this.state.maze.rows.forEach((row, y) => [...row].forEach((cell, x) => {
      if (cell === '#') return;
      const value = Math.hypot(target.x - x, target.y - y);
      if (value < distance) { distance = value; closest = { x, y }; }
    }));
    return closest;
  }
}
