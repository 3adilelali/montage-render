// «القصّاص» لليوتيوب (منقول من الريلز 2026-11-06، مفتاح منفصل): Adil's raw OBS recording → clean voice for the montage (no clipped letters, no retakes, short pauses).
//
// Step 1 (analyse):  node scripts/cut.mjs [file] [--lang ar]
//   - newest file in المدخلات/ → ElevenLabs Scribe v2 (word timestamps) → public/explainer/cut.json
//   - prints the phrases with ⚠ on likely retakes/repeats (auto-marked in cut.json "drop")
// Claude reads the phrases next to the script, fixes "drop" in cut.json ([fromWord, toWord] ranges, inclusive).
// Step 2 (apply):    node scripts/cut.mjs --apply
//   - cuts at the real silence in the audio (energy), pads, 10ms fades, loudnorm -15 LUFS
//   - writes voice.wav + captions.json + levels.json + timeline.json in public/explainer/, and prints what was dropped
// The key is read from المحرك/مفتاح ElevenLabs.txt (never printed).
import path from 'node:path';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {AUDIO_EXT, ENGINE, INPUT_DIR, PUBLIC_DIR, VIDEO_EXT, newestFile} from './common.mjs';
import {ffmpeg, polishVoice, writeLevels} from './audio.mjs';

const OUT = path.join(PUBLIC_DIR, 'explainer');
const CUT = path.join(OUT, 'cut.json');
const RAW48 = path.join(OUT, 'voice.raw.wav');

const args = process.argv.slice(2);
const flag = (name, fallback) => {
	const i = args.indexOf(`--${name}`);
	return i === -1 ? fallback : args.splice(i, 2)[1];
};
const APPLY = args.includes('--apply');
if (APPLY) args.splice(args.indexOf('--apply'), 1);
const LANG = flag('lang', 'ar');
// Loudness target. Adil (2026-11-06): his mic records quiet, he wants the voice about twice as loud → -10 LUFS (was -15).
const LUFS = flag('lufs', '-14'); // YouTube loudness

// Tunables (seconds)
const PHRASE_GAP = 0.35; // a pause longer than this starts a new phrase
// Adil 2026-11-07: «no gap at all between sentences» — the only real pauses are the ones insert-pauses adds
// when a clip or result has to be watched («شوف»). Every other silence is cut down to the padding below.
const MAX_PAUSE = 0.2; // pauses longer than this are shortened
const PAD_BEFORE = 0.03; // kept before the first sound of a segment
const PAD_AFTER = 0.06; // kept after the last sound (soundEnd already follows the soft Arabic ending)
const FADE = 0.01;
const HOP = 0.01; // energy frame

// ---------- audio helpers ----------
const readPcm16k = (file) => {
	const buf = execFileSync(ffmpeg, ['-v', 'error', '-i', file, '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', '-f', 'wav', '-'], {maxBuffer: 1 << 30});
	const at = buf.indexOf('data') + 8;
	return new Int16Array(buf.buffer.slice(buf.byteOffset + at, buf.byteOffset + buf.length - ((buf.length - at) % 2)));
};
const energy = (pcm) => {
	const n = Math.floor(160 * (HOP / 0.01));
	const out = new Float32Array(Math.ceil(pcm.length / n));
	for (let f = 0; f < out.length; f++) {
		let s = 0;
		for (let i = f * n; i < Math.min(pcm.length, (f + 1) * n); i++) s += (pcm[i] / 32768) ** 2;
		out[f] = Math.sqrt(s / n);
	}
	return out;
};
const norm = (t) =>
	t
		.replace(/[ً-ْـ]/g, '')
		.replace(/[أإآ]/g, 'ا')
		.replace(/ة/g, 'ه')
		.replace(/ى/g, 'ي')
		.replace(/[^\p{L}\p{N}]/gu, '')
		.toLowerCase();

// ---------- step 1: analyse ----------
if (!APPLY) {
	const input = args[0] ? path.resolve(args[0]) : newestFile(INPUT_DIR, new Set([...AUDIO_EXT, ...VIDEO_EXT]));
	if (!input || !fs.existsSync(input)) {
		console.error(`Nothing found. Put the recording in ${INPUT_DIR}`);
		process.exit(1);
	}
	const keyFile = path.join(ENGINE, 'مفتاح ElevenLabs.txt');
	const key = fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim() : '';
	if (!key) {
		console.error('ElevenLabs key missing (المحرك/مفتاح ElevenLabs.txt).');
		process.exit(1);
	}
	fs.mkdirSync(OUT, {recursive: true});
	console.log(`Input: ${input}`);
	const ext = path.join(OUT, 'voice.extract.wav');
	execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', input, '-vn', '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', ext]);
	polishVoice(ext, RAW48);
	fs.rmSync(ext, {force: true});
	const mono = execFileSync(ffmpeg, ['-v', 'error', '-i', RAW48, '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', '-f', 'wav', '-'], {maxBuffer: 1 << 30});

	console.log('Transcribing with ElevenLabs Scribe v2…');
	const form = new FormData();
	form.append('model_id', 'scribe_v2');
	form.append('file', new Blob([mono], {type: 'audio/wav'}), 'voice.wav');
	if (LANG !== 'auto') form.append('language_code', LANG);
	form.append('timestamps_granularity', 'word');
	form.append('tag_audio_events', 'true');
	form.append('diarize', 'false');
	const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {method: 'POST', headers: {'xi-api-key': key}, body: form});
	const body = await res.json().catch(() => ({}));
	if (!res.ok) {
		console.error(`Scribe error ${res.status}: ${JSON.stringify(body.detail ?? body).slice(0, 300)}`);
		process.exit(1);
	}
	const words = (body.words ?? [])
		.filter((w) => w.type === 'word' && w.text.trim())
		.map((w, i) => ({i, text: w.text.trim(), start: +w.start.toFixed(3), end: +w.end.toFixed(3)}));
	const events = (body.words ?? []).filter((w) => w.type === 'audio_event').map((w) => ({text: w.text, start: w.start, end: w.end}));
	if (!words.length) {
		console.error('No words heard.');
		process.exit(1);
	}

	// phrases = runs of words without a long pause
	const phrases = [];
	for (const w of words) {
		const p = phrases[phrases.length - 1];
		if (p && w.start - words[p.to].end <= PHRASE_GAP) p.to = w.i;
		else phrases.push({id: phrases.length, from: w.i, to: w.i});
	}
	const N = (i) => norm(words[i].text);
	const drop = [];
	const why = {};
	// (a) a phrase whose opening is repeated by one of the next 3 phrases = a retake → drop the earlier one
	for (const p of phrases) {
		const len = p.to - p.from + 1;
		const k = Math.min(2, len);
		for (const q of phrases.slice(p.id + 1, p.id + 4)) {
			let same = true;
			for (let j = 0; j < k; j++) if (q.from + j > q.to || N(p.from + j) !== N(q.from + j)) same = false;
			if (same && N(p.from).length > 1) {
				drop.push([p.from, p.to]);
				why[p.id] = `retake (P${q.id} starts the same)`;
				break;
			}
		}
	}
	// (b) stutter inside a phrase: the same 1–4 words said twice in a row → drop the first copy
	for (let i = 0; i < words.length; i++) {
		for (let n = 4; n >= 1; n--) {
			if (i + 2 * n > words.length) continue;
			let same = true;
			for (let j = 0; j < n; j++) if (N(i + j) !== N(i + n + j) || !N(i + j)) same = false;
			if (same && !drop.some(([a, b]) => i >= a && i <= b)) {
				drop.push([i, i + n - 1]);
				why[`w${i}`] = `repeat «${words.slice(i, i + n).map((w) => w.text).join(' ')}»`;
				i += n - 1;
				break;
			}
		}
	}
	drop.sort((a, b) => a[0] - b[0]);
	fs.writeFileSync(CUT, JSON.stringify({source: path.basename(input), language: body.language_code, words, events, phrases, drop, why}, null, 1), 'utf8');

	const isDropped = (i) => drop.some(([a, b]) => i >= a && i <= b);
	console.log(`\n${words.length} words, ${phrases.length} phrases, ${events.length} sound events. Phrases (word range):`);
	for (const p of phrases) {
		const txt = words
			.slice(p.from, p.to + 1)
			.map((w) => (isDropped(w.i) ? `[${w.text}]` : w.text))
			.join(' ');
		console.log(`P${p.id} ${p.from}-${p.to} @${words[p.from].start.toFixed(1)}s${why[p.id] ? ' ⚠ ' + why[p.id] : ''}: ${txt}`);
	}
	if (events.length) console.log(`Sound events: ${events.map((e) => `${e.text}@${e.start.toFixed(1)}`).join(', ')}`);
	console.log(`\nAuto drop: ${JSON.stringify(drop)} — check against the script, edit "drop" in cut.json, then: node scripts/cut.mjs --apply`);
	process.exit(0);
}

// ---------- step 2: apply ----------
if (!fs.existsSync(CUT) || !fs.existsSync(RAW48)) {
	console.error('Run the analysis first: node scripts/cut.mjs');
	process.exit(1);
}
const cut = JSON.parse(fs.readFileSync(CUT, 'utf8'));
const W = cut.words;
const dropped = new Set();
for (const [a, b] of cut.drop) for (let i = a; i <= b; i++) dropped.add(i);
const E = energy(readPcm16k(RAW48));
const total = E.length * HOP;
const fr = (t) => Math.max(0, Math.min(E.length - 1, Math.round(t / HOP)));

// "quiet" = well below the voice: 12% of the typical loudness inside words
const inWords = [];
for (const w of W) for (let f = fr(w.start); f <= fr(w.end); f++) inWords.push(E[f]);
inWords.sort((a, b) => a - b);
const QUIET = (inWords[Math.floor(inWords.length * 0.7)] || 0.05) * 0.12;

// last sound of a word: walk forward from its end while it is still loud (never past `limit`)
const soundEnd = (t, limit) => {
	let f = fr(t);
	while (f < fr(limit) && E[f] > QUIET) f++;
	return Math.min(f * HOP, limit);
};
// first sound of a word: walk back from its start while it is still loud (never before `limit`)
const soundStart = (t, limit) => {
	let f = fr(t);
	while (f > fr(limit) && E[f - 1] > QUIET) f--;
	return Math.max(f * HOP, limit);
};
// quietest point between two times (used when two words touch)
const quietest = (a, b) => {
	let best = fr(a);
	for (let f = fr(a); f <= fr(b); f++) if (E[f] < E[best]) best = f;
	return best * HOP;
};

// build kept segments over the raw timeline
const segs = [];
let cur = null;
for (let i = 0; i < W.length; i++) {
	if (dropped.has(i)) continue;
	const w = W[i];
	const prev = W[i - 1];
	const prevKept = i > 0 && !dropped.has(i - 1);
	if (cur && prevKept && w.start - prev.end <= MAX_PAUSE) {
		cur.end = w.end;
		cur.words.push(i);
		continue;
	}
	// close the open segment, then open a new one at this word
	if (cur) segs.push(cur);
	cur = {start: w.start, end: w.end, first: i, words: [i]};
}
if (cur) segs.push(cur);

// snap every edge to the real sound, with padding, without touching neighbour words
for (const s of segs) {
	const before = W[s.first - 1];
	const lastI = s.words[s.words.length - 1];
	const after = W[lastI + 1];
	const loLimit = before ? before.end : 0;
	const hiLimit = after ? after.start : total;
	if (before && W[s.first].start - before.end < 0.06) s.a = quietest(before.end - 0.05, W[s.first].start + 0.03);
	else s.a = Math.max(loLimit + 0.02, soundStart(s.start, loLimit) - PAD_BEFORE);
	if (after && after.start - W[lastI].end < 0.06) s.b = quietest(W[lastI].end - 0.03, after.start + 0.05);
	else s.b = Math.min(hiLimit - 0.02, soundEnd(W[lastI].end, hiLimit) + PAD_AFTER);
	s.a = Math.max(0, s.a);
	s.b = Math.min(total, Math.max(s.b, s.a + 0.05));
}
// merge segments that now overlap
const merged = [];
for (const s of segs) {
	const m = merged[merged.length - 1];
	if (m && s.a <= m.b) {
		m.b = Math.max(m.b, s.b);
		m.words.push(...s.words);
	} else merged.push({...s, words: [...s.words]});
}

// cut + join in JS (sample-exact, 10ms fades; Remotion's ffmpeg has no afade), then loudness with ffmpeg
const rawBuf = fs.readFileSync(RAW48);
const dAt = rawBuf.indexOf('data') + 8;
const src = new Int16Array(rawBuf.buffer.slice(rawBuf.byteOffset + dAt, rawBuf.byteOffset + rawBuf.length - ((rawBuf.length - dAt) % 2)));
const SR48 = 48000;
const CH = 2;
const fadeN = Math.round(FADE * SR48);
const lens = merged.map((s) => Math.max(0, Math.round(s.b * SR48) - Math.round(s.a * SR48)));
const dst = new Int16Array(lens.reduce((x, y) => x + y, 0) * CH);
let o = 0;
merged.forEach((s, k) => {
	const a = Math.round(s.a * SR48);
	for (let n = 0; n < lens[k]; n++) {
		const g = Math.min(1, n / fadeN, (lens[k] - 1 - n) / fadeN);
		for (let c = 0; c < CH; c++) dst[o++] = Math.round((src[(a + n) * CH + c] ?? 0) * g);
	}
});
const wavHeader = (bytes) => {
	const h = Buffer.alloc(44);
	h.write('RIFF', 0);
	h.writeUInt32LE(36 + bytes, 4);
	h.write('WAVE', 8);
	h.write('fmt ', 12);
	h.writeUInt32LE(16, 16);
	h.writeUInt16LE(1, 20);
	h.writeUInt16LE(CH, 22);
	h.writeUInt32LE(SR48, 24);
	h.writeUInt32LE(SR48 * CH * 2, 28);
	h.writeUInt16LE(CH * 2, 32);
	h.writeUInt16LE(16, 34);
	h.write('data', 36);
	h.writeUInt32LE(bytes, 40);
	return h;
};
const joined = path.join(OUT, 'voice.joined.wav');
const pcmBytes = Buffer.from(dst.buffer);
fs.writeFileSync(joined, Buffer.concat([wavHeader(pcmBytes.length), pcmBytes]));
const voice = path.join(OUT, 'voice.wav');
execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', joined, '-af', `loudnorm=I=${LUFS}:TP=-1:LRA=11`, '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', voice]);
fs.rmSync(joined, {force: true});

// remap word times onto the new timeline
const captions = [];
let t0 = 0;
for (const s of merged) {
	for (const i of s.words) {
		const w = W[i];
		captions.push({text: ` ${w.text}`, startMs: Math.round((t0 + Math.max(0, w.start - s.a)) * 1000), endMs: Math.round((t0 + Math.min(s.b, w.end) - s.a) * 1000), timestampMs: null, confidence: 1});
	}
	t0 += s.b - s.a;
}
const durationMs = Math.round(t0 * 1000);
fs.writeFileSync(path.join(OUT, 'captions.json'), JSON.stringify(captions, null, 1), 'utf8');
writeLevels(voice, path.join(OUT, 'levels.json'), durationMs, 30);
fs.writeFileSync(path.join(OUT, 'timeline.json'), JSON.stringify({source: cut.source, durationMs, audio: 'voice.wav'}, null, 2), 'utf8');
// fresh voice: old backups from cut-words / insert-pauses would bring back an older voice
for (const f of ['voice.before-cuts.wav', 'captions.before-cuts.json', 'cuts.json', 'voice.before-pauses.wav', 'captions.before-pauses.json', 'pauses.json']) fs.rmSync(path.join(OUT, f), {force: true});
const planPath = path.join(OUT, 'plan.json');
const plan = fs.existsSync(planPath) ? JSON.parse(fs.readFileSync(planPath, 'utf8')) : null;
if (plan?.source !== cut.source) fs.writeFileSync(planPath, JSON.stringify({source: cut.source, scenes: []}, null, 2), 'utf8');

const rawDur = W[W.length - 1].end;
console.log(`Done: ${rawDur.toFixed(1)}s → ${(durationMs / 1000).toFixed(1)}s, ${merged.length} segments, ${captions.length} words kept.`);
const groups = [];
for (const i of [...dropped].sort((a, b) => a - b)) {
	const g = groups[groups.length - 1];
	if (g && i === g[g.length - 1] + 1) g.push(i);
	else groups.push([i]);
}
if (groups.length) console.log('Dropped:\n' + groups.map((g) => `- @${W[g[0]].start.toFixed(1)}s «${g.map((i) => W[i].text).join(' ')}»`).join('\n'));
console.log('Transcript (index:word@second):');
console.log(captions.map((c, i) => `${i}:${c.text.trim()}@${(c.startMs / 1000).toFixed(1)}`).join(' '));
