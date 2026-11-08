// Re-transcribe short windows of public/explainer/voice.wav where Whisper's word timings collapsed
// (many words stamped with the same time, or a hallucinated word), and splice the fresh words in.
// Usage: node scripts/retime.mjs 0-30.3 58-75 …      (seconds; run BEFORE cut-words.mjs)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {PUBLIC_DIR, SCRIPTS_DIR, mergeWords, q} from './common.mjs';
import {ffmpeg} from './audio.mjs';

const DIR = path.join(PUBLIC_DIR, 'explainer');
const capPath = path.join(DIR, 'captions.json');
let words = JSON.parse(fs.readFileSync(capPath, 'utf8'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'retime-'));

for (const win of process.argv.slice(2)) {
	const [a, b] = win.split('-').map(Number);
	const wav = path.join(tmp, `w${a}.wav`);
	execFileSync(ffmpeg, ['-v', 'error', '-y', '-ss', String(a), '-to', String(b), '-i', path.join(DIR, 'voice.wav'), wav]);
	const out = path.join(tmp, `w${a}.json`);
	const r = spawnSync('node', [q(path.join(SCRIPTS_DIR, 'transcribe.mjs')), q(wav), q(out), 'ar'], {stdio: 'ignore', shell: true});
	if (r.status !== 0) {
		console.error(`window ${win} failed`);
		continue;
	}
	const fresh = mergeWords(JSON.parse(fs.readFileSync(out, 'utf8'))).map((w) => ({
		...w,
		startMs: w.startMs + a * 1000,
		endMs: w.endMs + a * 1000,
		timestampMs: w.timestampMs == null ? null : w.timestampMs + a * 1000,
	}));
	// Replace every old word that starts inside the window (a hallucinated word spanning it counts too).
	const before = words.filter((w) => w.startMs < a * 1000 - 1);
	const after = words.filter((w) => w.startMs >= b * 1000);
	const dropped = words.length - before.length - after.length;
	words = [...before, ...fresh, ...after];
	console.log(`${win}s: ${dropped} old → ${fresh.length} new words`);
}
fs.writeFileSync(capPath, JSON.stringify(words, null, 2), 'utf8');
fs.rmSync(tmp, {recursive: true, force: true});
console.log('Transcript (index:word@second):');
console.log(words.map((w, i) => `${i}:${w.text.trim()}@${(w.startMs / 1000).toFixed(1)}`).join(' '));
