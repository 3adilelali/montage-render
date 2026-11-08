// Render a YouTube thumbnail (1280×720 PNG) into المخرجات/.
// Usage: node scripts/thumbnail.mjs "<name>" [props.json]
//   props.json: { hero, brand, word, pill } — see src/thumbnail/Thumbnail.tsx. Hero lives in public/thumbnail/.
import path from 'node:path';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {ENGINE, OUTPUT_DIR, q} from './common.mjs';

const [name = 'صورة مصغرة', propsFile] = process.argv.slice(2);
const out = path.join(OUTPUT_DIR, `${name} - صورة مصغرة.png`);
const args = ['remotion', 'still', 'Thumbnail', q(out), '--log=error'];
if (propsFile) args.push(`--props=${q(path.resolve(propsFile))}`);
fs.mkdirSync(OUTPUT_DIR, {recursive: true});
const r = spawnSync('npx', args, {cwd: ENGINE, stdio: 'inherit', shell: true});
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`Saved: ${out}`);
