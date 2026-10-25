import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { randomBytes } from 'node:crypto';

export default defineConfig(({ command }) => {
  const nonce = command === 'serve' ? randomBytes(16).toString('base64') : undefined;
  return {
    plugins: [
      react(),
      {
        name: 'local-content-security-policy',
        transformIndexHtml: (html) => html.replace('__DEV_NONCE__', nonce ? ` 'nonce-${nonce}'` : ''),
      },
    ],
    html: { cspNonce: nonce },
    server: { host: '127.0.0.1', port: 5173, strictPort: true },
    preview: { host: '127.0.0.1', port: 5173, strictPort: true },
  };
});
