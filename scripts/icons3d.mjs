// 3D icons: Microsoft Fluent Emoji 3D (MIT, github.com/microsoft/fluentui-emoji), same names as Iconify's fluent-emoji-flat.
// The originals are 256px, so each one is upscaled ×4 once with Real-ESRGAN, resized to 640px and cached in ~/.montage-icons3d/<name>.png.
// Used by sync-assets.mjs: every "fluent-emoji-flat:<name>" (or "fluent-emoji:<name>") in the plan renders as 3D when it exists.
// Plan opt-out: "iconStyle": "flat" in plan.json.
// Usage (manual): node scripts/icons3d.mjs robot open-file-folder   → caches them and prints the paths.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const CACHE = path.join(os.homedir(), '.montage-icons3d');
const INDEX = JSON.parse(fs.readFileSync(path.join(HERE, 'fluent3d-index.json'), 'utf8')); // name → path inside assets/
const ESRGAN_DIR = path.join(os.homedir(), '.montage-tools', 'realesrgan');
const ESRGAN = path.join(ESRGAN_DIR, process.platform === 'win32' ? 'realesrgan-ncnn-vulkan.exe' : 'realesrgan-ncnn-vulkan');
const CDN = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/';

// The 3D silhouettes are near-black and vanish on the dark background: use a coloured person instead (cached under the original name).
const SWAP = {'speaking-head': 'person-raising-hand', 'bust-in-silhouette': 'person', 'busts-in-silhouette': 'person'};
const src = (name) => INDEX[SWAP[name] ?? name];
export const has3d = (name) => Boolean(src(name));

// Returns {name: cachedPngPath} for every name that has a 3D version (downloads + upscales the missing ones in one batch).
export async function ensure3d(names) {
	fs.mkdirSync(CACHE, {recursive: true});
	const want = [...new Set(names)].filter(has3d);
	const missing = want.filter((n) => !fs.existsSync(path.join(CACHE, `${n}.png`)));
	if (missing.length) {
		const raw = path.join(CACHE, '_raw');
		fs.rmSync(raw, {recursive: true, force: true});
		fs.mkdirSync(raw, {recursive: true});
		await Promise.all(
			missing.map(async (n) => {
				const url = CDN + src(n).split('/').map(encodeURIComponent).join('/');
				const res = await fetch(url);
				if (!res.ok) return console.log(`3D icon download failed (${res.status}): ${n}`);
				fs.writeFileSync(path.join(raw, `${n}.png`), Buffer.from(await res.arrayBuffer()));
			}),
		);
		if (fs.existsSync(ESRGAN)) {
			// Upscale the whole batch at once (GPU, ~0.3s per icon). Alpha is preserved.
			execFileSync(ESRGAN, ['-i', raw, '-o', CACHE, '-n', 'realesrgan-x4plus', '-f', 'png'], {cwd: ESRGAN_DIR, stdio: 'ignore'});
		} else {
			console.log('Real-ESRGAN not installed (node scripts/setup.mjs) — using 256px 3D icons as they are.');
			for (const f of fs.readdirSync(raw)) fs.copyFileSync(path.join(raw, f), path.join(CACHE, f));
		}
		fs.rmSync(raw, {recursive: true, force: true});
		// 640px is enough for the largest icon size (xl = 620px) and keeps rendering fast.
		for (const n of missing) {
			const f = path.join(CACHE, `${n}.png`);
			if (!fs.existsSync(f)) continue;
			execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', f, '-vf', 'scale=640:640:flags=lanczos', f + '.tmp.png']);
			fs.renameSync(f + '.tmp.png', f);
		}
	}
	return Object.fromEntries(want.filter((n) => fs.existsSync(path.join(CACHE, `${n}.png`))).map((n) => [n, path.join(CACHE, `${n}.png`)]));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const names = process.argv.slice(2);
	const got = await ensure3d(names);
	for (const n of names) console.log(got[n] ? `${n} → ${got[n]}` : `${n}: no 3D version`);
}
