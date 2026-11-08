// Download sounds from the @remotion/sfx library into public/assets/sfx/ (rendering then works offline).
// Usage: node scripts/add-sfx.mjs <file-name...>     e.g.  node scripts/add-sfx.mjs shutter-old loading-lag
// Names are the server file names listed in docs/sfx-library.md. Register new sounds in src/brand/sfx.ts.
import fs from 'node:fs';
import path from 'node:path';
import {PUBLIC_DIR} from './common.mjs';

const names = process.argv.slice(2).map((n) => n.replace(/\.wav$/, ''));
if (!names.length) {
	console.error('Usage: node scripts/add-sfx.mjs <file-name...>');
	process.exit(1);
}
const dir = path.join(PUBLIC_DIR, 'assets', 'sfx');
fs.mkdirSync(dir, {recursive: true});
for (const name of names) {
	const res = await fetch(`https://remotion.media/${name}.wav`);
	if (!res.ok) {
		console.error(`✗ ${name}: ${res.status} — check the name in docs/sfx-library.md`);
		continue;
	}
	fs.writeFileSync(path.join(dir, `${name}.wav`), Buffer.from(await res.arrayBuffer()));
	console.log(`✓ ${name}.wav`);
}
