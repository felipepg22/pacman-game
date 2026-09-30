import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: './.cache/vitest',
  test: { include: ['tests/rules/**/*.test.ts'] },
});
