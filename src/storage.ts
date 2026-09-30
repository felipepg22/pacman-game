const KEYS = { best: 'pac-mano.best-score', muted: 'pac-mano.muted' };
function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* Play remains available without storage. */ }
}
export function loadBest(): number {
  const value = Number(read(KEYS.best));
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}
export function saveBest(score: number): number {
  const best = Math.max(loadBest(), Math.floor(score));
  write(KEYS.best, String(best));
  return best;
}
export function loadMuted(): boolean { return read(KEYS.muted) === 'true'; }
export function saveMuted(muted: boolean): void { write(KEYS.muted, String(muted)); }
