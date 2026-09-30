export type Direction = 'up' | 'down' | 'left' | 'right';
export interface Point { x: number; y: number }
export interface MazeDefinition {
  name: string;
  rows: string[];
  playerStart: Point;
  pen: Point;
  tunnelRow: number;
}
export type Phase = 'title' | 'ready' | 'playing' | 'paused' | 'level-complete' | 'game-over' | 'victory';
export type GhostMode = 'waiting' | 'chasing' | 'frightened' | 'returning';
export interface Character extends Point { direction: Direction }
export interface Ghost extends Character { id: number; mode: GhostMode; releaseRemaining: number }
export interface GameConfig {
  playerSpeed: number;
  ghostSpeeds: number[];
  frightenedSpeed: number;
  returningSpeed: number;
  releaseDelays: number[];
  readySeconds: number;
  powerSeconds: number;
  collisionRadius: number;
}
export type GameEvent = 'pellet' | 'power' | 'eat' | 'caught' | 'level' | 'victory' | 'start';
export interface CampaignState {
  phase: Phase;
  maze: MazeDefinition;
  levelIndex: number;
  score: number;
  lives: number;
  powerRemaining: number;
  powerWarning: boolean;
  readyRemaining: number;
  elapsed: number;
  player: Character;
  ghosts: Ghost[];
  pellets: Map<string, 'pellet' | 'power'>;
  queuedDirection: Direction | null;
}
