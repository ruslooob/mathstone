import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { ensureDependencies, root } from './install.mjs';

ensureDependencies();
const server = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js')], {
  cwd: root,
  stdio: 'inherit',
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.on('exit', code => { process.exitCode = code ?? 0; });
