import { createRequire } from 'module';
import { readFileSync } from 'fs';
const req = createRequire(import.meta.url);

// Simulate what rollup does: parse a large JS file
const native = req('./node_modules/rollup/dist/native.js');
console.log('native loaded, parse type:', typeof native.parse);

// Try to parse a large file (react-dom)
const reactDomPath = './node_modules/react-dom/cjs/react-dom.development.js';
const largeCode = readFileSync(reactDomPath, 'utf-8');
console.log('Code size:', (largeCode.length / 1024).toFixed(0), 'KB');

try {
  const result = native.parse(largeCode, false, false);
  console.log('Parse large file OK, result size:', result.length);
} catch (e) {
  console.error('Parse large file FAILED:', e.message);
}
