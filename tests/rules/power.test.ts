import { describe, expect, it } from 'vitest';
import { Campaign } from '../../src/game';
import type { GameConfig, MazeDefinition } from '../../src/types';

// A corridor lets released ghosts leave the pen before power freezes their motion.
// The pellet below the start keeps the campaign active throughout each scenario.
function corridor(secondPower: 'none' | 'corridor' | 'below-start' = 'none'): MazeDefinition {
  return {
    name: 'Power scenario',
    rows: [
      '#############',
      secondPower === 'corridor' ? '# o       o #' : '# o         #',
      secondPower === 'below-start' ? '#o.##########' : '#.###########',
      '#############',
    ],
    playerStart: { x: 1, y: 1 },
    pen: { x: 11, y: 1 },
    tunnelRow: -1,
  };
}

function prepare(secondPower: Parameters<typeof corridor>[0] = 'none', config: Partial<GameConfig> = {}): Campaign {
  const game = new Campaign([corridor(secondPower)], {
    readySeconds: 0,
    playerSpeed: 2,
    ghostSpeeds: [1],
    frightenedSpeed: 0,
    returningSpeed: 0,
    releaseDelays: [0, 0.5, 1, 1.5],
    collisionRadius: 0.75,
    ...config,
  });
  game.start();
  game.update(2);
  game.turn('right');
  game.update(1 / game.config.playerSpeed);
  expect(game.state.score).toBe(50);
  expect(game.state.powerRemaining).toBeCloseTo(8);
  game.drainEvents();
  return game;
}

function until(game: Campaign, condition: () => boolean, limit = 12): void {
  for (let elapsed = 0; elapsed < limit && !condition(); elapsed += 1 / 120) game.update(1 / 120);
  expect(condition(), 'scenario did not reach its expected observable state').toBe(true);
}

describe('power captures and ghost regeneration', () => {
  it('awards successive captures 200, 400, 800, then the maximum step of 1,600', () => {
    const game = prepare();
    for (const reward of [200, 400, 800, 1600]) {
      const before = game.state.score;
      until(game, () => game.state.score !== before);
      expect(game.state.score - before).toBe(reward);
      expect(game.drainEvents()).toEqual(['eat']);
    }
    expect(game.state.ghosts.every(ghost => ghost.mode === 'returning')).toBe(true);
    expect(game.state.lives).toBe(3);
    expect(game.state.powerRemaining).toBeGreaterThan(0);
  });

  it('starts a fresh capture chain when another power pellet is collected', () => {
    // The last ghost enters after the second pickup, allowing a new 200-point capture.
    const game = prepare('corridor', { releaseDelays: [0, 0.5, 1, 6.5] });
    until(game, () => game.state.ghosts.filter(ghost => ghost.mode === 'returning').length === 3);
    expect(game.state.score).toBe(50 + 200 + 400 + 800);
    until(game, () => game.state.score === 1500);
    expect(game.state.powerRemaining).toBeCloseTo(8);
    game.turn('left');
    until(game, () => game.state.ghosts[3].mode === 'frightened');
    game.turn('right');
    const before = game.state.score;
    until(game, () => game.state.ghosts[3].mode === 'returning');
    expect(game.state.score - before).toBe(200);
    expect(game.state.lives).toBe(3);
  });

  it('keeps returning contact harmless and inedible, then immediately dangerous at the pen', () => {
    const game = prepare('none', {
      playerSpeed: 1.2,
      returningSpeed: 1.2,
      releaseDelays: [0, 999, 999, 999],
    });
    until(game, () => game.state.ghosts[0].mode === 'returning');
    expect(game.state.score).toBe(250);
    expect(game.drainEvents()).toContain('eat');
    let observedHarmlessContact = false;
    for (let elapsed = 0; elapsed < 8 && game.state.lives === 3; elapsed += 1 / 120) {
      const ghost = game.state.ghosts[0];
      if (ghost.mode === 'returning' && Math.hypot(ghost.x - game.state.player.x, ghost.y - game.state.player.y) < game.config.collisionRadius) {
        observedHarmlessContact = true;
      }
      game.update(1 / 120);
      if (game.state.lives === 3) {
        expect(game.state.score).toBe(250);
        expect(game.state.powerRemaining).toBeGreaterThan(0);
        expect(game.drainEvents()).not.toContain('eat');
      }
    }
    expect(observedHarmlessContact).toBe(true);
    expect(game.state.lives).toBe(2);
    expect(game.state.score).toBe(250);
    expect(game.drainEvents()).toContain('caught');
  });

  it('allows a fresh power pellet after regeneration to frighten that ghost immediately', () => {
    const game = prepare('below-start', {
      returningSpeed: 1,
      releaseDelays: [0, 999, 999, 999],
    });
    until(game, () => game.state.ghosts[0].mode === 'returning');
    game.turn('left');
    until(game, () => game.state.ghosts[0].mode === 'chasing');
    expect(game.state.powerRemaining).toBeGreaterThan(0);
    expect(game.state.lives).toBe(3);
    until(game, () => game.state.player.x === 1);
    game.turn('down');
    until(game, () => game.state.score === 300);
    expect(game.state.phase).toBe('playing');
    expect(game.state.ghosts[0].mode).toBe('frightened');
    expect(game.state.powerRemaining).toBeCloseTo(8);
    game.turn('up');
    until(game, () => game.state.player.y === 1);
    game.turn('right');
    until(game, () => game.state.ghosts[0].mode === 'returning');
    expect(game.state.score).toBe(500);
  });

  it('makes regenerated contact dangerous while another ghost remains frightened', () => {
    const game = prepare('none', {
      playerSpeed: 1.2,
      returningSpeed: 1.3,
      releaseDelays: [0, 5, 999, 999],
    });
    until(game, () => game.state.ghosts[0].mode === 'returning');
    expect(game.state.ghosts[1].mode).toBe('frightened');
    expect(game.state.score).toBe(250);
    until(game, () => game.state.ghosts[0].mode === 'chasing');
    expect(game.state.ghosts[1].mode).toBe('frightened');
    expect(game.state.powerRemaining).toBeGreaterThan(0);
    expect(game.state.lives).toBe(3);
    game.drainEvents();
    until(game, () => game.state.lives === 2);
    expect(game.state.score).toBe(250);
    expect(game.drainEvents()).toEqual(['caught']);
  });

  it('does not carry a power pickup during return through regeneration', () => {
    const game = prepare('corridor', {
      playerSpeed: 1,
      returningSpeed: 1,
      releaseDelays: [0, 999, 999, 999],
    });
    until(game, () => game.state.ghosts[0].mode === 'returning');
    until(game, () => game.state.score === 300);
    expect(game.state.ghosts[0].mode).toBe('returning');
    expect(game.state.powerRemaining).toBeCloseTo(8);
    until(game, () => game.state.lives === 2);
    expect(game.state.score).toBe(300);
    expect(game.drainEvents()).toContain('caught');
  });
});
