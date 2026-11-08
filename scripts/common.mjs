// Shared helpers for the pipeline scripts. The engine lives in <system>/المحرك/, the student-facing folders sit next to it.
// Resolved from this file, so scripts work from any working directory.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SYSTEM = path.dirname(ENGINE);

export const INPUT_DIR = path.join(SYSTEM, 'المدخلات');
export const OUTPUT_DIR = path.join(SYSTEM, 'المخرجات');
export const REFERENCES_DIR = path.join(SYSTEM, 'المراجع');
export const STYLE_DIR = path.join(SYSTEM, 'الأسلوب');
// Student material for the montage: images/videos/logos (العناصر), background music, sound-effect overrides.
export const ELEMENTS_DIR = path.join(SYSTEM, 'العناصر');
export const MUSIC_DIR = path.join(SYSTEM, 'الموسيقى');
export const SFX_DIR = path.join(SYSTEM, 'المؤثرات');
// Channel workspace: source videos pulled for ideas, and the scripts written for recording.
export const IDEAS_DIR = path.join(SYSTEM, 'الأفكار');
export const SCRIPTS_OUT_DIR = path.join(SYSTEM, 'السكربتات');
export const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
export const PUBLIC_DIR = path.join(ENGINE, 'public');
export const SCRIPTS_DIR = path.join(ENGINE, 'scripts');

export const VIDEO_EXT = new Set(['.mp4', '.mov', '.mkv', '.webm', '.m4v', '.avi']);
export const AUDIO_EXT = new Set(['.m4a', '.mp3', '.wav', '.aac', '.ogg', '.flac']);

// whisper.cpp cannot open non-ASCII paths on Windows, and the system folder is Arabic.
// Keep it (≈1.5 GB with the medium model) in an ASCII folder shared by every copy of the system.
const isAscii = (p) => /^[\x20-\x7E]*$/.test(p);
export const WHISPER_DIR = (() => {
	if (process.env.WHISPER_DIR) return path.resolve(process.env.WHISPER_DIR);
	const home = path.join(os.homedir(), '.montage-whisper');
	if (isAscii(home)) return home;
	return process.platform === 'win32' ? 'C:\\montage-whisper' : '/tmp/montage-whisper';
})();

// Newest file in `dir` whose extension is in `exts`.
export const newestFile = (dir, exts) => {
	if (!fs.existsSync(dir)) return null;
	const files = fs
		.readdirSync(dir)
		.filter((f) => exts.has(path.extname(f).toLowerCase()))
		.map((f) => path.join(dir, f))
		.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
	return files[0] ?? null;
};

export const q = (p) => `"${p}"`;

// Whisper returns sub-word tokens; a token without a leading space continues the previous word.
export const mergeWords = (raw) => {
	const words = [];
	for (const c of raw) {
		if (!c.text.trim()) continue;
		const prev = words[words.length - 1];
		if (prev && !c.text.startsWith(' ')) {
			prev.text += c.text;
			prev.endMs = c.endMs;
		} else {
			words.push({
				text: ` ${c.text.trim()}`,
				startMs: c.startMs,
				endMs: c.endMs,
				timestampMs: c.timestampMs,
				confidence: c.confidence,
			});
		}
	}
	// Whisper's token start sometimes drifts late near the end of a clip (up to ~3s); the DTW timestamp stays right.
	// When they disagree, trust the timestamp, then keep the starts in order.
	let last = 0;
	for (const w of words) {
		if (typeof w.timestampMs === 'number' && (w.startMs - w.timestampMs > 350 || w.timestampMs - w.startMs > 600)) {
			w.startMs = Math.max(0, w.timestampMs - 120);
		}
		w.startMs = Math.max(w.startMs, last);
		w.endMs = Math.max(w.endMs, w.startMs + 80);
		last = w.startMs;
	}
	return words;
};

// The npm packages are installed once at the root of «النظام الكامل للمونتاج» (npm workspaces) and shared by every system.
// Nearest node_modules/<pkg> walking up from the engine, like Node's own resolution.
export const findPackageDir = (pkg) => {
	for (let d = ENGINE; ; d = path.dirname(d)) {
		const p = path.join(d, 'node_modules', pkg);
		if (fs.existsSync(p)) return p;
		if (path.dirname(d) === d) return null;
	}
};

// Folder of the ffmpeg/ffprobe binaries that ship with Remotion (no system ffmpeg needed).
export const ffmpegDir = () => {
	const base = findPackageDir('@remotion');
	const exe = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
	const dir =
		base &&
		fs
			.readdirSync(base)
			.filter((d) => d.startsWith('compositor-'))
			.map((d) => path.join(base, d))
			.find((d) => fs.existsSync(path.join(d, exe)));
	if (!dir) throw new Error('Remotion ffmpeg not found — run: npm install (in the root folder «النظام الكامل للمونتاج»)');
	return dir;
};

// First working Python launcher, as [cmd, ...prefixArgs].
export const findPython = () => {
	for (const c of [['py', '-3'], ['python'], ['python3']]) {
		const r = spawnSync(c[0], [...c.slice(1), '--version'], {encoding: 'utf8', shell: true});
		if (r.status === 0 && /Python 3/.test(r.stdout + r.stderr)) return c;
	}
	return null;
};
