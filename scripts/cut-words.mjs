// Remove retakes, flubs and repeated words from the voice, by word index (captions.json).
// Usage: node scripts/cut-words.mjs            reads public/explainer/cuts.json
//   cuts.json: { "cuts": [ { "from": 12, "to": 18, "why": "إعادة الجملة" }, … ] }   (inclusive word indices)
// Rewrites voice.wav, captions.json, levels.json and timeline.json; keeps the originals as *.before-cuts.* (restored on re-run,
// so cuts.json always applies to the transcript printed by prepare.mjs). Then reprints the transcript with new indices.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {PUBLIC_DIR} from './common.mjs';
import {durationMsOf, systemFfmpeg, writeLevels} from './audio.mjs';

if (!systemFfmpeg) {
	console.error('Needs the full system ffmpeg (winget install Gyan.FFmpeg), then reopen the terminal.');
	process.exit(1);
}

const DIR = path.join(PUBLIC_DIR, 'explainer');
const FPS = 30;
const PAD = 40; // ms kept before the next kept word / after the previous one
const FADE = 0.012; // s micro-fade on every joint (no clicks)

const f = (n) => path.join(DIR, n);
const cutsPath = f('cuts.json');
if (!fs.existsSync(cutsPath)) {
	console.error('No public/explainer/cuts.json — write { "cuts": [{ "from": i, "to": j }] } first.');
	process.exit(1);
}

// Always start from the uncut originals so re-runs are idempotent.
for (const [cur, bak] of [['voice.wav', 'voice.before-cuts.wav'], ['captions.json', 'captions.before-cuts.json']]) {
	if (fs.existsSync(f(bak))) fs.copyFileSync(f(bak), f(cur));
	else fs.copyFileSync(f(cur), f(bak));
}

const words = JSON.parse(fs.readFileSync(f('captions.json'), 'utf8'));
const cuts = JSON.parse(fs.readFileSync(cutsPath, 'utf8')).cuts ?? [];
const drop = new Set();
for (const c of cuts) if (c.from !== undefined) for (let i = c.from; i <= c.to; i++) drop.add(i);

// Removed time ranges: from just after the last kept word before the cut to just before the first kept word after it.
// A cut can also give explicit times { "startS": 62.8, "endS": 66.0 } where the transcript timings are unreliable.
// Every boundary is then snapped to the quietest 10ms within ±SNAP ms, so no syllable is clipped.
const total = durationMsOf(f('voice.wav'));
const SR = 16000;
const pcmBuf = execFileSync(systemFfmpeg, ['-v', 'error', '-i', f('voice.wav'), '-ac', '1', '-ar', String(SR), '-f', 's16le', '-'], {maxBuffer: 1 << 30});
const pcm = new Int16Array(pcmBuf.buffer, pcmBuf.byteOffset, pcmBuf.length >> 1);
const SNAP = 120;
const energyAt = (ms) => {
	const i0 = Math.floor((ms / 1000) * SR);
	let e = 0;
	for (let j = i0; j < i0 + SR / 100 && j < pcm.length; j++) e += (pcm[j] ?? 0) ** 2;
	return e;
};
const snap = (ms) => {
	let best = ms;
	let bestE = Infinity;
	for (let t = Math.max(0, ms - SNAP); t <= Math.min(total, ms + SNAP); t += 5) {
		const e = energyAt(t);
		if (e < bestE) {
			bestE = e;
			best = t;
		}
	}
	return best;
};
const ranges = [];
for (const c of cuts) {
	if (c.startS !== undefined) {
		ranges.push([snap(c.startS * 1000), snap(c.endS * 1000)]);
		for (let i = 0; i < words.length; i++) if (words[i].startMs >= c.startS * 1000 - 30 && words[i].startMs < c.endS * 1000 - 30) drop.add(i);
		continue;
	}
	const prev = words[c.from - 1];
	const next = words[c.to + 1];
	const start = prev ? Math.max(prev.endMs + PAD, words[c.from].startMs - PAD) : 0;
	const end = next ? next.startMs - PAD : total;
	if (end > start) ranges.push([c.from === 0 ? 0 : snap(start), next ? snap(end) : total]);
}
ranges.sort((a, b) => a[0] - b[0]);
const merged = [];
for (const r of ranges) {
	const last = merged[merged.length - 1];
	if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
	else merged.push([...r]);
}
const keep = [];
let t = 0;
for (const [a, b] of merged) {
	if (a > t) keep.push([t, a]);
	t = b;
}
if (t < total) keep.push([t, total]);

// Audio: trim every kept segment with micro-fades, then concat.
const parts = keep.map(([a, b], i) => {
	const d = (b - a) / 1000;
	return `[0:a]atrim=start=${a / 1000}:end=${b / 1000},asetpts=PTS-STARTPTS,afade=t=in:d=${FADE},afade=t=out:st=${Math.max(0, d - FADE).toFixed(3)}:d=${FADE}[p${i}]`;
});
const graph = `${parts.join(';')};${keep.map((_, i) => `[p${i}]`).join('')}concat=n=${keep.length}:v=0:a=1[out]`;
const tmp = f('voice.cut.wav');
execFileSync(systemFfmpeg, ['-v', 'error', '-y', '-i', f('voice.wav'), '-filter_complex', graph, '-map', '[out]', '-c:a', 'pcm_s16le', tmp]);
fs.renameSync(tmp, f('voice.wav'));

// Captions: drop cut words and shift the rest by the time removed before them.
const removedBefore = (ms) => merged.reduce((s, [a, b]) => s + (ms >= b ? b - a : ms > a ? ms - a : 0), 0);
const out = words
	.filter((_, i) => !drop.has(i))
	.map((w) => ({...w, startMs: w.startMs - removedBefore(w.startMs), endMs: w.endMs - removedBefore(w.endMs), timestampMs: w.timestampMs == null ? null : w.timestampMs - removedBefore(w.timestampMs)}));
fs.writeFileSync(f('captions.json'), JSON.stringify(out, null, 2), 'utf8');

const durationMs = durationMsOf(f('voice.wav'));
writeLevels(f('voice.wav'), f('levels.json'), durationMs, FPS);
const timeline = JSON.parse(fs.readFileSync(f('timeline.json'), 'utf8'));
fs.writeFileSync(f('timeline.json'), JSON.stringify({...timeline, durationMs}, null, 2), 'utf8');

console.log(`Removed ${drop.size} words in ${merged.length} cut(s): ${((total - durationMs) / 1000).toFixed(2)}s → voice now ${(durationMs / 1000).toFixed(2)}s`);
// Where each cut now sits in the new voice (for listening checks).
let removed = 0;
const joints = merged.map(([a, b]) => {
	const j = (a - removed) / 1000;
	removed += b - a;
	return j.toFixed(2);
});
fs.writeFileSync(f('joints.json'), JSON.stringify(joints), 'utf8');
console.log(`Joints (s): ${joints.join(' ')}`);
console.log('Transcript (index:word@second):');
console.log(out.map((w, i) => `${i}:${w.text.trim()}@${(w.startMs / 1000).toFixed(1)}`).join(' '));
