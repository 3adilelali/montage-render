// Local transcription with Whisper.cpp (medium model), word-level timestamps.
// Usage: node scripts/transcribe.mjs <video-or-audio> <output.json> [language=ar]
// Installs whisper.cpp + the model on first run (≈1.5 GB download) into WHISPER_DIR.
import path from 'node:path';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {
	downloadWhisperModel,
	installWhisperCpp,
	toCaptions,
	transcribe,
} from '@remotion/install-whisper-cpp';
import {ENGINE, WHISPER_DIR, q} from './common.mjs';

const WHISPER_VERSION = '1.5.5';
const MODEL = 'medium';

const [input, output, language = process.env.WHISPER_LANGUAGE ?? 'ar'] = process.argv.slice(2);
if (!input || !output) {
	console.error('Usage: node scripts/transcribe.mjs <video-or-audio> <output.json> [language]');
	process.exit(1);
}
const inputPath = path.resolve(input);
if (!fs.existsSync(inputPath)) {
	console.error(`File not found: ${inputPath}`);
	process.exit(1);
}
const outputPath = path.resolve(output);

await installWhisperCpp({to: WHISPER_DIR, version: WHISPER_VERSION});
await downloadWhisperModel({model: MODEL, folder: WHISPER_DIR});

// Whisper.cpp needs 16 kHz mono WAV with an ASCII path.
const wavPath = path.join(WHISPER_DIR, `input-${Date.now()}.16k.wav`);
execFileSync(
	'npx',
	// Quoted: shell mode would split paths with spaces (e.g. Arabic file names).
	['remotion', 'ffmpeg', '-y', '-loglevel', 'error', '-i', q(inputPath), '-ar', '16000', '-ac', '1', q(wavPath)],
	{stdio: 'inherit', shell: true, cwd: ENGINE},
);

// whisper.cpp writes its tmp.json into the working directory, which must be ASCII too.
process.chdir(WHISPER_DIR);
try {
	const whisperOutput = await transcribe({
		inputPath: wavPath,
		whisperPath: WHISPER_DIR,
		whisperCppVersion: WHISPER_VERSION,
		model: MODEL,
		language,
		tokenLevelTimestamps: true,
		printOutput: false,
		onProgress: (p) => process.stdout.write(`\rTranscribing: ${Math.round(p * 100)}%`),
	});
	process.stdout.write('\n');

	const {captions} = toCaptions({whisperCppOutput: whisperOutput});
	fs.mkdirSync(path.dirname(outputPath), {recursive: true});
	fs.writeFileSync(outputPath, JSON.stringify(captions, null, 2), 'utf8');
	console.log(`Saved ${captions.length} captions to ${outputPath}`);
} finally {
	fs.rmSync(wavPath, {force: true});
}
