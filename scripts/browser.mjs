import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';

const project = fileURLToPath(new URL('../', import.meta.url));
const cli = fileURLToPath(new URL('../node_modules/@playwright/test/cli.js', import.meta.url));
const temporary = fileURLToPath(new URL('../.cache/tmp', import.meta.url));
mkdirSync(temporary, { recursive: true });
const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], {
  cwd: project,
  env: { ...process.env, TMPDIR: temporary, TMP: temporary, TEMP: temporary, PLAYWRIGHT_BROWSERS_PATH: fileURLToPath(new URL('../.cache/browsers', import.meta.url)) },
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
