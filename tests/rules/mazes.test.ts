import { describe, expect, it } from 'vitest';
import { LEVELS } from '../../src/mazes';

describe('authored campaign mazes', () => {
  it('provides three different levels', () => {
    expect(LEVELS).toHaveLength(3);
    expect(new Set(LEVELS.map(level => level.rows.join('\n'))).size).toBe(3);
  });
  for (const maze of LEVELS) {
    it(`${maze.name}: all passages and pellets are reachable from the player`, () => {
      const width = maze.rows[0].length;
      expect(maze.rows.every(row => row.length === width)).toBe(true);
      const seen = new Set<string>();
      const pending = [maze.playerStart];
      while (pending.length) {
        const { x, y } = pending.pop()!;
        const key = `${x},${y}`;
        if (seen.has(key) || !maze.rows[y] || maze.rows[y][x] === '#') continue;
        seen.add(key);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          let nx = x + dx;
          const ny = y + dy;
          if (ny === maze.tunnelRow) nx = (nx + width) % width;
          if (nx >= 0 && nx < width && ny >= 0 && ny < maze.rows.length) pending.push({ x: nx, y: ny });
        }
      }
      let pellets = 0;
      maze.rows.forEach((row, y) => [...row].forEach((tile, x) => {
        if (tile !== '#') expect(seen.has(`${x},${y}`), `unreachable passage ${x},${y}`).toBe(true);
        if (tile === '.' || tile === 'o') pellets++;
      }));
      expect(pellets).toBeGreaterThan(200);
      expect(seen.has(`${maze.pen.x},${maze.pen.y}`)).toBe(true);
      expect(maze.rows[maze.pen.y][maze.pen.x]).toBe(' ');
      const openEdges = maze.rows.flatMap((row, y) => [row[0], row[width - 1]].filter(tile => tile !== '#').map(() => y));
      expect(openEdges).toEqual([maze.tunnelRow, maze.tunnelRow]);
      expect(maze.rows.flatMap(row => [...row]).filter(tile => tile === 'o')).toHaveLength(4);
    });
  }
});
