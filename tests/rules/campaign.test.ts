import { describe, expect, it } from 'vitest';
import { Campaign, DEFAULT_CONFIG } from '../../src/game';
import type { MazeDefinition, GameConfig } from '../../src/types';

const maze = (rows: string[], playerStart = { x: 1, y: 1 }, pen = { x: 5, y: 3 }, tunnelRow = 2): MazeDefinition => ({ name: 'Fixture', rows, playerStart, pen, tunnelRow });
const movement = maze(['#######', '# ....#', '  # #  ', '# ....#', '#######']);
const quiet: Partial<GameConfig> = { readySeconds: 0, playerSpeed: 1, ghostSpeeds: [0, 0, 0], releaseDelays: [1000, 1000, 1000, 1000] };
function playing(level = movement, config: Partial<GameConfig> = {}) { const game = new Campaign([level], { ...quiet, ...config }); game.start(); return game; }

describe('player commands and controlled elapsed time', () => {
  it('has a three-second ready countdown and freezes it while paused', () => {
    const game = playing(movement, { readySeconds: 3 });
    expect(game.state.phase).toBe('ready'); game.update(1);
    expect(game.state.readyRemaining).toBe(2);
    game.pause(); game.update(20); expect(game.state.readyRemaining).toBe(2);
    game.resume(); game.update(2); expect(game.state.phase).toBe('playing');
    expect(game.state.player).toMatchObject({ x: 1, y: 1 });
  });
  it('moves continuously and stops at a wall', () => {
    const game = playing(); game.turn('right'); game.update(10);
    expect(game.state.player).toMatchObject({ x: 5, y: 1 });
    expect(game.state.score).toBe(40);
  });
  it('reverses immediately in the middle of a corridor', () => {
    const game = playing(); game.turn('right'); game.update(0.4);
    expect(game.state.player.x).toBeCloseTo(1.4);
    game.turn('left'); game.update(0.2); expect(game.state.player.x).toBeCloseTo(1.2);
  });
  it('queues an early turn until the center of a valid passage', () => {
    const level = maze(['#######', '# ....#', ' #  #  ', '# ....#', '#######']);
    const game = playing(level); game.turn('right'); game.update(0.4); game.turn('down');
    game.update(0.8); expect(game.state.player).toMatchObject({ direction: 'down' });
    expect(game.state.player.x).toBeCloseTo(2); expect(game.state.player.y).toBeCloseTo(1.2);
  });
  it('retains only the latest direction request', () => {
    const game = playing(); game.turn('right'); game.update(0.4);
    game.turn('down'); game.turn('up'); game.update(1.8);
    expect(game.state.player.y).toBe(1); expect(game.state.queuedDirection).toBe('up');
  });
  it('wraps through the side tunnel in both directions', () => {
    const level = maze(['#######', '#.....#', '       ', '#.....#', '#######'], { x: 0, y: 2 });
    const game = playing(level); game.update(1); expect(game.state.player.x).toBeCloseTo(6);
    game.turn('right'); game.update(1); expect(game.state.player.x).toBeCloseTo(0);
  });
  it('freezes all gameplay and release timers while paused and resumes explicitly', () => {
    const game = playing(); game.turn('right'); game.update(0.3); game.pause();
    const before = structuredClone(game.state); game.update(500);
    expect(game.state).toEqual(before); game.resume(); game.update(0.2);
    expect(game.state.player.x).toBeCloseTo(1.5);
  });
  it('ignores non-positive and invalid elapsed values', () => {
    const game = playing(); const before = structuredClone(game.state);
    for (const elapsed of [0, -1, NaN, Infinity]) game.update(elapsed);
    expect(game.state).toEqual(before);
  });
});

describe('collection, collision, and campaign progression', () => {
  it('awards normal and power values, applies eight seconds, and warns in the final two', () => {
    const level = maze(['#######', '# o ..#', '  # #  ', '# ....#', '#######']);
    const game = playing(level); game.turn('right'); game.update(1);
    expect(game.state.score).toBe(50); expect(game.state.powerRemaining).toBeCloseTo(8);
    game.turn('up'); game.update(6.01);
    expect(game.state.powerWarning).toBe(true); expect(game.state.powerRemaining).toBeCloseTo(1.99);
    game.update(2); expect(game.state.powerRemaining).toBe(0); expect(game.state.powerWarning).toBe(false);
  });
  it('a second power pellet renews the eight-second period', () => {
    const level = maze(['#######', '# oo..#', '  # #  ', '# ....#', '#######']);
    const game = playing(level); game.turn('right'); game.update(2);
    expect(game.state.score).toBe(100); expect(game.state.powerRemaining).toBeCloseTo(8);
  });
  it('freezes an active power effect and player commands while paused', () => {
    const level = maze(['#######', '# o ..#', '  # #  ', '# ....#', '#######']);
    const game = playing(level); game.turn('right'); game.update(1); game.pause();
    const before = structuredClone(game.state);
    game.turn('left'); game.update(20); expect(game.state).toEqual(before);
    game.resume(); game.update(1); expect(game.state.powerRemaining).toBeCloseTo(7);
  });
  it('a final pellet wins over simultaneous dangerous contact', () => {
    const level = maze(['#####', '# . #', '     ', '#####'], { x: 1, y: 1 }, { x: 2, y: 1 });
    const game = playing(level, { releaseDelays: [0, 0, 0, 0], collisionRadius: 0.0001 });
    game.turn('right'); game.update(1);
    expect(game.state.phase).toBe('victory'); expect(game.state.lives).toBe(3); expect(game.state.score).toBe(10);
  });
  it('power pickup takes effect before same-moment contact', () => {
    const level = maze(['#####', '# o.#', '     ', '#####'], { x: 1, y: 1 }, { x: 2, y: 1 });
    const game = playing(level, { releaseDelays: [0, 0, 0, 0], frightenedSpeed: 0, collisionRadius: 0.0001 });
    game.turn('right'); game.update(1);
    expect(game.state.lives).toBe(3); expect(game.state.score).toBe(3050);
    expect(game.state.ghosts.every(ghost => ghost.mode === 'returning')).toBe(true);
  });
  it('loses at most one life, preserves pellets/score, and resets positions and power', () => {
    const level = maze(['#######', '# o. .#', '  # #  ', '# ....#', '#######'], { x: 1, y: 1 }, { x: 4, y: 1 });
    const game = playing(level, { readySeconds: 3, releaseDelays: [0, 0, 0, 0], frightenedSpeed: 0 });
    game.update(3); game.turn('right'); game.update(2); const remaining = game.state.pellets.size;
    game.turn('left'); game.update(10); game.turn('right'); game.update(2.5);
    expect(game.state.lives).toBe(2); expect(game.state.score).toBe(60);
    expect(game.state.pellets.size).toBe(remaining); expect(game.state.powerRemaining).toBe(0);
    expect(game.state.player).toMatchObject({ x: 1, y: 1 });
  });
  it('ends on the last life and restart starts a fresh campaign', () => {
    const level = maze(['#######', '# . ..#', '  # #  ', '# ....#', '#######'], { x: 1, y: 1 }, { x: 3, y: 1 });
    const game = playing(level, { releaseDelays: [0, 0, 0, 0] });
    for (let i = 0; i < 3; i++) { game.turn('right'); game.update(1.5); }
    expect(game.state.phase).toBe('game-over'); expect(game.state.lives).toBe(0);
    game.restart(); expect(game.state.lives).toBe(3); expect(game.state.score).toBe(0);
    expect(game.state.levelIndex).toBe(0); expect(game.state.pellets.size).toBe(7);
  });
  it('carries score and lives through three levels and ends in victory', () => {
    const level = maze(['#####', '# . #', '     ', '#####']);
    const game = new Campaign([level, level, level], quiet); game.start();
    for (let i = 0; i < 3; i++) {
      game.turn('right'); game.update(1);
      expect(game.state.score).toBe((i + 1) * 10); expect(game.state.lives).toBe(3);
      expect(game.state.phase).toBe(i === 2 ? 'victory' : 'level-complete');
      game.advanceLevel();
    }
    expect(game.state.levelIndex).toBe(2);
  });
  it('staggered releases provide a safe start and level speeds increase', () => {
    const game = playing(movement, { releaseDelays: [2, 6, 10, 14], ghostSpeeds: [0, 0, 0] });
    game.update(2.1); expect(game.state.ghosts.map(ghost => ghost.mode)).toEqual(['chasing', 'waiting', 'waiting', 'waiting']);
    expect(DEFAULT_CONFIG.ghostSpeeds[0]).toBeLessThan(DEFAULT_CONFIG.ghostSpeeds[1]);
    expect(DEFAULT_CONFIG.ghostSpeeds[1]).toBeLessThan(DEFAULT_CONFIG.ghostSpeeds[2]);
  });
  it('carries a lost life into the next level', () => {
    const level = maze(['#####', '# . #', '     ', '#####'], { x: 1, y: 1 }, { x: 1, y: 1 });
    const game = new Campaign([level, level, level], { ...quiet, releaseDelays: [1, 1, 1, 1] });
    game.start(); game.update(1.01); expect(game.state.lives).toBe(2);
    game.turn('right'); game.update(1); expect(game.state.phase).toBe('level-complete');
    game.advanceLevel(); expect(game.state.lives).toBe(2); expect(game.state.score).toBe(10);
  });
});
