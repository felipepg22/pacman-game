import type { CampaignState, Direction, Ghost } from './types';

export const PALETTE = {
  floor: 'oklch(12% .019 145)', wall: 'oklch(32% .045 150)', wallEdge: 'oklch(48% .055 145)', pellet: 'oklch(80% .05 115)',
  player: 'oklch(88% .16 95)', frightened: 'oklch(83% .045 240)', return: 'oklch(89% .024 115)',
  ghosts: ['oklch(74% .13 32)', 'oklch(75% .10 300)', 'oklch(77% .09 220)', 'oklch(78% .13 65)'],
};
const ANGLE: Record<Direction, number> = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
export class Renderer {
  private readonly ctx: CanvasRenderingContext2D;
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D is required to play Pac Mano.');
    this.ctx = ctx;
  }
  draw(state: CampaignState, time: number): void {
    const { canvas, ctx } = this;
    const size = canvas.clientWidth;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 3);
    const width = Math.round(size * pixelRatio);
    if (canvas.width !== width || canvas.height !== width) { canvas.width = width; canvas.height = width; }
    const columns = state.maze.rows[0].length;
    const tile = size / columns;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.fillStyle = PALETTE.floor; ctx.fillRect(0, 0, size, size);
    state.maze.rows.forEach((row, y) => [...row].forEach((cell, x) => {
      if (cell !== '#') return;
      ctx.fillStyle = PALETTE.wall; ctx.fillRect(x * tile, y * tile, tile + .3, tile + .3);
      ctx.strokeStyle = PALETTE.wallEdge; ctx.lineWidth = 1;
      const edges = [
        [x - 1, y, x * tile + .5, y * tile, x * tile + .5, (y + 1) * tile],
        [x + 1, y, (x + 1) * tile - .5, y * tile, (x + 1) * tile - .5, (y + 1) * tile],
        [x, y - 1, x * tile, y * tile + .5, (x + 1) * tile, y * tile + .5],
        [x, y + 1, x * tile, (y + 1) * tile - .5, (x + 1) * tile, (y + 1) * tile - .5],
      ];
      for (const [nx, ny, x1, y1, x2, y2] of edges) {
        if (state.maze.rows[ny]?.[nx] === '#') continue;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
    }));
    const pellets = state.phase === 'title'
      ? state.maze.rows.flatMap((row, y) => [...row].flatMap((cell, x) => cell === '.' || cell === 'o' ? [[`${x},${y}`, cell === 'o' ? 'power' : 'pellet'] as const] : []))
      : [...state.pellets];
    for (const [position, type] of pellets) {
      const [x, y] = position.split(',').map(Number);
      const pulse = this.reduced.matches ? 1 : .92 + Math.sin(time * 3) * .08;
      ctx.fillStyle = type === 'power' ? PALETTE.player : PALETTE.pellet;
      ctx.beginPath(); ctx.arc((x + .5) * tile, (y + .5) * tile, tile * (type === 'power' ? .23 * pulse : .065), 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = 'oklch(60% .06 145)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.strokeRect((state.maze.pen.x - 1) * tile + 3, (state.maze.pen.y - 1) * tile + 3, tile * 3 - 6, tile * 3 - 6);
    ctx.setLineDash([]);
    this.player(state, tile);
    for (const ghost of state.ghosts) this.ghost(ghost, tile, state.powerWarning);
  }
  private player(state: CampaignState, tile: number): void {
    const ctx = this.ctx;
    ctx.save(); ctx.translate((state.player.x + .5) * tile, (state.player.y + .5) * tile); ctx.rotate(ANGLE[state.player.direction]);
    const mouth = state.phase === 'playing' && !this.reduced.matches ? .25 + Math.abs(Math.sin(state.elapsed * 14)) * .28 : .35;
    ctx.fillStyle = PALETTE.player; ctx.beginPath();
    ctx.moveTo(-tile * .04, 0); ctx.arc(0, 0, tile * .39, mouth, Math.PI * 2 - mouth); ctx.closePath(); ctx.fill();
    ctx.fillStyle = PALETTE.floor; ctx.beginPath(); ctx.arc(tile * .02, -tile * .21, tile * .055, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  private ghost(ghost: Ghost, tile: number, warning: boolean): void {
    const ctx = this.ctx; const r = tile * .39;
    const waitingX = ghost.mode === 'waiting' ? (ghost.id % 2 === 0 ? -.55 : .55) : 0;
    const waitingY = ghost.mode === 'waiting' ? (ghost.id < 2 ? -.55 : .55) : 0;
    ctx.save(); ctx.translate((ghost.x + .5 + waitingX) * tile, (ghost.y + .5 + waitingY) * tile);
    if (ghost.mode !== 'returning') {
      ctx.fillStyle = ghost.mode === 'frightened' ? PALETTE.frightened : PALETTE.ghosts[ghost.id];
      ctx.globalAlpha = ghost.mode === 'waiting' ? .65 : 1;
      ctx.beginPath();
      if (ghost.id === 0) { ctx.roundRect(-r, -r, r * 2, r * 2, [r * .65, r * .65, r * .2, r * .2]); }
      if (ghost.id === 1) { ctx.moveTo(0,-r); ctx.lineTo(r,0); ctx.lineTo(0,r); ctx.lineTo(-r,0); ctx.closePath(); }
      if (ghost.id === 2) ctx.arc(0,0,r,0,Math.PI*2);
      if (ghost.id === 3) { ctx.moveTo(-r*.6,-r); ctx.lineTo(r*.6,-r); ctx.lineTo(r,r); ctx.lineTo(-r,r); ctx.closePath(); }
      ctx.fill();
      if (ghost.mode === 'frightened') {
        ctx.strokeStyle = warning ? PALETTE.player : PALETTE.floor; ctx.lineWidth = warning ? 2 : 1;
        ctx.stroke(); ctx.beginPath(); ctx.moveTo(-r*.5,r*.5); ctx.lineTo(-r*.2,r*.3); ctx.lineTo(r*.1,r*.5); ctx.lineTo(r*.4,r*.3); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    const dx = ghost.direction === 'left' ? -1 : ghost.direction === 'right' ? 1 : 0;
    const dy = ghost.direction === 'up' ? -1 : ghost.direction === 'down' ? 1 : 0;
    for (const offset of [-.15,.15]) {
      ctx.fillStyle = 'oklch(95% .03 100)'; ctx.beginPath(); ctx.ellipse(tile*offset,-tile*.06,tile*.095,tile*.115,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = PALETTE.floor; ctx.beginPath(); ctx.arc(tile*offset+dx*tile*.035,-tile*.06+dy*tile*.035,tile*.046,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
}
