import { expect, test, type Page } from '@playwright/test';

async function fixture(page: Page, outcome: 'win' | 'loss') {
  // Supply a tiny deterministic authored maze at the content seam; no production debug controls.
  const rows = outcome === 'win' ? ['#####', '# . #', '     ', '#####'] : ['#####', '#. .#', '     ', '#####'];
  const definition = { name: 'Acceptance maze', rows, playerStart: { x: 1, y: 1 }, pen: { x: outcome === 'win' ? 3 : 1, y: 1 }, tunnelRow: 2 };
  await page.route('**/src/mazes.ts', route => route.fulfill({ contentType: 'application/javascript', body: `export const LEVELS = ${JSON.stringify([definition, definition, definition])};` }));
  if (outcome === 'loss') {
    await page.route('**/src/game.ts', async route => {
      const response = await route.fetch();
      const source = await response.text();
      await route.fulfill({ response, body: source.replace('releaseDelays: [2, 6, 10, 14]', 'releaseDelays: [0, 0, 0, 0]') });
    });
  }
}
async function start(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start campaign' }).click();
}

test('keyboard menus, countdown, equivalent steering, pause, restart and mute persistence', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.clock.install(); await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start campaign' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Get ready' })).toBeVisible();
  await page.keyboard.press('ArrowLeft'); await page.clock.runFor(3300);
  await expect(page.locator('#overlay')).toBeHidden();
  await page.screenshot({ path: `.cache/${test.info().project.name}-playing.png`, fullPage: true });
  await page.clock.runFor(450); await page.keyboard.press('p');
  await expect(page.getByRole('heading', { name: 'Chase paused.' })).toBeVisible();
  const score = await page.locator('#score').textContent();
  await page.clock.runFor(5000); await expect(page.locator('#score')).toHaveText(score!);
  await page.keyboard.press('Escape'); await expect(page.locator('#overlay')).toBeHidden();
  await page.keyboard.press('a'); await page.clock.runFor(300);
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page.locator('#score')).toHaveText('00000'); await expect(page.locator('#lives')).toHaveText('3 / 3');
  await page.getByRole('button', { name: 'Sound on' }).click();
  await expect(page.getByRole('button', { name: 'Sound off' })).toHaveAttribute('aria-pressed', 'true');
  await page.reload(); await expect(page.getByRole('button', { name: 'Sound off' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('arrow keys and WASD produce the same collected score', async ({ page }) => {
  await fixture(page, 'win'); await page.clock.install(); await start(page);
  await page.keyboard.press('ArrowRight'); await page.clock.runFor(3500);
  await expect(page.locator('#score')).toHaveText('00010');
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await page.keyboard.press('d'); await page.clock.runFor(3500);
  await expect(page.locator('#score')).toHaveText('00010');
  await expect(page.getByRole('button', { name: 'Next level' })).toBeVisible();
});

test('losing browser focus pauses until an explicit resume', async ({ page, context }) => {
  await start(page);
  const other = await context.newPage(); await other.goto('about:blank'); await other.bringToFront();
  await page.bringToFront();
  // All target engines also expose the browser blur event, used if the automation host did not change OS focus.
  if (!(await page.getByRole('heading', { name: 'Chase paused.' }).isVisible())) await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('button', { name: 'Resume campaign' })).toBeVisible();
  await page.waitForTimeout(100); await expect(page.getByRole('button', { name: 'Resume campaign' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume campaign' }).click();
  await expect(page.getByRole('heading', { name: 'Get ready' })).toBeVisible(); await other.close();
});

test('three level transitions, victory, and local best-score persistence', async ({ page }) => {
  await fixture(page, 'win'); await page.clock.install(); await start(page);
  for (let level = 1; level <= 3; level++) {
    await page.keyboard.press('ArrowRight'); await page.clock.runFor(3500);
    await expect(page.locator('#score')).toHaveText(String(level * 10).padStart(5, '0'));
    if (level < 3) {
      await expect(page.getByRole('heading', { name: 'One step closer.' })).toBeVisible();
      await page.getByRole('button', { name: 'Next level' }).click();
      await expect(page.locator('#level')).toHaveText(`${level + 1} / 3`);
    }
  }
  await expect(page.getByRole('heading', { name: 'You made it.' })).toBeVisible();
  await expect(page.locator('#best')).toHaveText('00030');
  await page.reload(); await expect(page.locator('#best')).toHaveText('00030');
});

test('game over after three catches and keyboard play again', async ({ page }) => {
  await fixture(page, 'loss'); await page.clock.install(); await start(page);
  for (let life = 0; life < 3; life++) { await page.keyboard.press('ArrowRight'); await page.clock.runFor(3500); }
  await expect(page.getByRole('heading', { name: 'Caught. Try again.' })).toBeVisible();
  await expect(page.locator('#lives')).toHaveText('0 / 3');
  await expect(page.locator('#best')).toHaveText('00010');
  await expect(page.getByRole('button', { name: 'Play again' })).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.locator('#lives')).toHaveText('3 / 3');
  await page.reload(); await expect(page.locator('#best')).toHaveText('00010');
});

test('reduced motion, readable controls and compact desktop layout', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await expect(page.getByRole('complementary', { name: 'How to play' })).toBeVisible();
  await expect(page.locator('.ghost-icon')).toHaveCount(4);
  const shapes = await page.locator('.ghost-icon').evaluateAll(elements => elements.map(element => {
    const style = getComputedStyle(element); return `${style.clipPath}|${style.borderRadius}`;
  }));
  expect(new Set(shapes).size).toBe(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.cache/${test.info().project.name}-title.png`, fullPage: true });
});
