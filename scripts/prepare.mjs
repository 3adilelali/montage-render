// Montage pipeline, step 1: المدخلات/ (video with a black screen, or audio) → clean voice + word captions + voice levels.
// Usage: node scripts/prepare.mjs [path] [--no-cut] [--min-cut 0.6s] [--margin 0.15s] [--threshold 0.04] [--lang ar|en|auto]
// Outputs (public/explainer/):
//   voice.wav      the voice track: denoised, compressed, -14 LUFS, long pauses removed unless --no-cut
//                  (retakes / flubs are removed afterwards with scripts/cut-words.mjs)
//   timeline.json  source, durationMs, audio file name
//   captions.json  word-level Caption[] (faster-whisper turbo; whisper.cpp medium as fallback)
//   levels.json    per-frame loudness + 16 spectrum bands (the logo pulses with the voice)
//   plan.json      creative layer, written by the /montage skill — reset when the source changes
import path from 'node:path';
import fs from 'node:fs';
import {execFileSync, spawnSync} from 'node:child_process';
import {AUDIO_EXT, INPUT_DIR, PUBLIC_DIR, SCRIPTS_DIR, SCRIPTS_OUT_DIR, VIDEO_EXT, findPython, mergeWords, newestFile, q} from './common.mjs';
import {durationMsOf, ffmpeg, polishVoice, writeLevels} from './audio.mjs';

const OUT_DIR = path.join(PUBLIC_DIR, 'explainer');
const FPS = 30;

const args = process.argv.slice(2);
const flag = (name, fallback) => {
	const i = args.indexOf(`--${name}`);
	if (i === -1) return fallback;
	return args.splice(i, 2)[1];
};
const bool = (name) => {
	const i = args.indexOf(`--${name}`);
	if (i === -1) return false;
	args.splice(i, 1);
	return true;
};
const LANG = flag('lang', 'ar');
const MIN_CUT = flag('min-cut', '0.6s');
const MARGIN = flag('margin', '0.15s');
const THRESHOLD = flag('threshold', '0.04');
const NO_CUT = bool('no-cut');

const step = (n, msg) => console.log(`\n[${n}/4] ${msg}`);

// ---------- 1. Input ----------
step(1, 'Looking for the newest video/audio in المدخلات/');
const inputPath = args[0] ? path.resolve(args[0]) : newestFile(INPUT_DIR, new Set([...AUDIO_EXT, ...VIDEO_EXT]));
if (!inputPath || !fs.existsSync(inputPath)) {
	console.error(`Nothing found. Put a video or audio file in ${INPUT_DIR}`);
	process.exit(1);
}
console.log(`Input: ${inputPath}`);
fs.mkdirSync(OUT_DIR, {recursive: true});
// A fresh prepare invalidates earlier retake cuts.
for (const f of ['voice.before-cuts.wav', 'captions.before-cuts.json', 'cuts.json']) fs.rmSync(path.join(OUT_DIR, f), {force: true});
const voice = path.join(OUT_DIR, 'voice.wav');
const raw = path.join(OUT_DIR, 'voice.raw.wav');
// Only the sound matters (the video is a black screen). Then clean it up for YouTube.
const extracted = path.join(OUT_DIR, 'voice.extract.wav');
execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', inputPath, '-vn', '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', extracted]);
const full = polishVoice(extracted, raw);
fs.rmSync(extracted, {force: true});
console.log(full ? 'Voice polished (denoise + compressor + -14 LUFS)' : 'Voice normalised to -14 LUFS (install system ffmpeg for denoise)');

// ---------- 2. Tighten long pauses ----------
const findAutoEditor = () => {
	for (const [cmd, ...pre] of [[process.env.AUTO_EDITOR], ['auto-editor'], ['py', '-m', 'auto_editor'], ['python', '-m', 'auto_editor']].filter((c) => c[0])) {
		const r = spawnSync(cmd, [...pre, '--version'], {encoding: 'utf8', shell: true});
		if (r.status === 0 && /\d+\.\d+/.test(r.stdout)) return [cmd, pre];
	}
	return null;
};
const ae = NO_CUT ? null : findAutoEditor();
if (NO_CUT) {
	step(2, 'Keeping the voice as recorded (--no-cut)');
	fs.renameSync(raw, voice);
} else if (!ae) {
	step(2, 'auto-editor not found — keeping pauses (run: node scripts/setup.mjs)');
	fs.renameSync(raw, voice);
} else {
	step(2, `Removing pauses > ${MIN_CUT} (margin ${MARGIN})`);
	const [cmd, pre] = ae;
	execFileSync(cmd, [...pre, q(raw), '--edit', `audio:threshold=${THRESHOLD},mincut=${MIN_CUT}`, '--margin', MARGIN, '--no-open', '-o', q(voice)], {stdio: 'inherit', shell: true});
	fs.rmSync(raw, {force: true});
}
const durationMs = durationMsOf(voice);
console.log(`Voice: ${(durationMs / 1000).toFixed(2)}s = ${Math.ceil((durationMs / 1000) * FPS)} frames @${FPS}fps`);

// ---------- 3. Voice levels (logo pulse + spectrum) ----------
step(3, 'Measuring voice levels');
writeLevels(voice, path.join(OUT_DIR, 'levels.json'), durationMs, FPS);

// ---------- 4. Transcription ----------
// faster-whisper large-v3-turbo (scripts/transcribe-fw.py) is ~8× faster and far more accurate on Arabic than whisper.cpp medium
// (2026-10-12: 3 min of audio = 3 min vs 25 min). The newest final script in السكربتات/ steers spelling. whisper.cpp stays as the fallback.
const rawCaptions = path.join(OUT_DIR, 'captions.raw.json');
const finals = fs.existsSync(SCRIPTS_OUT_DIR)
	? fs.readdirSync(SCRIPTS_OUT_DIR).filter((f) => f.endsWith('-نهائي.md')).map((f) => path.join(SCRIPTS_OUT_DIR, f)).sort((x, y) => fs.statSync(y).mtimeMs - fs.statSync(x).mtimeMs)
	: [];
let words = null;
const py = findPython();
if (py) {
	step(4, `Transcribing with faster-whisper turbo (${LANG})${finals[0] ? ` · spelling from ${path.basename(finals[0])}` : ''}`);
	const args = [q(path.join(SCRIPTS_DIR, 'transcribe-fw.py')), q(voice), q(rawCaptions), LANG, ...(finals[0] ? ['--prompt-file', q(finals[0])] : [])];
	const r = spawnSync(py[0], [...py.slice(1), ...args], {stdio: 'inherit', shell: true, env: {...process.env, PYTHONIOENCODING: 'utf-8'}});
	if (r.status === 0 && fs.existsSync(rawCaptions)) words = JSON.parse(fs.readFileSync(rawCaptions, 'utf8'));
	else console.log('faster-whisper failed — falling back to whisper.cpp medium');
}
if (!words) {
	step(4, `Transcribing with Whisper medium (${LANG})`);
	execFileSync('node', [q(path.join(SCRIPTS_DIR, 'transcribe.mjs')), q(voice), q(rawCaptions), LANG], {stdio: 'inherit', shell: true});
	words = mergeWords(JSON.parse(fs.readFileSync(rawCaptions, 'utf8')));
}
fs.rmSync(rawCaptions, {force: true});
fs.writeFileSync(path.join(OUT_DIR, 'captions.json'), JSON.stringify(words, null, 2), 'utf8');
const lastEnd = words.length ? words[words.length - 1].endMs : 0;
if (durationMs - lastEnd > 4000) console.log(`⚠️  Transcript ends at ${(lastEnd / 1000).toFixed(1)}s but the voice runs to ${(durationMs / 1000).toFixed(1)}s — check the tail.`);

const source = `${path.basename(inputPath)}@${Math.round(fs.statSync(inputPath).mtimeMs)}`;
fs.writeFileSync(path.join(OUT_DIR, 'timeline.json'), JSON.stringify({source, durationMs, audio: 'voice.wav'}, null, 2), 'utf8');
const planPath = path.join(OUT_DIR, 'plan.json');
const existing = fs.existsSync(planPath) ? JSON.parse(fs.readFileSync(planPath, 'utf8')) : null;
if (existing?.source !== source) {
	fs.writeFileSync(planPath, JSON.stringify({source, scenes: []}, null, 2), 'utf8');
	console.log('plan.json reset (new source) — write the scenes next.');
}
// Fresh voice: drop the previous video's insert-pauses backups (insert-pauses always restarts from them).
for (const f of ['voice.before-pauses.wav', 'captions.before-pauses.json', 'pauses.json']) {
	const p = path.join(OUT_DIR, f);
	if (fs.existsSync(p)) fs.rmSync(p);
}

console.log(`\nDone: ${words.length} words. Files in ${OUT_DIR}`);
console.log('Transcript (index:word@second):');
console.log(words.map((w, i) => `${i}:${w.text.trim()}@${(w.startMs / 1000).toFixed(1)}`).join(' '));
