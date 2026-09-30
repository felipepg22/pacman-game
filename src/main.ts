import './style.css';
import { Campaign } from './game';
import { Renderer } from './render';
import { AudioFeedback, type SoundName } from './audio';
import { loadBest, loadMuted, saveBest, saveMuted } from './storage';
import type { Direction, Phase } from './types';

const app = document.querySelector<HTMLElement>('#app')!;
app.innerHTML = `
<div class="shell">
  <header class="masthead"><div class="brand"><span class="brand-mark" aria-hidden="true"></span><span class="brand-name">PAC MANO</span></div><span class="edition">Original maze-chase · three-level campaign</span></header>
  <div class="layout">
    <section aria-label="Arcade cabinet">
      <div class="hud" aria-label="Campaign status">
        <div class="stat"><span>Score</span><strong id="score">00000</strong></div>
        <div class="stat"><span>Best score</span><strong id="best">00000</strong></div>
        <div class="stat"><span>Lives</span><strong id="lives">3 / 3</strong></div>
        <div class="stat"><span>Level</span><strong id="level">1 / 3</strong></div>
      </div>
      <div class="playfield"><canvas aria-label="Pac Mano maze. Use arrow keys or WASD to steer." role="img"></canvas><div class="overlay" id="overlay"><div class="menu" id="menu"></div></div></div>
      <div class="power" id="power"><span class="power-label" id="power-label">POWER —</span><div class="power-track" aria-hidden="true"><div class="power-fill" id="power-fill"></div></div><span id="maze-name">ATRIUM</span></div>
      <div id="announcement" class="sr-only" role="status" aria-live="polite"></div>
    </section>
    <aside class="sidebar" aria-label="How to play">
      <section><h2>A little maze.<br>A big chase.</h2><p>Collect every pellet. Outsmart four ghosts. Make it through three mazes with three shared lives.</p>
        <div class="keys"><kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd><span class="key-description">Steer</span></div>
        <div class="keys"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span class="key-description">Also steer</span></div>
        <div class="keys"><kbd>Esc</kbd><span class="key-description">or</span><kbd>P</kbd><span class="key-description">Pause / resume</span></div>
        <div class="toolbar"><button id="pause" disabled>Pause</button><button id="restart">Restart</button><button id="mute" aria-pressed="false">Sound on</button></div>
      </section>
      <section><h2>Meet the chase</h2><ul class="ghost-list">
        <li><span class="ghost-icon direct" aria-hidden="true"></span><div><strong>Rook · square</strong><small>Chases your position</small></div></li>
        <li><span class="ghost-icon ahead" aria-hidden="true"></span><div><strong>Kite · diamond</strong><small>Aims ahead of you</small></div></li>
        <li><span class="ghost-icon patrol" aria-hidden="true"></span><div><strong>Orbit · circle</strong><small>Patrols, then pursues</small></div></li>
        <li><span class="ghost-icon retreat" aria-hidden="true"></span><div><strong>Flare · trapezoid</strong><small>Approaches, then retreats</small></div></li>
      </ul></section>
      <section><h2>Turn the tables</h2><p>Big pellets give you eight seconds to eat frightened ghosts. A yellow outline warns of the final two seconds.</p><p>Returning eyes are harmless. Once back in the pen, a ghost becomes dangerous again—even while your power timer runs.</p></section>
    </aside>
  </div>
  <footer class="footer"><span>10 / pellet · 50 / power pellet</span><span>Take the side tunnels. Queue your next turn.</span></footer>
</div>`;
const el = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
const campaign = new Campaign();
const renderer = new Renderer(app.querySelector('canvas')!);
const audio = new AudioFeedback(loadMuted());
let best = loadBest();
let previousPhase: Phase | undefined;
let previousCountdown = -1;
let lastFrame = performance.now();
const menu = el('menu');
const overlay = el('overlay');
const pauseButton = el<HTMLButtonElement>('pause');
const muteButton = el<HTMLButtonElement>('mute');
const announce = (text: string) => { el('announcement').textContent = text; };
const formatScore = (score: number) => String(score).padStart(5, '0');

function menuButton(label: string, action: string, primary = true): string {
  return `<button data-action="${action}"${primary ? ' class="primary"' : ''}>${label}</button>`;
}
function updateMenu(): void {
  const state = campaign.state;
  const changed = previousPhase !== state.phase;
  const countdown = Math.ceil(state.readyRemaining);
  if (!changed && (state.phase !== 'ready' || countdown === previousCountdown)) return;
  previousCountdown = countdown;
  previousPhase = state.phase;
  overlay.hidden = state.phase === 'playing';
  let announcement = '';
  switch (state.phase) {
    case 'title':
      menu.innerHTML = `<div class="eyebrow">Three mazes. One campaign.</div><h1>PAC<br>MANO</h1><p>A little maze. A big chase.<br>Collect every pellet and keep moving.</p><div class="buttons">${menuButton('Start campaign', 'start')}</div><p class="hint">Arrows or WASD to steer · Esc or P to pause</p>`;
      announcement = 'Welcome to Pac Mano. Start campaign when ready.'; break;
    case 'ready':
      menu.innerHTML = `<div class="eyebrow">Level ${state.levelIndex + 1} · ${state.maze.name}</div><h2>Get ready</h2><div class="countdown">${Math.max(1, countdown)}</div><p class="hint">Choose your first direction.</p>`;
      announcement = changed ? `Get ready. Level ${state.levelIndex + 1}, ${state.maze.name}. Three seconds.` : ''; break;
    case 'playing': announcement = 'Go. Collect every pellet.'; break;
    case 'paused':
      menu.innerHTML = `<div class="eyebrow">Take a breather</div><h2>Chase paused.</h2><p>Your maze will be right here.<br>Resume when you’re ready.</p><div class="buttons">${menuButton('Resume campaign', 'resume')}${menuButton('Restart', 'restart', false)}</div>`;
      announcement = 'Campaign paused. Resume explicitly to continue.'; break;
    case 'level-complete':
      menu.innerHTML = `<div class="eyebrow">Maze cleared</div><h2>One step closer.</h2><p>${state.maze.name} complete.<br>${formatScore(state.score)} points · ${state.lives} lives remaining</p><div class="buttons">${menuButton('Next level', 'next')}</div>`;
      announcement = `Level complete. ${state.score} points. Continue to the next level.`; break;
    case 'game-over':
    case 'victory': {
      best = saveBest(state.score);
      const won = state.phase === 'victory';
      menu.innerHTML = `<div class="eyebrow">${won ? 'All three mazes cleared' : 'The chase ends here'}</div><h2>${won ? 'You made it.' : 'Caught. Try again.'}</h2><p>${won ? 'A complete campaign. Nicely played.' : 'Every chase teaches you a new route.'}<br>Score ${formatScore(state.score)} · best ${formatScore(best)}</p><div class="buttons">${menuButton('Play again', 'restart')}</div>`;
      announcement = `${won ? 'Victory' : 'Game over'}. Score ${state.score}. Best score ${best}.`; break;
    }
  }
  if (announcement) announce(announcement);
  if (changed) {
    const focusTarget = menu.querySelector<HTMLButtonElement>('button');
    if (focusTarget) focusTarget.focus({ preventScroll: true });
    else if (menu.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
  }
}
function refresh(): void {
  updateMenu();
  const state = campaign.state;
  el('score').textContent = formatScore(state.score);
  el('best').textContent = formatScore(best);
  el('lives').textContent = `${state.lives} / 3`;
  el('level').textContent = `${state.levelIndex + 1} / ${campaign.levels.length}`;
  el('maze-name').textContent = state.maze.name.toUpperCase();
  el('power-label').textContent = state.powerRemaining > 0 ? `POWER ${state.powerRemaining.toFixed(1)}s` : 'POWER —';
  el('power-fill').style.width = `${state.powerRemaining / campaign.config.powerSeconds * 100}%`;
  el('power').classList.toggle('warning', state.powerWarning);
  pauseButton.disabled = !['playing', 'ready', 'paused'].includes(state.phase);
  pauseButton.textContent = state.phase === 'paused' ? 'Resume' : 'Pause';
  muteButton.textContent = audio.muted ? 'Sound off' : 'Sound on';
  muteButton.setAttribute('aria-pressed', String(audio.muted));
}
function act(action: string): void {
  audio.unlock();
  if (action === 'start') campaign.start();
  if (action === 'resume') campaign.resume();
  if (action === 'restart') campaign.restart();
  if (action === 'next') campaign.advanceLevel();
  refresh();
}
menu.addEventListener('click', event => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
  if (target) act(target.dataset.action!);
});
pauseButton.addEventListener('click', () => {
  audio.unlock();
  if (campaign.state.phase === 'paused') campaign.resume(); else campaign.pause();
  refresh();
});
el('restart').addEventListener('click', () => act('restart'));
muteButton.addEventListener('click', () => { audio.muted = !audio.muted; saveMuted(audio.muted); audio.unlock(); refresh(); });
const directions: Record<string, Direction> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
window.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const direction = directions[event.key] ?? directions[event.key.toLowerCase()];
  if (direction && ['ready', 'playing'].includes(campaign.state.phase)) { event.preventDefault(); audio.unlock(); campaign.turn(direction); }
  if (event.key === 'Escape' || event.key.toLowerCase() === 'p') {
    if (event.repeat) return;
    if (['ready', 'playing', 'paused'].includes(campaign.state.phase)) {
      event.preventDefault(); audio.unlock();
      if (campaign.state.phase === 'paused') campaign.resume(); else campaign.pause();
      refresh();
    }
  }
});
function automaticallyPause(): void { campaign.pause(); refresh(); lastFrame = performance.now(); }
window.addEventListener('blur', automaticallyPause);
document.addEventListener('visibilitychange', () => { if (document.hidden) automaticallyPause(); lastFrame = performance.now(); });
const soundEvents: Record<string, SoundName> = { pellet: 'pellet', power: 'power', eat: 'ghost', caught: 'caught', level: 'complete', victory: 'complete', start: 'start' };
function frame(now: number): void {
  const delta = Math.min((now - lastFrame) / 1000, .1);
  lastFrame = now;
  campaign.update(delta);
  for (const event of campaign.drainEvents()) {
    audio.play(soundEvents[event]);
    if (event === 'caught') announce(`Caught. ${campaign.state.lives} lives remaining.`);
    if (event === 'power') announce('Power pellet. Frightened ghosts are edible for eight seconds.');
  }
  refresh(); renderer.draw(campaign.state, now / 1000);
  requestAnimationFrame(frame);
}
refresh();
requestAnimationFrame(frame);
