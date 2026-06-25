/**
 * Generate favicon PNG sizes from public/favicon-source.png.
 * Run: npm run generate:favicons
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const result = spawnSync('python3', [join(root, 'generate-favicons.py')], {
  cwd: join(root, '..'),
  stdio: 'inherit',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
