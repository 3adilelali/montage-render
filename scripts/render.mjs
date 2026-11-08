// Render the finished montage into المخرجات/ (syncs العناصر / music / icons first).
// Usage: node scripts/render.mjs [--still <frame> ...]
//   --still renders PNG frames into المخرجات/.فحص/ for a quick visual check instead of the full video.
//   Several frames: --still 40 220 610
import path from 'node:path';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {ENGINE, OUTPUT_DIR, PUBLIC_DIR, SCRIPTS_DIR, q} from './common.mjs';

const ID = 'Explainer';
const timelinePath = path.join(PUBLIC_DIR, 'explainer', 'timeline.json');
if (!fs.existsSync(timelinePath)) {
	console.error('Nothing to render yet — run scripts/prepare.mjs first.');
	process.exit(1);
}
const sync = spawnSync('node', [q(path.join(SCRIPTS_DIR, 'sync-assets.mjs'))], {cwd: ENGINE, stdio: 'inherit', shell: true});
if (sync.status !== 0) process.exit(sync.status ?? 1);

const {source} = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
const base = source.replace(/@\d+$/, '').replace(/\.[^.]+$/, '');
const argv = process.argv.slice(2);
const stillAt = argv.indexOf('--still');

if (stillAt !== -1) {
	const frames = argv.slice(stillAt + 1).filter((a) => /^\d+$/.test(a));
	const dir = path.join(OUTPUT_DIR, '.فحص');
	fs.mkdirSync(dir, {recursive: true});
	for (const frame of frames.length ? frames : ['30']) {
		const out = path.join(dir, `frame-${frame}.png`);
		const r = spawnSync('npx', ['remotion', 'still', ID, q(out), `--frame=${frame}`, '--log=error'], {cwd: ENGINE, stdio: 'inherit', shell: true});
		if (r.status !== 0) process.exit(r.status ?? 1);
		console.log(`Saved: ${out}`);
	}
} else {
	fs.mkdirSync(OUTPUT_DIR, {recursive: true});
	let out = path.join(OUTPUT_DIR, `${base} - مونتاج.mp4`);
	for (let i = 2; fs.existsSync(out); i++) out = path.join(OUTPUT_DIR, `${base} - مونتاج ${i}.mp4`);
	const r = spawnSync('npx', ['remotion', 'render', ID, q(out), '--crf=18'], {cwd: ENGINE, stdio: 'inherit', shell: true});
	if (r.status !== 0) process.exit(r.status ?? 1);
	console.log(`\nSaved: ${out}`);
}
