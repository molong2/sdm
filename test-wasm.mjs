import { rollup } from '@rollup/wasm-node';
const b = await rollup({
  input: 'idx',
  plugins: [{
    resolveId(id) { return id; },
    load() { return 'export const hello = () => 42; export default { hello };'; }
  }]
});
const out = await b.generate({ format: 'es', entryFileNames: '[hash].js' });
console.log('hash chunk OK:', out.output[0].fileName);
