// Shared audio helpers for the montage pipeline.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {ffmpegDir} from './common.mjs';

const exe = (tool) => path.join(ffmpegDir(), process.platform === 'win32' ? `${tool}.exe` : tool);
export const ffmpeg = exe('ffmpeg');
export const ffprobe = exe('ffprobe');
// The system ffmpeg has the full filter set (denoise, compressor…); Remotion's bundled one only basics.
export const systemFfmpeg = (() => {
	const cmd = process.env.FFMPEG ?? 'ffmpeg';
	return spawnSync(cmd, ['-hide_banner', '-filters'], {encoding: 'utf8'}).stdout?.includes('afftdn') ? cmd : null;
})();

export const durationMsOf = (file) =>
	Math.round(parseFloat(execFileSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], {encoding: 'utf8'}).trim()) * 1000);

// Voice polish: rumble cut, light denoise, gentle compression, YouTube loudness (-14 LUFS).
export const polishVoice = (src, out) => {
	const full = 'highpass=f=70,afftdn=nf=-25:tn=1,acompressor=threshold=-20dB:ratio=3:attack=10:release=150:makeup=2,loudnorm=I=-14:LRA=9:TP=-1.5';
	const cmd = systemFfmpeg ?? ffmpeg;
	const filter = systemFfmpeg ? full : 'loudnorm=I=-14:LRA=9:TP=-1.5';
	execFileSync(cmd, ['-v', 'error', '-y', '-i', src, '-af', filter, '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', out]);
	return Boolean(systemFfmpeg);
};

// Per-frame voice loudness + 16 spectrum bands (0–1) → levels.json (the logo pulses with the voice).
export const writeLevels = (voice, outPath, durationMs, FPS = 30) => {
	const SR = 16000;
	const wavBuf = execFileSync(ffmpeg, ['-v', 'error', '-i', voice, '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', '-f', 'wav', '-'], {maxBuffer: 1 << 30});
	const dataAt = wavBuf.indexOf('data') + 8;
	const pcm = new Int16Array(wavBuf.buffer.slice(wavBuf.byteOffset + dataAt, wavBuf.byteOffset + wavBuf.length - ((wavBuf.length - dataAt) % 2)));
	const N = 1024;
	const BANDS = 16;
	const fft = (re, im) => {
		const n = re.length;
		for (let i = 1, j = 0; i < n; i++) {
			let bit = n >> 1;
			for (; j & bit; bit >>= 1) j ^= bit;
			j ^= bit;
			if (i < j) {
				[re[i], re[j]] = [re[j], re[i]];
				[im[i], im[j]] = [im[j], im[i]];
			}
		}
		for (let len = 2; len <= n; len <<= 1) {
			const ang = (-2 * Math.PI) / len;
			for (let i = 0; i < n; i += len) {
				for (let k = 0; k < len / 2; k++) {
					const wr = Math.cos(ang * k);
					const wi = Math.sin(ang * k);
					const ur = re[i + k];
					const ui = im[i + k];
					const vr = re[i + k + len / 2] * wr - im[i + k + len / 2] * wi;
					const vi = re[i + k + len / 2] * wi + im[i + k + len / 2] * wr;
					re[i + k] = ur + vr;
					im[i + k] = ui + vi;
					re[i + k + len / 2] = ur - vr;
					im[i + k + len / 2] = ui - vi;
				}
			}
		}
	};
	const edges = Array.from({length: BANDS + 1}, (_, b) => Math.round((100 * Math.pow(6000 / 100, b / BANDS) * N) / SR));
	const frames = Math.ceil((durationMs / 1000) * FPS);
	const level = [];
	const spectrum = [];
	for (let f = 0; f < frames; f++) {
		const c = Math.round((f / FPS) * SR);
		const re = new Float64Array(N);
		const im = new Float64Array(N);
		let rms = 0;
		for (let i = 0; i < N; i++) {
			const s = (pcm[c - N / 2 + i] ?? 0) / 32768;
			re[i] = s * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)));
			rms += s * s;
		}
		fft(re, im);
		level.push(Math.sqrt(rms / N));
		spectrum.push(
			Array.from({length: BANDS}, (_, b) => {
				let m = 0;
				for (let k = edges[b]; k < Math.max(edges[b] + 1, edges[b + 1]); k++) m = Math.max(m, Math.hypot(re[k], im[k]));
				return m;
			}),
		);
	}
	const p95 = (arr) => [...arr].sort((a, b) => a - b)[Math.floor(arr.length * 0.95)] || 1;
	const lv = p95(level);
	const sp = Array.from({length: BANDS}, (_, b) => p95(spectrum.map((s) => s[b])));
	const r2 = (v) => Math.round(Math.min(1, v) * 100) / 100;
	fs.writeFileSync(
		outPath,
		JSON.stringify({fps: FPS, bands: BANDS, level: level.map((v) => r2(v / lv)), spectrum: spectrum.map((s) => s.map((v, b) => r2(v / sp[b])))}),
		'utf8',
	);
};
