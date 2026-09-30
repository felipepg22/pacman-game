import { describe, expect, it } from 'vitest';
import { Campaign, DEFAULT_CONFIG } from '../../src/game';
import type { MazeDefinition } from '../../src/types';

function arena(playerStart = { x: 7, y: 5 }, power = false): MazeDefinition {
  const rows: string[] = Array.from({ length: 11 }, (_, y) => y === 0 || y === 10 ? '#############' : '#           #');
  rows[9] = '#.          #';
  if (power) rows[playerStart.y] = rows[playerStart.y].slice(0, playerStart.x) + 'o' + rows[playerStart.y].slice(playerStart.x + 1);
  return { name: 'Pursuit arena', rows, playerStart, pen: { x: 5, y: 5 }, tunnelRow: -1 };
}
function chase(maze = arena()) {
  const game = new Campaign([maze], { readySeconds: 0, playerSpeed: 0, releaseDelays: [0, 0, 0, 0], ghostSpeeds: [1], collisionRadius: 0 });
  game.start();
  return game;
}
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

describe('observable pursuit styles', () => {
  it('direct pursuit approaches the player while the ahead ghost intercepts three cells ahead', () => {
    const game = chase();
    game.update(0.5);
    expect(game.state.ghosts[0].x).toBeCloseTo(5.5);
    expect(game.state.ghosts[1].x).toBeCloseTo(4.5);
    expect(game.state.ghosts[0].y).toBe(5);
    expect(game.state.ghosts[1].y).toBe(5);
  });

  it('the patrol ghost first travels toward its corner then switches to pursuit', () => {
    const game = chase();
    game.update(1);
    expect(game.state.ghosts[2]).toMatchObject({ x: 5, y: 4 });
    game.update(6);
    const before = distance(game.state.ghosts[2], game.state.player);
    game.update(3);
    expect(distance(game.state.ghosts[2], game.state.player)).toBeLessThan(before);
  });

  it('the approach-or-retreat ghost moves away nearby and approaches from a distance', () => {
    const near = chase();
    const nearBefore = distance(near.state.ghosts[3], near.state.player);
    near.update(0.5);
    expect(distance(near.state.ghosts[3], near.state.player)).toBeGreaterThan(nearBefore);
    const far = chase(arena({ x: 11, y: 1 }));
    const farBefore = distance(far.state.ghosts[3], far.state.player);
    far.update(0.5);
    expect(distance(far.state.ghosts[3], far.state.player)).toBeLessThan(farBefore);
  });

  it('frightened ghosts visibly flee and travel slower than their normal pursuit', () => {
    const normal = new Campaign([arena()], { readySeconds: 0, playerSpeed: 0, releaseDelays: [0, 100, 100, 100], collisionRadius: 0 });
    const powered = new Campaign([arena({ x: 7, y: 5 }, true)], { readySeconds: 0, playerSpeed: 0, releaseDelays: [0, 100, 100, 100], collisionRadius: 0 });
    normal.start(); powered.start(); normal.update(0.1); powered.update(0.1);
    expect(powered.state.ghosts[0].mode).toBe('frightened');
    expect(distance(powered.state.ghosts[0], powered.state.player)).toBeGreaterThan(2);
    expect(distance(powered.state.ghosts[0], powered.state.maze.pen)).toBeLessThan(distance(normal.state.ghosts[0], normal.state.maze.pen));
  });

  it('actual ghost travel accelerates across levels while actual player speed and power duration stay constant', () => {
    const transition: MazeDefinition = { name: 'Transition', rows: ['#####', '#.  #', '#####'], playerStart: { x: 1, y: 1 }, pen: { x: 3, y: 1 }, tunnelRow: -1 };
    const travel: number[] = [];
    const playerTravel: number[] = [];
    const power: number[] = [];
    for (let level = 0; level < 3; level++) {
      const game = new Campaign([...Array.from({ length: level }, () => transition), arena({ x: 7, y: 5 }, true)], { readySeconds: 0, releaseDelays: [0, 100, 100, 100], collisionRadius: 0 });
      game.start();
      for (let i = 0; i < level; i++) { game.update(0.01); game.advanceLevel(); }
      // Leave the power pellet for a separate measurement; first travel upward.
      const ordinary = new Campaign([...Array.from({ length: level }, () => transition), arena()], { readySeconds: 0, releaseDelays: [0, 100, 100, 100], collisionRadius: 0 });
      ordinary.start();
      for (let i = 0; i < level; i++) { ordinary.update(0.01); ordinary.advanceLevel(); }
      ordinary.turn('up'); ordinary.update(0.1);
      travel.push(distance(ordinary.state.ghosts[0], ordinary.state.maze.pen));
      playerTravel.push(distance(ordinary.state.player, ordinary.state.maze.playerStart));
      game.update(0.1); power.push(game.state.powerRemaining);
    }
    expect(travel[0]).toBeCloseTo(DEFAULT_CONFIG.ghostSpeeds[0] * 0.1);
    expect(travel[1]).toBeGreaterThan(travel[0]); expect(travel[2]).toBeGreaterThan(travel[1]);
    for (const moved of playerTravel) expect(moved).toBeCloseTo(DEFAULT_CONFIG.playerSpeed * 0.1);
    expect(power[1]).toBeCloseTo(power[0]); expect(power[2]).toBeCloseTo(power[0]);
  });
});
