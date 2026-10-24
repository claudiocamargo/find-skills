import { readFileSync, writeFileSync } from 'node:fs';
const g = JSON.parse(readFileSync(new URL('./gen.json', import.meta.url)));
const src = readFileSync(new URL('./index.src.html', import.meta.url), 'utf8');
writeFileSync(new URL('../index.html', import.meta.url),
  src.replace('{{ZIG}}', g.zig));
console.log('built');
