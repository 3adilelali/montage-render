// Study a reference edit so Claude can learn its style.
// Usage:
//   node scripts/study.mjs <url-or-file> [--name اسم] [--fps 5] [--no-transcribe]
//   node scripts/study.mjs <folder-in-المراجع> --from 3.2 --to 4.4 [--fps 30]   (frame-by-frame detail)
// Output: المراجع/<name>/  ← the reference video + تحليل/
//   تحليل/info.json        duration, fps, size, cuts, sound hits, silences, overview of sheets
//   تحليل/transcript.json  spoken words with timings (when the reference has speech)
//   تحليل/sheet-XX.png     contact sheets (every frame labelled with time + frame number)
//   تحليل/detail-*.png     detail sheets for a time range (--from/--to)
import path from 'node:path';
import fs from 'node:fs';
import {execFileSync, spawnSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {enableTailwind} from '@remotion/tailwind-v4';
import {ENGINE, PUBLIC_DIR, REFERENCES_DIR, SCRIPTS_DIR, VIDEO_EXT, ffmpegDir, findPython, mergeWords, q} from './common.mjs';

// ---------- args ----------
const args = process.argv.slice(2);
const flag = (name, fallback) => {
	const i = args.indexOf(`--${name}`);
	if (i === -1) return fallback;
	const v = args[i + 1];
	args.splice(i, 2);
	return v;
};
const bool = (name) => {
	const i = args.indexOf(`--${name}`);
	if (i === -1) return false;
	args.splice(i, 1);
	return true;
};
const fromS = flag('from');
const toS = flag('to');
const detail = fromS !== undefined && toS !== undefined;
const fps = Number(flag('fps', detail ? 30 : 5));
let name = flag('name');
const noTranscribe = bool('no-transcribe');
const target = args[0];
if (!target) {
	console.error('Usage: node scripts/study.mjs <url-or-file> [--name name] [--fps 5] [--from s --to s]');
	process.exit(1);
}

const bin = (tool) => path.join(ffmpegDir(), process.platform === 'win32' ? `${tool}.exe` : tool);
const run = (cmd, a, opts = {}) => execFileSync(cmd, a, {maxBuffer: 1 << 30, ...opts});
const safeName = (s) =>
	s
		.replace(/\.[^.]+$/, '')
		.replace(/[<>:"/\\|?*\x00-\x1F#%&{}$!'@+`=]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 60) || 'مرجع';
const nextFreeName = (base) => {
	let n = base;
	for (let i = 2; fs.existsSync(path.join(REFERENCES_DIR, n)); i++) n = `${base} ${i}`;
	return n;
};
const findVideo = (dir) =>
	fs
		.readdirSync(dir)
		.filter((f) => VIDEO_EXT.has(path.extname(f).toLowerCase()))
		.map((f) => path.join(dir, f))[0] ?? null;

// ---------- 1. get the reference into المراجع/<name>/ ----------
let refDir;
let videoPath;
const isUrl = /^https?:\/\//i.test(target);
const isDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();
const asFolder = !isUrl && isDir(path.join(REFERENCES_DIR, target)) ? path.join(REFERENCES_DIR, target) : null;

if (asFolder || (!isUrl && fs.existsSync(target) && fs.statSync(target).isDirectory())) {
	refDir = asFolder ?? path.resolve(target);
	videoPath = findVideo(refDir);
} else if (isUrl) {
	const python = findPython();
	if (!python) {
		console.error('Python not found. Run:  node scripts/setup.mjs');
		process.exit(1);
	}
	refDir = path.join(REFERENCES_DIR, nextFreeName(name ?? `مرجع ${new Date().toISOString().slice(0, 10)}`));
	fs.mkdirSync(refDir, {recursive: true});
	console.log(`[1] Downloading ${target}`);
	const r = spawnSync(
		python[0],
		[
			...python.slice(1),
			'-m', 'yt_dlp',
			'--no-playlist',
			'--ffmpeg-location', q(ffmpegDir()),
			'-f', q('bv*+ba/b'),
			'--merge-output-format', 'mp4',
			'-o', q(path.join(refDir, 'reference.%(ext)s')),
			q(target),
		],
		{stdio: 'inherit', shell: true},
	);
	videoPath = findVideo(refDir);
	if (r.status !== 0 || !videoPath) {
		fs.rmSync(refDir, {recursive: true, force: true});
		console.error('\nDownload failed. If yt-dlp is missing run: node scripts/setup.mjs — or download the video manually and pass the file.');
		process.exit(1);
	}
	fs.writeFileSync(path.join(refDir, 'المصدر.txt'), `${target}\n`, 'utf8');
} else {
	const src = path.resolve(target);
	if (!fs.existsSync(src)) {
		console.error(`Not found: ${src}`);
		process.exit(1);
	}
	if (path.dirname(src).startsWith(REFERENCES_DIR) && path.dirname(src) !== REFERENCES_DIR) {
		refDir = path.dirname(src);
		videoPath = src;
	} else {
		refDir = path.join(REFERENCES_DIR, nextFreeName(name ?? safeName(path.basename(src))));
		fs.mkdirSync(refDir, {recursive: true});
		videoPath = path.join(refDir, `reference${path.extname(src).toLowerCase()}`);
		fs.copyFileSync(src, videoPath);
		// A loose file dropped straight into المراجع/ moves into its own folder.
		if (path.dirname(src) === REFERENCES_DIR) fs.rmSync(src);
	}
}
if (!videoPath) {
	console.error(`No video inside ${refDir}`);
	process.exit(1);
}
const outDir = path.join(refDir, 'تحليل');
fs.mkdirSync(outDir, {recursive: true});
console.log(`Reference: ${videoPath}`);

// ---------- 2. probe ----------
const probe = JSON.parse(
	run(bin('ffprobe'), [
		'-v', 'error',
		'-show_entries', 'stream=codec_type,width,height,r_frame_rate:format=duration',
		'-of', 'json',
		videoPath,
	]).toString(),
);
const vStream = probe.streams.find((s) => s.codec_type === 'video');
const hasAudio = probe.streams.some((s) => s.codec_type === 'audio');
const [rn, rd = 1] = vStream.r_frame_rate.split('/').map(Number);
const srcFps = Math.round((rn / rd) * 100) / 100;
const duration = Number(probe.format.duration);
const width = vStream.width;
const height = vStream.height;
console.log(`[2] ${width}×${height}, ${srcFps}fps, ${duration.toFixed(2)}s, audio: ${hasAudio}`);

const tmpId = `study-${Date.now()}`;
const tmpDir = path.join(PUBLIC_DIR, '_study', tmpId);
fs.mkdirSync(tmpDir, {recursive: true});

// ---------- 3. extract frames ----------
const start = detail ? Math.max(0, Number(fromS)) : 0;
const end = detail ? Math.min(duration, Number(toS)) : duration;
const TILE_W = width >= height ? 384 : 216;
console.log(`[3] Extracting frames ${start.toFixed(2)}–${end.toFixed(2)}s at ${fps}fps`);
run(bin('ffmpeg'), [
	'-v', 'error',
	'-ss', String(start),
	'-t', String(end - start),
	'-i', videoPath,
	'-r', String(fps),
	'-vf', `scale=${TILE_W * 2}:-2`,
	'-q:v', '3',
	path.join(tmpDir, 'f%05d.jpg'),
]);
const frameFiles = fs.readdirSync(tmpDir).filter((f) => f.endsWith('.jpg')).sort();
const frames = frameFiles.map((file, i) => {
	const t = start + i / fps;
	return {file: `_study/${tmpId}/${file}`, label: `${t.toFixed(2)}s · f${Math.round(t * srcFps)}`};
});

// ---------- 4. cuts + sound (overview only) ----------
let cuts = [];
let hits = [];
let silences = [];
if (!detail) {
	// Hard cuts: big jump in a tiny grayscale thumbnail between consecutive source frames.
	const W = 32;
	const H = 18;
	const raw = run(bin('ffmpeg'), [
		'-v', 'error', '-i', videoPath,
		'-vf', `scale=${W}:${H}`, '-pix_fmt', 'gray', '-c:v', 'rawvideo', '-f', 'image2pipe', '-',
	]);
	const n = Math.floor(raw.length / (W * H));
	const diffs = [];
	for (let i = 1; i < n; i++) {
		let d = 0;
		for (let p = 0; p < W * H; p++) d += Math.abs(raw[i * W * H + p] - raw[(i - 1) * W * H + p]);
		diffs.push(d / (W * H));
	}
	diffs.forEach((d, i) => {
		const around = diffs.slice(Math.max(0, i - 8), i + 9).filter((_, j, a) => a[j] !== d).sort((a, b) => a - b);
		const median = around[Math.floor(around.length / 2)] ?? 0;
		if (d > 18 && d > median * 3) cuts.push({frame: i + 1, time: +((i + 1) / srcFps).toFixed(2), strength: Math.round(d)});
	});

	if (hasAudio) {
		// Loudness per video frame from 16 kHz mono PCM → sudden rises (sound effects, beats) and silences.
		const wav = run(bin('ffmpeg'), ['-v', 'error', '-i', videoPath, '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', '-f', 'wav', '-']);
		const dataAt = wav.indexOf('data') + 8;
		const pcm = new Int16Array(wav.buffer.slice(wav.byteOffset + dataAt, wav.byteOffset + wav.length - ((wav.length - dataAt) % 2)));
		const per = Math.round(16000 / srcFps);
		const db = [];
		for (let i = 0; i + per <= pcm.length; i += per) {
			let s = 0;
			for (let j = i; j < i + per; j++) s += (pcm[j] / 32768) ** 2;
			db.push(10 * Math.log10(s / per + 1e-10));
		}
		db.forEach((v, i) => {
			const before = db.slice(Math.max(0, i - 6), i);
			const avg = before.length ? before.reduce((a, b) => a + b, 0) / before.length : -90;
			if (v > -35 && v - avg > 9 && !hits.some((h) => i - h.frame < 6)) hits.push({frame: i, time: +(i / srcFps).toFixed(2), db: Math.round(v)});
		});
		let from = null;
		db.forEach((v, i) => {
			if (v < -45 && from === null) from = i;
			if ((v >= -45 || i === db.length - 1) && from !== null) {
				if (i - from >= srcFps * 0.3) silences.push({from: +(from / srcFps).toFixed(2), to: +(i / srcFps).toFixed(2)});
				from = null;
			}
		});
	}
	console.log(`[4] ${cuts.length} hard cuts, ${hits.length} sound hits, ${silences.length} silences`);
}

// ---------- 5. contact sheets (rendered with Remotion, see src/study/ContactSheet.tsx) ----------
const COLS = width >= height ? 3 : 5;
const ROWS = width >= height ? 4 : 3;
const PER = COLS * ROWS;
const TILE_H = Math.round((TILE_W * height) / width);
const sheets = [];
try {
	console.log(`[5] Rendering ${Math.ceil(frames.length / PER)} contact sheet(s)`);
	const serveUrl = await bundle({
		entryPoint: path.join(ENGINE, 'src', 'index.ts'),
		webpackOverride: enableTailwind,
		publicDir: PUBLIC_DIR,
	});
	const tag = detail ? `detail-${start.toFixed(1)}-${end.toFixed(1)}` : 'sheet';
	for (let s = 0; s * PER < frames.length; s++) {
		const inputProps = {frames: frames.slice(s * PER, (s + 1) * PER), cols: COLS, tileW: TILE_W * 2, tileH: TILE_H * 2};
		const composition = await selectComposition({serveUrl, id: 'ContactSheet', inputProps});
		const file = `${tag}-${String(s + 1).padStart(2, '0')}.png`;
		await renderStill({composition, serveUrl, inputProps, output: path.join(outDir, file), scale: 0.5});
		const first = inputProps.frames[0].label;
		const last = inputProps.frames[inputProps.frames.length - 1].label;
		sheets.push({file, from: first, to: last});
		process.stdout.write(`\r  ${file}`);
	}
	process.stdout.write('\n');
} finally {
	fs.rmSync(tmpDir, {recursive: true, force: true});
}

// ---------- 6. transcript ----------
let transcript = null;
if (!detail && hasAudio && !noTranscribe) {
	console.log('[6] Transcribing speech (auto language)');
	const out = path.join(outDir, 'transcript.json');
	const r = spawnSync('node', [q(path.join(SCRIPTS_DIR, 'transcribe.mjs')), q(videoPath), q(out), 'auto'], {
		stdio: 'inherit',
		shell: true,
	});
	if (r.status === 0 && fs.existsSync(out)) {
		const words = mergeWords(JSON.parse(fs.readFileSync(out, 'utf8'))).map((w) => ({
			text: w.text.trim(),
			startMs: w.startMs,
			endMs: w.endMs,
			frame: Math.round((w.startMs / 1000) * srcFps),
		}));
		fs.writeFileSync(out, JSON.stringify(words, null, 2), 'utf8');
		transcript = words.map((w) => w.text).join(' ');
		// A loudness jump right on a spoken word is probably speech, not a sound effect.
		for (const h of hits) h.onWord = words.some((w) => Math.abs(w.frame - h.frame) <= 3);
	}
}

// ---------- 7. summary ----------
if (!detail) {
	const info = {
		video: path.basename(videoPath),
		width,
		height,
		fps: srcFps,
		durationS: +duration.toFixed(2),
		frames: Math.round(duration * srcFps),
		hasAudio,
		cuts,
		averageShotS: +(duration / (cuts.length + 1)).toFixed(2),
		soundHits: hits,
		silences,
		transcript,
		sheets,
		sheetFps: fps,
	};
	fs.writeFileSync(path.join(outDir, 'info.json'), JSON.stringify(info, null, 2), 'utf8');
}

console.log(`\nDone → ${outDir}`);
for (const s of sheets) console.log(`  ${path.join(outDir, s.file)}   (${s.from} → ${s.to})`);
