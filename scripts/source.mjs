// Pull a source video's idea: YouTube (or any yt-dlp) link → title, channel, description, full transcript.
// Usage: node scripts/source.mjs <url> [--name اسم] [--whisper] [--out <folder>]
// Output: الأفكار/<name>/
//   المصدر.md        title, channel, link, duration, views, description
//   النص-الأصلي.txt  transcript in the video's language, one line per ~10s with [mm:ss] stamps
//   info.json        raw metadata (chapters, tags…)
// Order: the creator's own subtitles → YouTube auto-captions in the original language → Whisper on the audio (--whisper, or nothing else exists).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {IDEAS_DIR, SCRIPTS_DIR, findPython, mergeWords, q} from './common.mjs';

const args = process.argv.slice(2);
const flag = (name) => {
	const i = args.indexOf(`--${name}`);
	return i === -1 ? undefined : args.splice(i, 2)[1];
};
const bool = (name) => {
	const i = args.indexOf(`--${name}`);
	if (i === -1) return false;
	args.splice(i, 1);
	return true;
};
let name = flag('name');
const outRoot = flag('out'); // another parent folder (e.g. قناتي/فيديوهاتي) instead of الأفكار/
const forceWhisper = bool('whisper');
const url = args[0];
if (!url) {
	console.error('Usage: node scripts/source.mjs <url> [--name name] [--whisper]');
	process.exit(1);
}
const python = findPython();
if (!python) {
	console.error('Python not found. Run: node scripts/setup.mjs');
	process.exit(1);
}
const ytdlp = (a, opts = {}) => execFileSync(python[0], [...python.slice(1), '-m', 'yt_dlp', ...a], {maxBuffer: 1 << 28, ...opts});

// ---------- 1. metadata ----------
console.log('[1/3] Reading the video page');
const info = JSON.parse(ytdlp(['-J', '--no-playlist', '--no-warnings', url]).toString());
const lang = (info.language ?? 'en').split('-')[0];
const safe = (s) => s.replace(/[<>:"/\\|?*\x00-\x1F#%&{}$!'@+`=]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
name ??= safe(info.title ?? info.id);
const dir = path.join(outRoot ? path.resolve(outRoot) : IDEAS_DIR, name);
fs.mkdirSync(dir, {recursive: true});
fs.writeFileSync(path.join(dir, 'info.json'), JSON.stringify({...info, formats: undefined, thumbnails: undefined, requested_formats: undefined, automatic_captions: undefined, subtitles: undefined}, null, 2), 'utf8');
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
fs.writeFileSync(
	path.join(dir, 'المصدر.md'),
	[
		`# ${info.title}`,
		'',
		`- **القناة:** ${info.channel ?? info.uploader ?? '—'}`,
		`- **الرابط:** ${info.webpage_url ?? url}`,
		`- **المدة:** ${mmss(info.duration ?? 0)}`,
		`- **المشاهدات:** ${info.view_count?.toLocaleString('en-US') ?? '—'}`,
		`- **تاريخ النشر:** ${info.upload_date ?? '—'}`,
		`- **لغة الفيديو:** ${lang}`,
		info.chapters?.length ? `\n## الفصول\n${info.chapters.map((c) => `- [${mmss(c.start_time)}] ${c.title}`).join('\n')}` : '',
		'',
		'## الوصف',
		'',
		info.description ?? '',
	].join('\n'),
	'utf8',
);
console.log(`  ${info.title} — ${info.channel ?? ''} (${mmss(info.duration ?? 0)}, ${lang})`);

// ---------- 2. transcript ----------
const pickTrack = (tracks, auto) => {
	if (!tracks) return null;
	const keys = Object.keys(tracks).filter((k) => k !== 'live_chat');
	// Auto-captions: the "-orig" track is the real speech; others are machine translations.
	const order = auto ? [`${lang}-orig`, lang, `${info.language}`] : [info.language, lang, ...keys.filter((k) => k.startsWith(lang)), 'en', ...keys];
	for (const k of order) {
		const t = tracks[k]?.find((f) => f.ext === 'json3');
		if (t) return {key: k, url: t.url};
	}
	return null;
};
const track = forceWhisper ? null : (pickTrack(info.subtitles, false) ?? pickTrack(info.automatic_captions, true));

let lines = [];
if (track) {
	console.log(`[2/3] Downloading ${info.subtitles?.[track.key] ? 'subtitles' : 'auto-captions'} (${track.key})`);
	const res = await fetch(track.url);
	if (!res.ok) throw new Error(`Subtitles: HTTP ${res.status} — try again later or add --whisper`);
	const j = await res.json();
	let cur = null;
	for (const ev of j.events ?? []) {
		const text = (ev.segs ?? []).map((s) => s.utf8).join('').replace(/\s+/g, ' ').trim();
		if (!text) continue;
		const t = (ev.tStartMs ?? 0) / 1000;
		if (!cur || t - cur.t > 10) {
			if (cur) lines.push(cur);
			cur = {t, text};
		} else cur.text += ` ${text}`;
	}
	if (cur) lines.push(cur);
} else {
	console.log('[2/3] No captions — downloading audio for Whisper (slow)');
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'source-'));
	ytdlp(['-f', 'ba/b', '-x', '--audio-format', 'm4a', '--no-playlist', '-o', path.join(tmp, 'a.%(ext)s'), url], {stdio: 'inherit'});
	const audio = fs.readdirSync(tmp).map((f) => path.join(tmp, f))[0];
	const raw = path.join(tmp, 'captions.json');
	const r = spawnSync('node', [q(path.join(SCRIPTS_DIR, 'transcribe.mjs')), q(audio), q(raw), 'auto'], {stdio: 'inherit', shell: true});
	if (r.status !== 0) process.exit(r.status ?? 1);
	let cur = null;
	for (const w of mergeWords(JSON.parse(fs.readFileSync(raw, 'utf8')))) {
		const t = w.startMs / 1000;
		if (!cur || t - cur.t > 10) {
			if (cur) lines.push(cur);
			cur = {t, text: w.text.trim()};
		} else cur.text += ` ${w.text.trim()}`;
	}
	if (cur) lines.push(cur);
	fs.rmSync(tmp, {recursive: true, force: true});
}

// ---------- 3. save ----------
console.log('[3/3] Saving');
const out = lines.map((l) => `[${mmss(l.t)}] ${l.text}`).join('\n');
fs.writeFileSync(path.join(dir, 'النص-الأصلي.txt'), out, 'utf8');
const words = out.split(/\s+/).length;
console.log(`\nDone → ${dir}\n  ${lines.length} lines, ~${words} words`);
