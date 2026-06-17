/**
 * esbuild 직접 빌드 스크립트 — Windows + Node 24 환경에서 Rollup 없이 빌드합니다.
 */

import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dir = fileURLToPath(new URL('.', import.meta.url));
const outDir = resolve(__dir, 'dist');
mkdirSync(outDir, { recursive: true });
mkdirSync(resolve(outDir, 'assets'), { recursive: true });

const result = await esbuild.build({
  entryPoints: [resolve(__dir, 'src/main.tsx')],
  bundle: true,
  outdir: resolve(outDir, 'assets'),
  entryNames: '[name]-[hash]',
  chunkNames: '[name]-[hash]',
  assetNames: '[name]-[hash]',
  format: 'esm',
  splitting: true,
  target: ['es2020', 'chrome90', 'firefox90'],
  jsx: 'automatic',
  jsxImportSource: 'react',
  minify: false,
  sourcemap: false,
  metafile: true,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.css': 'css',
    '.json': 'json',
    '.png': 'file',
    '.svg': 'file',
  },
});

// Collect CSS and JS entry files from metafile
const outputs = result.metafile.outputs;
const cssFiles = Object.keys(outputs).filter(f => f.endsWith('.css'));
const jsEntry = Object.keys(outputs).find(f => f.endsWith('.js') && outputs[f].entryPoint);

// Make path relative to dist/ (where index.html lives)
const toRel = (p) => './' + p.replace(/\\/g, '/').replace(/^dist\//, '');

const cssLinks = cssFiles.map(f => `  <link rel="stylesheet" href="${toRel(f)}">`).join('\n');
const jsTag = jsEntry ? `  <script type="module" src="${toRel(jsEntry)}"></script>` : '';

// Read and patch index.html
const srcHtml = readFileSync(resolve(__dir, 'index.html'), 'utf-8');
const html = srcHtml
  .replace(/<script[^>]*src="\/src\/main\.tsx"[^>]*><\/script>/, '')  // remove dev script
  .replace('</head>', `${cssLinks}\n</head>`)
  .replace('</body>', `${jsTag}\n</body>`);

writeFileSync(resolve(outDir, 'index.html'), html, 'utf-8');
console.log('index.html written');

// Copy public folder
const publicDir = resolve(__dir, 'public');
if (existsSync(publicDir)) {
  for (const f of readdirSync(publicDir)) {
    copyFileSync(resolve(publicDir, f), resolve(outDir, f));
  }
}

console.log('Build complete → dist/');
console.log('  CSS files:', cssFiles.map(f => toRel(f)).join(', '));
console.log('  JS entry:', jsEntry ? toRel(jsEntry) : 'none');
