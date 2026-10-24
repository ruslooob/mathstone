import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
const stamp = resolve(root, 'node_modules/.mathstone-dependencies');

function fingerprint() {
  return createHash('sha256')
    .update(readFileSync(resolve(root, 'package.json')))
    .update(readFileSync(resolve(root, 'package-lock.json')))
    .update(`${process.version}/${process.platform}/${process.arch}`)
    .digest('hex');
}

function recordDependencies() {
  mkdirSync(resolve(root, 'node_modules'), { recursive: true });
  writeFileSync(stamp, fingerprint());
}

export function ensureDependencies() {
  if (existsSync(stamp) && readFileSync(stamp, 'utf8') === fingerprint()
    && existsSync(resolve(root, 'node_modules/vite/bin/vite.js'))
    && existsSync(resolve(root, 'node_modules/react/package.json'))
    && existsSync(resolve(root, 'node_modules/react-dom/package.json'))) return;

  const result = spawnSync('npm', ['ci', '--no-audit', '--no-fund'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
  recordDependencies();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--record')) recordDependencies();
  else ensureDependencies();
}
