export const SOUND = {
  volume: 0.055,
  pellet: [520, 640], power: [240, 480, 720], caught: [180, 120, 65],
  ghost: [450, 700, 950], complete: [420, 530, 630, 840], start: [330, 440, 660],
};
export type SoundName = 'pellet' | 'power' | 'caught' | 'ghost' | 'complete' | 'start';
export class AudioFeedback {
  private context?: AudioContext;
  private lastPellet = 0;
  constructor(public muted: boolean) {}
  unlock(): void {
    if (this.muted) return;
    try {
      this.context ??= new AudioContext();
      void this.context.resume().catch(() => {});
    } catch { /* Audio is optional when the browser cannot provide it. */ }
  }
  play(name: SoundName): void {
    if (this.muted || !this.context || this.context.state !== 'running') return;
    const now = this.context.currentTime;
    if (name === 'pellet' && now - this.lastPellet < 0.065) return;
    if (name === 'pellet') this.lastPellet = now;
    SOUND[name].forEach((frequency, index) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.context!.createGain();
      const start = now + index * 0.075;
      oscillator.type = name === 'caught' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(SOUND.volume, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.09);
      oscillator.connect(gain); gain.connect(this.context!.destination);
      oscillator.start(start); oscillator.stop(start + 0.1);
    });
  }
}
