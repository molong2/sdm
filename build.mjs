/**
 * Windows + Node 24 환경에서 Rollup 네이티브 바이너리 크래시 우회용 빌드 스크립트.
 * rollup/dist/native.js 를 빌드 전 WASM 버전으로 교체하고 빌드 후 복원합니다.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dir = fileURLToPath(new URL('.', import.meta.url));

const rollupNativePath = resolve(__dir, 'node_modules/rollup/dist/native.js');
const wasmNativePath = resolve(__dir, 'node_modules/@rollup/wasm-node/dist/native.js');
const wasmNativeRequirePath = wasmNativePath.replace(/\\/g, '/');

const originalContent = readFileSync(rollupNativePath, 'utf-8');
const wasmShim = `// WASM shim: redirects to @rollup/wasm-node to avoid native binary crash on Windows + Node 24\nmodule.exports = require(${JSON.stringify(wasmNativeRequirePath)});\n`;

writeFileSync(rollupNativePath, wasmShim, 'utf-8');
console.log('[build.mjs] Patched rollup/dist/native.js → WASM version');

// Verify the patch loaded correctly
import { createRequire } from 'module';
const req = createRequire(import.meta.url);
const patchedNative = req(rollupNativePath);
console.log('[build.mjs] Verify: parse type =', typeof patchedNative.parse, ', xxhash type =', typeof patchedNative.xxhashBase64Url);

// Add crash signal listener
process.on('SIGTERM', () => console.error('[build.mjs] SIGTERM received'));
process.on('exit', (code) => console.log('[build.mjs] Process exit with code:', code));

try {
  console.log('[build.mjs] Importing vite...');
  const { build } = await import('vite');
  console.log('[build.mjs] Running build...');
  await build();
  console.log('[build.mjs] Build succeeded.');
} finally {
  writeFileSync(rollupNativePath, originalContent, 'utf-8');
  console.log('[build.mjs] Restored rollup/dist/native.js');
}
