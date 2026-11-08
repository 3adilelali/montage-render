// One-time setup check for a new machine. Installs what is missing and prints a clear status.
// Usage: node scripts/setup.mjs [--whisper]   (--whisper also downloads the speech model now, ≈1.5 GB)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ELEMENTS_DIR, ENGINE, IDEAS_DIR, SCRIPTS_OUT_DIR, INPUT_DIR, MUSIC_DIR, OUTPUT_DIR, PUBLIC_DIR, REFERENCES_DIR, SFX_DIR, STYLE_DIR, WHISPER_DIR, findPackageDir, findPython} from './common.mjs';

const results = [];
const ok = (name, detail = '') => results.push(`✅ ${name}${detail ? ` — ${detail}` : ''}`);
const bad = (name, fix) => results.push(`❌ ${name} — ${fix}`);
const sh = (cmd, args, opts = {}) => spawnSync(cmd, args, {encoding: 'utf8', shell: true, ...opts});

// 1. Node
const major = Number(process.versions.node.split('.')[0]);
if (major >= 18) ok('Node.js', process.versions.node);
else bad('Node.js', `الإصدار ${process.versions.node} قديم. ثبّت النسخة LTS من https://nodejs.org`);

// 2. Engine packages
// Packages live once in the root folder (npm workspaces); npm install from here installs them there.
if (!findPackageDir('remotion')) {
	console.log('Installing engine packages (npm install)…');
	const r = sh('npm', ['install'], {cwd: ENGINE, stdio: 'inherit'});
	if (r.status === 0) ok('حزم المحرك', 'تم التثبيت');
	else bad('حزم المحرك', 'فشل npm install — تأكد من الاتصال بالإنترنت ثم أعد المحاولة');
} else ok('حزم المحرك');

// 3. Python + pip tools
const python = findPython();
if (!python) {
	bad('Python 3', 'غير مثبت. ثبّته من https://www.python.org/downloads/ (فعّل خيار "Add python.exe to PATH") ثم أعد الفحص');
} else {
	ok('Python', sh(python[0], [...python.slice(1), '--version']).stdout.trim());
	const tools = [
		{module: 'auto_editor', pkg: 'auto-editor', label: 'auto-editor (قص الصمت)'},
		{module: 'yt_dlp', pkg: 'yt-dlp[default,curl-cffi]', label: 'yt-dlp (سحب الفيديوهات ونصوصها من الروابط)'},
	];
	for (const t of tools) {
		const has = () => sh(python[0], [...python.slice(1), '-m', t.module, '--version']).status === 0;
		if (has()) {
			ok(t.label);
			continue;
		}
		console.log(`Installing ${t.pkg}…`);
		sh(python[0], [...python.slice(1), '-m', 'pip', 'install', '--upgrade', t.pkg], {stdio: 'inherit'});
		if (has()) ok(t.label, 'تم التثبيت');
		else bad(t.label, `فشل التثبيت. جرّب يدوياً: python -m pip install ${t.pkg}`);
	}
}

// 4. Whisper (speech → text). Installed automatically on first transcription.
const model = path.join(WHISPER_DIR, 'ggml-medium.bin');
if (fs.existsSync(model)) ok('Whisper (تفريغ الكلام)', WHISPER_DIR);
else if (process.argv.includes('--whisper')) {
	const {installWhisperCpp, downloadWhisperModel} = await import('@remotion/install-whisper-cpp');
	await installWhisperCpp({to: WHISPER_DIR, version: '1.5.5'});
	await downloadWhisperModel({model: 'medium', folder: WHISPER_DIR});
	ok('Whisper (تفريغ الكلام)', 'تم التحميل');
} else ok('Whisper (تفريغ الكلام)', 'سيُحمَّل تلقائياً (≈1.5 جيجا) في أول مونتاج');

// 4b. Real-ESRGAN (upscales the 256px Fluent 3D icons ×4 once, see icons3d.mjs). Portable build into ~/.montage-tools/realesrgan.
{
	const dir = path.join(os.homedir(), '.montage-tools', 'realesrgan');
	const exe = path.join(dir, process.platform === 'win32' ? 'realesrgan-ncnn-vulkan.exe' : 'realesrgan-ncnn-vulkan');
	if (!fs.existsSync(exe) && process.platform === 'win32') {
		console.log('Installing Real-ESRGAN (3D icon upscaler, ≈45 MB)…');
		fs.mkdirSync(dir, {recursive: true});
		const zip = path.join(dir, 'esr.zip');
		sh('curl', ['-sL', '-o', `"${zip}"`, 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip']);
		sh('tar', ['-xf', `"${zip}"`, '-C', `"${dir}"`]);
		fs.rmSync(zip, {force: true});
	}
	if (fs.existsSync(exe)) ok('أيقونات 3D', 'Real-ESRGAN جاهز');
	else bad('أيقونات 3D', 'Real-ESRGAN غير مثبت: الأيقونات ستعمل بدقة أقل');
}

// 5. System ffmpeg (only needed to (re)generate the sound effects; rendering uses Remotion's own).
const hasFfmpeg = () => sh('ffmpeg', ['-version']).status === 0;
if (!hasFfmpeg() && process.platform === 'win32') {
	console.log('Installing FFmpeg (winget)…');
	sh('winget', ['install', '-e', '--id', 'Gyan.FFmpeg', '--accept-source-agreements', '--accept-package-agreements'], {stdio: 'inherit'});
}
const sfxReady = fs.existsSync(path.join(PUBLIC_DIR, 'assets', 'sfx', 'pop.wav'));
if (sfxReady) ok('المؤثرات الصوتية');
else if (hasFfmpeg()) {
	const r = sh('node', ['scripts/make-sfx.mjs'], {cwd: ENGINE, stdio: 'inherit'});
	if (r.status === 0) ok('المؤثرات الصوتية', 'تم التوليد');
	else bad('المؤثرات الصوتية', 'فشل التوليد: node scripts/make-sfx.mjs');
} else bad('FFmpeg', 'غير موجود. أغلق Claude وافتحه من جديد بعد التثبيت (أو ثبّته من https://www.gyan.dev/ffmpeg/builds) ثم أعد الفحص');

// 6. Folders
for (const d of [INPUT_DIR, OUTPUT_DIR, REFERENCES_DIR, STYLE_DIR, ELEMENTS_DIR, MUSIC_DIR, SFX_DIR, IDEAS_DIR, SCRIPTS_OUT_DIR]) fs.mkdirSync(d, {recursive: true});
ok('المجلدات');

console.log(`\n${results.join('\n')}`);
process.exit(results.some((r) => r.startsWith('❌')) ? 1 : 0);
