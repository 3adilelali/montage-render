// كورس كلود بالعربي — step 2: cut a lesson from its edit list.
// node scripts/course-cut.mjs <lessonId>
// Reads public/course/<id>/edl.json + src<N>.words.json (from course-transcribe.mjs).
// Each segment keeps words [from..to]; silences longer than GAP inside a segment are squeezed.
// → public/course/<id>/cut.mp4 (video only, 1280x688, cropped + privacy blur), voice.wav (polished),
//   lesson.json (frames of segments, cards, headers) for the CourseLesson composition.
import path from 'node:path';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {ENGINE, PUBLIC_DIR} from './common.mjs';
import {ffmpeg as ffBundled, systemFfmpeg, polishVoice} from './audio.mjs';
const ffmpeg = systemFfmpeg ?? ffBundled;

const FPS = 30;
// Same logic as the channel cutter (eleven-cut.mjs): edges follow the REAL sound, not Scribe's word times
// (Scribe often stretches a word over the silence after it). Every pause longer than MAX_PAUSE is cut out,
// coughs/breaths between words are dropped (they sit in the gaps), 10 ms fades.
const MAX_PAUSE = 0.25;
const PAD_BEFORE = 0.05;
const PAD_AFTER = 0.08;
const TAIL = 0.25; // a word's sound may run this far past its Scribe end, never further (stops at coughs)
const HOP = 0.01;
const W = 1280;
const H = 688;

const id = process.argv[2];
const DIR = path.join(PUBLIC_DIR, 'course', id);
const edl = JSON.parse(fs.readFileSync(path.join(DIR, 'edl.json'), 'utf8'));
const srcPath = (n) => path.resolve(ENGINE, edl.sources[n]);
const TMP = path.join(DIR, 'clips');
fs.rmSync(TMP, {recursive: true, force: true});
fs.mkdirSync(TMP, {recursive: true});

const energyOf = (file) => {
	const buf = execFileSync(ffmpeg, ['-v', 'error', '-i', file, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', '-f', 'wav', '-'], {maxBuffer: 1 << 30});
	const at = buf.indexOf('data') + 8;
	const pcm = new Int16Array(buf.buffer.slice(buf.byteOffset + at, buf.byteOffset + buf.length - ((buf.length - at) % 2)));
	const out = new Float32Array(Math.ceil(pcm.length / 160));
	for (let f = 0; f < out.length; f++) {
		let q = 0;
		for (let i = f * 160; i < Math.min(pcm.length, (f + 1) * 160); i++) q += (pcm[i] / 32768) ** 2;
		out[f] = Math.sqrt(q / 160);
	}
	return out;
};
const srcData = edl.sources.map((_, n) => {
	const raw = JSON.parse(fs.readFileSync(path.join(DIR, `src${n}.words.json`), 'utf8')).words;
	const E = energyOf(srcPath(n));
	const fr = (t) => Math.max(0, Math.min(E.length - 1, Math.round(t / HOP)));
	const inW = [];
	for (const w of raw) for (let f = fr(w.start); f <= fr(Math.min(w.end, w.start + 1)); f++) inW.push(E[f]);
	inW.sort((x, y) => x - y);
	const QUIET = (inW[Math.floor(inW.length * 0.7)] || 0.05) * 0.12;
	// real sound span of every word
	const words = raw.map((w, i) => {
		const next = raw[i + 1];
		let a = fr(w.start);
		const aLim = fr(i ? raw[i - 1].start + 0.05 : 0);
		while (a > aLim && E[a - 1] > QUIET && w.start - a * HOP < 0.15) a--;
		let e = fr(Math.min(w.end, w.start + 1.5));
		while (e > fr(w.start) + 3 && E[e] <= QUIET) e--; // stretched end → back to the last sound
		const lim = fr(Math.min(w.end + TAIL, next ? next.start : Infinity));
		while (e < lim && E[e + 1] > QUIET) e++;
		return {...w, a: a * HOP, b: (e + 1) * HOP};
	});
	return {words, total: E.length * HOP};
});

const clips = []; // {src, start, frames, seg}
edl.segments.forEach((seg, si) => {
	const {words: w, total} = srcData[seg.src];
	if (seg.t0 != null) {
		// a take Scribe mis-timed: kept by seconds instead of word numbers
		const st = Math.floor(seg.t0 * FPS) / FPS;
		clips.push({src: seg.src, start: st, frames: Math.ceil((seg.t1 - st) * FPS), seg: si});
		return;
	}
	const drop = new Set((seg.drop ?? []).flatMap(([x, y]) => Array.from({length: y - x + 1}, (_, k) => x + k)));
	let cur = null;
	const flush = () => {
		if (!cur) return;
		const lo = Math.max(0, cur.a - PAD_BEFORE, cur.first > 0 ? w[cur.first - 1].b + 0.01 : 0);
		const hi = Math.min(total, cur.b + PAD_AFTER, cur.last + 1 < w.length ? w[cur.last + 1].a - 0.01 : Infinity);
		const s = Math.floor(lo * FPS) / FPS;
		const frames = Math.max(1, Math.ceil((hi - s) * FPS));
		const prev = clips.at(-1);
		if (prev && prev.src === seg.src && prev.seg === si && s <= prev.start + prev.frames / FPS) prev.frames = Math.ceil((s - prev.start) * FPS) + frames;
		else clips.push({src: seg.src, start: s, frames, seg: si});
		cur = null;
	};
	for (let i = seg.from; i <= seg.to; i++) {
		if (drop.has(i)) {
			flush();
			continue;
		}
		if (cur && w[i].a - cur.b <= MAX_PAUSE) {
			cur.b = w[i].b;
			cur.last = i;
		} else {
			flush();
			cur = {a: w[i].a, b: w[i].b, first: i, last: i};
		}
	}
	flush();
});
// cropRanges (lesson 4): a window switch mid-sentence (Pro window with a side panel) → crop by seconds.
// Clips are split on the range edges with no fade at the joint, so the voice stays seamless.
const cropOf = (c) => {
	const mid = c.start + c.frames / FPS / 2;
	const r = (edl.cropRanges ?? []).find((r) => r.src === c.src && mid >= r.from && mid < r.to);
	return r?.crop ?? edl.segments[c.seg].crop ?? edl.crop[c.src];
};
for (const r of edl.cropRanges ?? []) for (const t of [r.from, r.to]) {
	const k = clips.findIndex((c) => c.src === r.src && t > c.start + 1 / FPS && t < c.start + (c.frames - 1) / FPS);
	if (k < 0) continue;
	const c = clips[k];
	const n = Math.round((t - c.start) * FPS);
	clips.splice(k, 1, {...c, frames: n, noFadeOut: true}, {...c, start: c.start + n / FPS, frames: c.frames - n, noFadeIn: true, noFadeOut: c.noFadeOut});
	clips[k].noFadeIn = c.noFadeIn;
}
const words = srcData.map((d) => d.words);

let out = 0;
for (const [k, c] of clips.entries()) {
	c.out = out;
	out += c.frames;
	const cr = cropOf(c);
	const dur = c.frames / FPS;
	let vf = `crop=${cr.w}:${cr.h}:${cr.x}:${cr.y}`;
	for (const b of edl.blurs.filter((b) => b.src === c.src && b.to > c.start && b.from < c.start + dur)) {
		const a = Math.max(0, b.from - c.start).toFixed(3);
		const z = (b.to - c.start).toFixed(3);
		vf += `,split[m][s];[s]crop=${b.w}:${b.h}:${b.x}:${b.y},gblur=sigma=18[bl];[m][bl]overlay=${b.x}:${b.y}:enable='between(t,${a},${z})'`;
	}
	if (cr.w < W || cr.h < H) vf += `,pad=${W}:${H}:0:0:black`;
	vf += `,fps=${FPS},format=yuv420p`;
	execFileSync(ffmpeg, ['-v', 'error', '-y', '-ss', c.start.toFixed(3), '-i', srcPath(c.src), '-t', (dur + 0.2).toFixed(3),
		'-filter_complex', `[0:v]${vf}[v]`, '-map', '[v]', '-an', '-frames:v', String(c.frames),
		'-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', path.join(TMP, `c${String(k).padStart(4, '0')}.mkv`)]);
	process.stdout.write(`\r${k + 1}/${clips.length}`);
}
console.log();
const list = clips.map((_, k) => `file 'c${String(k).padStart(4, '0')}.mkv'`).join('\n');
fs.writeFileSync(path.join(TMP, 'list.txt'), list);
// Sync (Adil 2026-11-09: the voice must match the picture 100%; a stream-copy concat drifted ~2 s over 9 min):
// the picture is re-timed by frame number (frame n = n/30 s), and the voice is sliced sample-exact from the
// source with the SAME frame-snapped edges.
execFileSync(ffmpeg, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(TMP, 'list.txt'),
	'-vf', `setpts=N/${FPS}/TB`, '-r', String(FPS), '-fps_mode', 'cfr', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-movflags', '+faststart', path.join(DIR, 'cut.mp4')]);
const SR = 48000;
const pcmOf = (file) => {
	const buf = execFileSync(ffmpeg, ['-v', 'error', '-i', file, '-vn', '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', '-f', 'wav', '-'], {maxBuffer: 2 ** 31 - 1});
	const at = buf.indexOf('data') + 8;
	return new Int16Array(buf.buffer.slice(buf.byteOffset + at, buf.byteOffset + buf.length - ((buf.length - at) % 2)));
};
const pcms = edl.sources.map((_, n) => (clips.some((c) => c.src === n) ? pcmOf(srcPath(n)) : null));
const per = SR / FPS;
const dst = new Int16Array(out * per);
const fadeN = Math.round(0.01 * SR);
for (const c of clips) {
	const a0 = Math.round(c.start * FPS) * per; // start sits on the frame grid
	const len = c.frames * per;
	const srcPcm = pcms[c.src];
	for (let n = 0; n < len; n++) {
		const g = Math.min(1, c.noFadeIn ? 1 : n / fadeN, c.noFadeOut ? 1 : (len - 1 - n) / fadeN);
		dst[c.out * per + n] = Math.round((srcPcm[a0 + n] ?? 0) * g);
	}
}
const raw = path.join(TMP, 'raw.wav');
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0);
hdr.writeUInt32LE(36 + dst.length * 2, 4);
hdr.write('WAVE', 8);
hdr.write('fmt ', 12);
hdr.writeUInt32LE(16, 16);
hdr.writeUInt16LE(1, 20);
hdr.writeUInt16LE(1, 22);
hdr.writeUInt32LE(SR, 24);
hdr.writeUInt32LE(SR * 2, 28);
hdr.writeUInt16LE(2, 32);
hdr.writeUInt16LE(16, 34);
hdr.write('data', 36);
hdr.writeUInt32LE(dst.length * 2, 40);
fs.writeFileSync(raw, Buffer.concat([hdr, Buffer.from(dst.buffer)]));
const polished = path.join(TMP, 'voice.wav');
const full = polishVoice(raw, polished);
execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', polished, '-af', 'volume=6dB,alimiter=limit=0.84:level=0', '-ac', '1', '-c:a', 'flac', path.join(DIR, 'voice.flac')]);

// word (src, index) → output frame
const frameOf = (src, i, at) => {
	const t = at ?? words[src][i].start;
	const c = clips.find((c) => c.src === src && t >= c.start - 0.15 && t < c.start + c.frames / FPS);
	if (!c) throw new Error(`word ${src}:${i} is cut out`);
	return c.out + Math.max(0, Math.round((t - c.start) * FPS));
};
const segments = edl.segments.flatMap((seg, si) => {
	const runs = [];
	for (const c of clips.filter((c) => c.seg === si)) {
		const w = cropOf(c).w;
		if (runs.at(-1)?.cropW === w) runs.at(-1).to = c.out + c.frames;
		else runs.push({src: seg.src, mode: seg.mode, from: c.out, to: c.out + c.frames, cropW: w});
	}
	return runs;
});
const segEnd = (f) => segments.find((s) => f >= s.from && f < s.to).to;
const cards = edl.cards.map((c) => ({...c, frame: frameOf(c.src, c.word, c.t)}));
const groupEnd = {};
for (const c of cards) groupEnd[c.group] = segEnd(c.frame);
const headers = edl.headers.map((h) => ({text: h.text, frame: frameOf(h.src, h.word, h.t)}));
const lesson = {
	title: edl.title, lesson: edl.lesson, lessonTitle: edl.lessonTitle, durationInFrames: out, width: W, height: H,
	segments, cards: cards.map((c) => ({group: c.group, n: c.n, text: c.text, frame: c.frame, until: groupEnd[c.group]})), headers,
};
fs.writeFileSync(path.join(DIR, 'lesson.json'), JSON.stringify(lesson, null, 1));
console.log(`clips ${clips.length}, length ${(out / FPS / 60).toFixed(2)} min, full voice polish: ${full}`);
