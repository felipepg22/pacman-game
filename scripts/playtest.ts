import { Campaign } from '../src/game';
import type { Direction, Point } from '../src/types';

const directions: Direction[] = ['up', 'left', 'down', 'right'];
const deltas = { up: [0, -1], left: [-1, 0], down: [0, 1], right: [1, 0] };
const key = (p: Point) => `${p.x},${p.y}`;

/** Reproducible greedy pilot. Uses only commands, elapsed time, and observable state. */
function choose(game: Campaign, caution: number, variant: number): Direction {
  const state = game.state;
  const width = state.maze.rows[0].length;
  const start = { x: Math.round(state.player.x), y: Math.round(state.player.y) };
  const queue: { point: Point; cost: number; first: Direction }[] = [{ point: start, cost: 0, first: state.player.direction }];
  const visited = new Map<string, number>([[key(start), 0]]);
  const danger = state.ghosts.filter(ghost => ghost.mode === 'chasing');
  const order = [...directions.slice(variant % 4), ...directions.slice(0, variant % 4)];
  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost);
    const next = queue.shift()!;
    if (next.cost > visited.get(key(next.point))!) continue;
    if (state.pellets.has(key(next.point))) return next.first;
    for (const direction of order) {
      const [dx, dy] = deltas[direction];
      let x = next.point.x + dx;
      const y = next.point.y + dy;
      if (y === state.maze.tunnelRow) x = (x + width) % width;
      if (state.maze.rows[y]?.[x] === undefined || state.maze.rows[y][x] === '#') continue;
      const point = { x, y };
      const nearest = Math.min(...danger.map(ghost => Math.hypot(ghost.x - x, ghost.y - y)));
      const isPower = state.pellets.get(key(point)) === 'power';
      const hazard = isPower ? 0 : nearest < 1.5 ? 100 : nearest < 3 ? 15 : nearest < 5 ? 3 : 0;
      const cost = next.cost + 1 + hazard * caution;
      if (cost >= (visited.get(key(point)) ?? Infinity)) continue;
      visited.set(key(point), cost);
      queue.push({ point, cost, first: next.cost === 0 ? direction : next.first });
    }
  }
  return state.player.direction;
}

export function playtest(caution = 1, variant = 0) {
  const game = new Campaign();
  game.start();
  let seconds = 0;
  let losses = 0;
  let captures = 0;
  const completedAt: number[] = [];
  while (seconds < 900 && !['victory', 'game-over'].includes(game.state.phase)) {
    if (game.state.phase === 'level-complete') { completedAt.push(seconds); game.advanceLevel(); }
    if (game.state.phase === 'ready') { const dt = game.state.readyRemaining; game.update(dt); seconds += dt; }
    if (game.state.phase !== 'playing') continue;
    game.turn(choose(game, caution, variant));
    const dt = 1 / game.config.playerSpeed;
    game.update(dt);
    seconds += dt;
    for (const event of game.drainEvents()) { if (event === 'caught') losses++; if (event === 'eat') captures++; }
  }
  if (game.state.phase === 'victory') completedAt.push(seconds);
  return { caution, variant, outcome: game.state.phase, seconds: Number(seconds.toFixed(1)), level: game.state.levelIndex + 1, score: game.state.score, remainingPellets: game.state.pellets.size, lives: game.state.lives, losses, captures, completedAt: completedAt.map(value => Number(value.toFixed(1))) };
}

for (const [caution, variant] of [[0, 0], [1, 0], [2, 1], [4, 2], [8, 3]]) console.log(JSON.stringify(playtest(caution, variant)));
