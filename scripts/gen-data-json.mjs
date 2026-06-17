/**
 * 대용량 데이터 .ts 파일을 .json으로 변환
 * rollup이 거대한 JS AST를 파싱하지 않도록
 *
 * 실행: node --experimental-strip-types scripts/gen-data-json.mjs
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const toUrl = p => pathToFileURL(resolve(root, p)).href;

const { cases }     = await import(toUrl('src/data/cases.ts'));
const { documents } = await import(toUrl('src/data/documents.ts'));
const {
  DAY_EVENTS,
  DAY_ARRIVAL_EVENTS,
  DAY_OUTING_EVENTS,
} = await import(toUrl('src/data/events.ts'));

const write = (rel, data) => {
  const path = resolve(root, rel);
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ ${rel}`);
};

write('src/data/cases.json',     cases);
write('src/data/documents.json', documents);
write('src/data/events.json', {
  DAY_EVENTS,
  DAY_ARRIVAL_EVENTS,
  DAY_OUTING_EVENTS,
});

console.log('완료');
