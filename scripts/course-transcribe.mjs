// كورس كلود بالعربي — step 1: transcribe every raw OBS recording of a lesson with ElevenLabs Scribe v2.
// node scripts/course-transcribe.mjs <lessonId> <file1> <file2> ...
// → public/course/<lessonId>/src<N>.words.json  (words with start/end in seconds of that file)
//   and prints phrases ("[file:word] mm:ss text") so Claude can decide what to keep.
// The key is read from المحرك/مفتاح ElevenLabs.txt (never printed).
import path from 'node:path';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {ENGINE, PUBLIC_DIR} from './common.mjs';
import {ffmpeg} from './audio.mjs';

const [lesson, ...files] = process.argv.slice(2);
if (!lesson || !files.length) {
	console.error('usage: node scripts/course-transcribe.mjs <lessonId> <files...>');
	process.exit(1);
}
const OUT = path.join(PUBLIC_DIR, 'course', lesson);
fs.mkdirSync(OUT, {recursive: true});
const key = fs.readFileSync(path.join(ENGINE, 'مفتاح ElevenLabs.txt'), 'utf8').trim();

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(1).padStart(4, '0')}`;

for (const [n, file] of files.entries()) {
	const out = path.join(OUT, `src${n}.words.json`);
	if (!fs.existsSync(out)) {
		const mono = execFileSync(ffmpeg, ['-v', 'error', '-i', file, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', '-f', 'wav', '-'], {maxBuffer: 1 << 30});
		const form = new FormData();
		form.append('model_id', 'scribe_v2');
		form.append('file', new Blob([mono], {type: 'audio/wav'}), 'voice.wav');
		form.append('language_code', 'ar');
		form.append('timestamps_granularity', 'word');
		form.append('tag_audio_events', 'false');
		const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {method: 'POST', headers: {'xi-api-key': key}, body: form});
		const body = await res.json().catch(() => ({}));
		if (!res.ok) {
			console.error(`Scribe error ${res.status}: ${JSON.stringify(body.detail ?? body).slice(0, 300)}`);
			process.exit(1);
		}
		const words = (body.words ?? [])
			.filter((w) => w.type === 'word' && w.text.trim())
			.map((w, i) => ({i, text: w.text.trim(), start: +w.start.toFixed(3), end: +w.end.toFixed(3)}));
		fs.writeFileSync(out, JSON.stringify({file, words}, null, 1));
	}
	const {words} = JSON.parse(fs.readFileSync(out, 'utf8'));
	console.log(`\n===== src${n}: ${path.basename(file)} (${words.length} words) =====`);
	let line = null;
	const flush = () => line && console.log(`[${n}:${line.from}-${line.to}] ${fmt(line.start)}-${fmt(line.end)} ${line.text}`);
	for (const w of words) {
		if (line && w.start - line.end <= 0.6 && line.text.length < 160) {
			line.text += ' ' + w.text;
			line.to = w.i;
			line.end = w.end;
		} else {
			flush();
			line = {from: w.i, to: w.i, start: w.start, end: w.end, text: w.text};
		}
	}
	flush();
}
