// Fails when any catalog is missing a key that the source catalog (it.json) has, or has extra keys.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'locales');
const source = JSON.parse(readFileSync(join(dir, 'it.json'), 'utf8'));
const sourceKeys = new Set(Object.keys(source));
let failed = false;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'it.json')) {
  const keys = new Set(Object.keys(JSON.parse(readFileSync(join(dir, file), 'utf8'))));
  const missing = [...sourceKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !sourceKeys.has(k));
  if (missing.length || extra.length) {
    failed = true;
    console.error(`${file}: missing ${missing.length} key(s)${missing.length ? ': ' + missing.join(', ') : ''}; extra ${extra.length}${extra.length ? ': ' + extra.join(', ') : ''}`);
  } else {
    console.log(`${file}: ok (${keys.size} keys)`);
  }
}
process.exit(failed ? 1 : 0);
