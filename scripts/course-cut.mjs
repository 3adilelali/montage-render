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
const GAP = 1.0; // a silence longer than this inside a segment gets squeezed
const KEEP_AFTER = 0.3;
const KEEP_BEFORE = 0.25;
const PAD_IN = 0.12;
const PAD_OUT = 0.18;
const W = 1280;
const H = 688;

const id = process.argv[2];
const DIR = path.join(PUBLIC_DIR, 'course', id);
const edl = JSON.parse(fs.readFileSync(path.join(DIR, 'edl.json'), 'utf8'));
const words = edl.sources.map((_, n) => JSON.parse(fs.readFileSync(path.join(DIR, `src${n}.words.json`), 'utf8')).words.map((x) => ({...x, end: Math.min(x.end, x.start + 1.2)})));
const srcPath = (n) => path.resolve(ENGINE, edl.sources[n]);
const TMP = path.join(DIR, 'clips');
fs.rmSync(TMP, {recursive: true, force: true});
fs.mkdirSync(TMP, {recursive: true});

const snap = (t) => Math.round(t * FPS) / FPS;
const clips = []; // {src, start, frames, seg}
edl.segments.forEach((seg, si) => {
	const w = words[seg.src];
	const prevEnd = seg.from > 0 ? w[seg.from - 1].end + 0.02 : 0;
	const nextStart = seg.to + 1 < w.length ? w[seg.to + 1].start - 0.02 : Infinity;
	let start = Math.max(w[seg.from].start - PAD_IN, prevEnd, 0);
	for (let i = seg.from; i <= seg.to; i++) {
		const last = i === seg.to;
		const gap = last ? 0 : w[i + 1].start - w[i].end;
		if (last || gap > GAP) {
			const end = last ? Math.min(w[i].end + PAD_OUT, nextStart) : w[i].end + KEEP_AFTER;
			const s = snap(start);
			const frames = Math.max(1, Math.round((end - s) * FPS));
			clips.push({src: seg.src, start: s, frames, seg: si});
			if (!last) start = w[i + 1].start - KEEP_BEFORE;
		}
	}
});

let out = 0;
for (const [k, c] of clips.entries()) {
	c.out = out;
	out += c.frames;
	const cr = edl.crop[c.src];
	const dur = c.frames / FPS;
	let vf = `crop=${cr.w}:${cr.h}:${cr.x}:${cr.y}`;
	for (const b of edl.blurs.filter((b) => b.src === c.src && b.to > c.start && b.from < c.start + dur)) {
		const a = Math.max(0, b.from - c.start).toFixed(3);
		const z = (b.to - c.start).toFixed(3);
		vf += `,split[m][s];[s]crop=${b.w}:${b.h}:${b.x}:${b.y},gblur=sigma=18[bl];[m][bl]overlay=${b.x}:${b.y}:enable='between(t,${a},${z})'`;
	}
	if (cr.w < W || cr.h < H) vf += `,pad=${W}:${H}:0:0:black`;
	vf += `,fps=${FPS},format=yuv420p`;
	const af = `afade=t=in:d=0.012,apad,atrim=0:${dur.toFixed(4)},afade=t=out:st=${(dur - 0.015).toFixed(4)}:d=0.015`;
	execFileSync(ffmpeg, ['-v', 'error', '-y', '-ss', c.start.toFixed(3), '-i', srcPath(c.src), '-t', (dur + 0.2).toFixed(3),
		'-filter_complex', `[0:v]${vf}[v];[0:a]${af}[a]`, '-map', '[v]', '-map', '[a]', '-frames:v', String(c.frames),
		'-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '1', path.join(TMP, `c${String(k).padStart(4, '0')}.mkv`)]);
	process.stdout.write(`\r${k + 1}/${clips.length}`);
}
console.log();
const list = clips.map((_, k) => `file 'c${String(k).padStart(4, '0')}.mkv'`).join('\n');
fs.writeFileSync(path.join(TMP, 'list.txt'), list);
const joined = path.join(TMP, 'joined.mkv');
execFileSync(ffmpeg, ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(TMP, 'list.txt'), '-c', 'copy', joined]);
execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', joined, '-an', '-c:v', 'copy', '-movflags', '+faststart', path.join(DIR, 'cut.mp4')]);
const raw = path.join(TMP, 'raw.wav');
execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', joined, '-vn', '-c:a', 'pcm_s16le', raw]);
const polished = path.join(TMP, 'voice.wav');
const full = polishVoice(raw, polished);
execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', polished, '-ac', '1', '-c:a', 'flac', path.join(DIR, 'voice.flac')]);

// word (src, index) → output frame
const frameOf = (src, i) => {
	const t = words[src][i].start;
	const c = clips.find((c) => c.src === src && t >= c.start - 0.15 && t < c.start + c.frames / FPS);
	if (!c) throw new Error(`word ${src}:${i} is cut out`);
	return c.out + Math.max(0, Math.round((t - c.start) * FPS));
};
const segments = edl.segments.map((seg, si) => {
	const cs = clips.filter((c) => c.seg === si);
	return {src: seg.src, mode: seg.mode, from: cs[0].out, to: cs.at(-1).out + cs.at(-1).frames, cropW: edl.crop[seg.src].w};
});
const segEnd = (f) => segments.find((s) => f >= s.from && f < s.to).to;
const cards = edl.cards.map((c) => ({...c, frame: frameOf(c.src, c.word)}));
const groupEnd = {};
for (const c of cards) groupEnd[c.group] = segEnd(c.frame);
const headers = edl.headers.map((h) => ({text: h.text, frame: frameOf(h.src, h.word)}));
const lesson = {
	title: edl.title, lesson: edl.lesson, lessonTitle: edl.lessonTitle, durationInFrames: out, width: W, height: H,
	segments, cards: cards.map((c) => ({group: c.group, n: c.n, text: c.text, frame: c.frame, until: groupEnd[c.group]})), headers,
};
fs.writeFileSync(path.join(DIR, 'lesson.json'), JSON.stringify(lesson, null, 1));
console.log(`clips ${clips.length}, length ${(out / FPS / 60).toFixed(2)} min, full voice polish: ${full}`);
