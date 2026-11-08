// Insert silent pauses into the voice so a clip / card can be watched before the talking resumes
// (Adil 2026-10-12: «لما تعرض المثال… توقف شوي ينعرض الفيديو… بعدين بكمل كلام»).
// Usage: node scripts/insert-pauses.mjs        reads public/explainer/pauses.json:
//   { "pauses": [ { "after": 114, "seconds": 4.5, "why": "lazy-prompt result plays" } ] }   (after = word index in the un-paused captions)
// Rewrites voice.wav, captions.json (words after each pause shift later), levels.json and timeline.json.
// Keeps the originals as *.before-pauses.* and always starts from them, so pauses.json can be edited and re-run.
// Run it AFTER cut-words.mjs (if used) and BEFORE writing the plan: the plan is written on the paused word timings
// (word indices don't change, only times — so an existing plan stays valid).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {PUBLIC_DIR} from './common.mjs';
import {durationMsOf, systemFfmpeg, writeLevels} from './audio.mjs';

const DIR = path.join(PUBLIC_DIR, 'explainer');
const P = (f) => path.join(DIR, f);
const spec = JSON.parse(fs.readFileSync(P('pauses.json'), 'utf8'));
for (const [cur, bak] of [['voice.wav', 'voice.before-pauses.wav'], ['captions.json', 'captions.before-pauses.json']]) {
	if (fs.existsSync(P(bak))) fs.copyFileSync(P(bak), P(cur));
	else fs.copyFileSync(P(cur), P(bak));
}
const words = JSON.parse(fs.readFileSync(P('captions.json'), 'utf8'));
const pauses = [...spec.pauses].sort((a, b) => a.after - b.after);

// Cut point = the middle of the gap after the word (or its end if words touch), in seconds.
const points = pauses.map((pz) => {
	const w = words[pz.after];
	const next = words[pz.after + 1];
	const at = next ? (w.endMs + Math.max(w.endMs, Math.min(next.startMs, w.endMs + 200))) / 2 : w.endMs;
	return {at: at / 1000, sec: pz.seconds, after: pz.after};
});

// Build: seg0 + silence + seg1 + silence + … with tiny fades at each joint.
const ff = systemFfmpeg ?? 'ffmpeg';
const inputs = ['-i', P('voice.before-pauses.wav')];
const parts = [];
let prev = 0;
points.forEach((pt, i) => {
	parts.push(`[0:a]atrim=${prev}:${pt.at},asetpts=PTS-STARTPTS,afade=t=out:st=${Math.max(0, pt.at - prev - 0.012)}:d=0.012[s${i}]`);
	parts.push(`anullsrc=r=48000:cl=mono,atrim=0:${pt.sec}[z${i}]`);
	prev = pt.at;
});
parts.push(`[0:a]atrim=${prev},asetpts=PTS-STARTPTS,afade=t=in:d=0.012[s${points.length}]`);
const order = points.map((_, i) => `[s${i}][z${i}]`).join('') + `[s${points.length}]`;
// Resample everything to mono 48k so concat accepts the silence segments.
const norm = parts.map((p) => p.replace(/^\[0:a\]/, '[0:a]aresample=48000,aformat=channel_layouts=mono,'));
const filter = `${norm.join(';')};${order}concat=n=${points.length * 2 + 1}:v=0:a=1[out]`;
execFileSync(ff, ['-v', 'error', '-y', ...inputs, '-filter_complex', filter, '-map', '[out]', '-ar', '48000', P('voice.wav')]);

// Shift the captions.
let shift = 0;
let k = 0;
const out = words.map((w, i) => {
	while (k < points.length && i > points[k].after) shift += points[k++].sec * 1000;
	return {...w, startMs: Math.round(w.startMs + shift), endMs: Math.round(w.endMs + shift), timestampMs: Math.round((w.timestampMs ?? w.startMs) + shift)};
});
fs.writeFileSync(P('captions.json'), JSON.stringify(out, null, 1), 'utf8');

const durationMs = durationMsOf(P('voice.wav'));
writeLevels(P('voice.wav'), P('levels.json'), durationMs, 30);
const tl = JSON.parse(fs.readFileSync(P('timeline.json'), 'utf8'));
fs.writeFileSync(P('timeline.json'), JSON.stringify({...tl, durationMs}, null, 2), 'utf8');
console.log(`Inserted ${points.length} pause(s): ${points.map((p) => `+${p.sec}s after word ${p.after} @${p.at.toFixed(2)}s`).join(', ')} → ${(durationMs / 1000).toFixed(1)}s`);
