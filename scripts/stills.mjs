// Render many check frames in one go (bundles once), then tile them into contact sheets.
// Usage: node scripts/stills.mjs <frame> <frame> …     or   node scripts/stills.mjs --scenes   (one frame near the end of every scene)
// Output: المخرجات/.فحص/frame-<n>.png and المخرجات/.فحص/sheet-XX.png (12 frames per sheet, labelled)
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {enableTailwind} from '@remotion/tailwind-v4';
import {ENGINE, OUTPUT_DIR, PUBLIC_DIR, SCRIPTS_DIR, q} from './common.mjs';

const DIR = path.join(PUBLIC_DIR, 'explainer');
const argv = process.argv.slice(2);
let frames = argv.filter((a) => /^\d+$/.test(a)).map(Number);
if (argv.includes('--scenes')) {
	const plan = JSON.parse(fs.readFileSync(path.join(DIR, 'plan.json'), 'utf8'));
	const caps = JSON.parse(fs.readFileSync(path.join(DIR, 'captions.json'), 'utf8'));
	const f = (w) => Math.round((caps[w].startMs / 1000) * 30);
	const end = Math.round((JSON.parse(fs.readFileSync(path.join(DIR, 'timeline.json'), 'utf8')).durationMs / 1000) * 30) - 2;
	frames = plan.scenes.map((s, i) => {
		const next = plan.scenes[i + 1] ? f(plan.scenes[i + 1].from) : end;
		return Math.max(f(s.from) + 20, next - 8);
	});
}
spawnSync('node', [q(path.join(SCRIPTS_DIR, 'sync-assets.mjs'))], {stdio: 'inherit', shell: true, cwd: ENGINE});
const out = path.join(OUTPUT_DIR, '.فحص');
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(out, {recursive: true});

const serveUrl = await bundle({entryPoint: path.join(ENGINE, 'src', 'index.ts'), webpackOverride: enableTailwind, publicDir: PUBLIC_DIR});
const composition = await selectComposition({serveUrl, id: 'Explainer'});
for (const [i, frame] of frames.entries()) {
	await renderStill({composition, serveUrl, frame, output: path.join(out, `frame-${String(i).padStart(3, '0')}-${frame}.png`), scale: 0.5});
	process.stdout.write(`\r${i + 1}/${frames.length}`);
}
process.stdout.write('\n');

// Contact sheets with system ffmpeg (12 per sheet, 3×4).
const files = fs.readdirSync(out).filter((f) => f.startsWith('frame-')).sort();
for (let s = 0; s * 12 < files.length; s++) {
	const list = path.join(out, `list-${s}.txt`);
	fs.writeFileSync(list, files.slice(s * 12, s * 12 + 12).map((f) => `file '${path.join(out, f).replace(/\\/g, '/')}'`).join('\n'));
	execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-vf', 'scale=640:-1,tile=3x4:padding=6:color=white', '-frames:v', '1', path.join(out, `sheet-${String(s + 1).padStart(2, '0')}.png`)]);
	fs.rmSync(list);
}
console.log(`Done: ${files.length} frames → ${out}`);
