// Montage pipeline, step 2 (runs again before every render): bring the student's material into the engine.
// Usage: node scripts/sync-assets.mjs
//   العناصر/*   images / videos / logos → public/explainer/assets/  (ASCII names; العناصر/شعاري.* = channel logo)
//   الموسيقى/   newest track → public/explainer/music.<ext>
//   المؤثرات/   sound files named like the engine's (pop.wav, whoosh.wav …) → public/assets/sfx-user/
//   plan.json   every icon id ("set:name") → public/explainer/icons/<set>--<name>.svg  (fluent-emoji ids → 3D .png, see icons3d.mjs)
// Writes public/explainer/assets.json and prints what the plan needs but is missing.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {getIconData, iconToHTML, iconToSVG, replaceIDs} from '@iconify/utils';
import {ensure3d} from './icons3d.mjs';
import {AUDIO_EXT, ELEMENTS_DIR, IMAGE_EXT, MUSIC_DIR, PUBLIC_DIR, SFX_DIR, VIDEO_EXT, ffmpegDir, newestFile} from './common.mjs';

const require = createRequire(import.meta.url);
const OUT = path.join(PUBLIC_DIR, 'explainer');
const ASSETS = path.join(OUT, 'assets');
const ICONS = path.join(OUT, 'icons');
const SFX_USER = path.join(PUBLIC_DIR, 'assets', 'sfx-user');
const ffprobe = path.join(ffmpegDir(), process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe');
for (const d of [ELEMENTS_DIR, MUSIC_DIR, SFX_DIR]) fs.mkdirSync(d, {recursive: true});
for (const d of [ASSETS, ICONS, SFX_USER]) {
	fs.rmSync(d, {recursive: true, force: true});
	fs.mkdirSync(d, {recursive: true});
}

const probe = (file) => {
	if (path.extname(file).toLowerCase() === '.svg') {
		const s = fs.readFileSync(file, 'utf8');
		const vb = s.match(/viewBox="[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)"/);
		return vb ? {w: +vb[1], h: +vb[2]} : {w: 1, h: 1};
	}
	const out = JSON.parse(
		execFileSync(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', file]).toString(),
	);
	return {w: out.streams?.[0]?.width ?? 1, h: out.streams?.[0]?.height ?? 1, durationS: out.format?.duration ? +(+out.format.duration).toFixed(2) : undefined};
};

// ---------- العناصر ----------
const files = {};
let logo = null;
let n = 0;
const walk = (dir) =>
	fs.readdirSync(dir, {withFileTypes: true}).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
for (const src of walk(ELEMENTS_DIR)) {
	const ext = path.extname(src).toLowerCase();
	const kind = IMAGE_EXT.has(ext) ? 'image' : VIDEO_EXT.has(ext) ? 'video' : null;
	if (!kind) continue;
	const name = `a${++n}${ext}`;
	fs.copyFileSync(src, path.join(ASSETS, name));
	const info = {src: `explainer/assets/${name}`, kind, ...probe(src)};
	const rel = path.relative(ELEMENTS_DIR, src).replace(/\\/g, '/');
	const base = path.basename(src);
	for (const key of [rel, base, rel.replace(/\.[^.]+$/, ''), base.replace(/\.[^.]+$/, '')]) files[key] ??= info;
	if (/^(شعاري|logo)$/i.test(base.replace(/\.[^.]+$/, ''))) logo = info;
}

// ---------- الموسيقى ----------
for (const f of fs.readdirSync(OUT)) if (f.startsWith('music.')) fs.rmSync(path.join(OUT, f));
const track = newestFile(MUSIC_DIR, AUDIO_EXT);
let music = null;
if (track) {
	music = `music${path.extname(track).toLowerCase()}`;
	fs.copyFileSync(track, path.join(OUT, music));
}

// ---------- المؤثرات ----------
const sfxUser = [];
for (const f of fs.readdirSync(SFX_DIR)) {
	if (!AUDIO_EXT.has(path.extname(f).toLowerCase())) continue;
	const safe = f.replace(/[^\w.\-]/g, '_');
	fs.copyFileSync(path.join(SFX_DIR, f), path.join(SFX_USER, safe));
	sfxUser.push(safe);
}

// ---------- icons used by the plan ----------
const planPath = path.join(OUT, 'plan.json');
const plan = fs.existsSync(planPath) ? JSON.parse(fs.readFileSync(planPath, 'utf8')) : {scenes: []};
const used = new Set();
const wantedFiles = new Set();
const visit = (it) => {
	if (it.items) it.items.forEach(visit);
	// Nested icons/files inside carousel slides and comparison bars (Extras.tsx).
	for (const k of ['slides', 'bars', 'nodes', 'chips', 'files']) if (Array.isArray(it[k])) it[k].forEach(visit);
	if (Array.isArray(it.logos)) it.logos.forEach((id) => typeof id === 'string' && id.includes(':') && used.add(id));
	for (const k of ['icon', 'fallback', 'corner']) if (typeof it[k] === 'string' && it[k].includes(':')) used.add(it[k]);
	if (it.file) wantedFiles.add(it.file);
};
plan.scenes.forEach((s) => s.items.forEach(visit));

const sets = {};
const icons = [];
const icons3d = [];
const badIcons = [];
// 3D first: fluent emoji ids with a Fluent 3D render become PNGs (plan "iconStyle": "flat" keeps the flat SVGs).
const FLUENT = new Set(['fluent-emoji-flat', 'fluent-emoji']);
if (plan.iconStyle !== 'flat') {
	const fluentIds = [...used].filter((id) => FLUENT.has(id.split(':')[0]));
	const got = await ensure3d(fluentIds.map((id) => id.split(':')[1]));
	for (const id of fluentIds) {
		const [prefix, name] = id.split(':');
		if (!got[name]) continue;
		fs.copyFileSync(got[name], path.join(ICONS, `${prefix}--${name}.png`));
		icons.push(id);
		icons3d.push(id);
		used.delete(id);
	}
}
for (const id of used) {
	const [prefix, name] = id.split(':');
	try {
		sets[prefix] ??= JSON.parse(fs.readFileSync(require.resolve(`@iconify-json/${prefix}/icons.json`), 'utf8'));
		const data = getIconData(sets[prefix], name);
		if (!data) throw new Error('not found');
		const r = iconToSVG(data, {height: 512});
		fs.writeFileSync(path.join(ICONS, `${prefix}--${name}.svg`), iconToHTML(replaceIDs(r.body), r.attributes), 'utf8');
		icons.push(id);
	} catch {
		badIcons.push(id);
	}
}

fs.writeFileSync(path.join(OUT, 'assets.json'), JSON.stringify({files, icons, icons3d, logo, music, sfxUser}, null, 2), 'utf8');

const missing = [...wantedFiles].filter((f) => !files[f] && !files[f.replace(/\.[^.]+$/, '')]);
console.log(`العناصر: ${n} file(s)${logo ? ' + logo' : ' (no شعاري.* yet)'} · music: ${music ?? 'none'} · sfx overrides: ${sfxUser.length} · icons: ${icons.length} (3D: ${icons3d.length})`);
if (missing.length) console.log(`MISSING files (fallback icon or dashed placeholder will show):\n  - ${missing.join('\n  - ')}`);
if (badIcons.length) console.log(`UNKNOWN icons (fix the id — search with scripts/icons.mjs):\n  - ${badIcons.join('\n  - ')}`);
