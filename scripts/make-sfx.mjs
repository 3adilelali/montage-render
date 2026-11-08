// Synthesises the explainer sound-effect set into public/assets/sfx/ (no downloads, no licences).
// Usage: node scripts/make-sfx.mjs
// Student packs in المؤثرات/ override these by file name (see scripts/sync-assets.mjs).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {PUBLIC_DIR} from './common.mjs';

const OUT = path.join(PUBLIC_DIR, 'assets', 'sfx');
fs.mkdirSync(OUT, {recursive: true});
// Remotion's bundled ffmpeg has no lavfi sources, so this needs a full system ffmpeg (winget install ffmpeg).
const ffmpeg = process.env.FFMPEG ?? 'ffmpeg';

// name → [duration s, aevalsrc expression, extra filters]
const N = '(random(0)*2-1)';
const SOUNDS = {
	// Bubble pop for icons/images landing.
	pop: [0.16, `sin(2*PI*(180+700*exp(-t*45))*t)*exp(-t*28)*0.9`, 'highpass=f=120'],
	// (No generated whoosh: transitions use the student's whooshes — whoosh-simple/-end/-sub.wav.)
	// Brighter, shorter swish for text reveals.
	swish: [0.24, `${N}*pow(sin(PI*t/0.24),2)*0.6`, 'highpass=f=2500,volume=2.5'],
	// Rising sweep before a big reveal.
	riser: [0.75, `(${N}*0.5+sin(2*PI*(200+900*t*t)*t)*0.3)*pow(t/0.75,2)`, 'highpass=f=300,volume=1.6'],
	// Deep hit for numbers and badges.
	impact: [0.9, `sin(2*PI*(45+90*exp(-t*18))*t)*exp(-t*4.5)+${N}*exp(-t*35)*0.5`, 'lowpass=f=5000'],
	// Glassy chime for highlights/green states.
	sparkle: [1.0, `(sin(2*PI*2093*t)*exp(-t*7)+sin(2*PI*2637*max(t-0.06,0))*exp(-max(t-0.06,0)*7)*gt(t,0.06)+sin(2*PI*3136*max(t-0.12,0))*exp(-max(t-0.12,0)*7)*gt(t,0.12)+sin(2*PI*4186*max(t-0.18,0))*exp(-max(t-0.18,0)*8)*gt(t,0.18))*0.35`, ''],
	// Digital glitch burst.
	glitch: [0.32, `(${N}*gt(sin(2*PI*23*t),0.2)+(2*gt(sin(2*PI*180*t),0)-1)*0.4*gt(sin(2*PI*11*t),0))*0.5*exp(-t*3)`, 'acrusher=bits=6:mix=1,volume=1.2'],
	// UI tick for counters / list items.
	tick: [0.05, `sin(2*PI*2400*t)*exp(-t*220)`, ''],
	// Mouse click.
	click: [0.08, `(${N}*exp(-t*400)+sin(2*PI*3200*t)*exp(-t*300))*0.8`, ''],
	// Coins / cash for money moments.
	cash: [0.9, `(sin(2*PI*3100*t)+sin(2*PI*4230*t)*0.7+sin(2*PI*5650*t)*0.5)*exp(-t*9)*0.3+(sin(2*PI*2600*max(t-0.12,0))+sin(2*PI*3900*max(t-0.12,0))*0.6)*exp(-max(t-0.12,0)*6)*gt(t,0.12)*0.3`, ''],
	// Soft "bloop" for cards/bubbles.
	bloop: [0.22, `sin(2*PI*(300+500*t)*t)*exp(-t*14)*0.8`, ''],
	// Error buzz for wrong / bad.
	wrong: [0.4, `((2*gt(sin(2*PI*140*t),0)-1)*0.35+sin(2*PI*147*t)*0.3)*(1-t/0.4)`, 'lowpass=f=2200'],
};

for (const [name, [d, expr, extra]] of Object.entries(SOUNDS)) {
	const filters = [extra, 'afade=t=out:st=' + (d * 0.85).toFixed(3) + ':d=' + (d * 0.15).toFixed(3), 'alimiter=limit=0.7'].filter(Boolean).join(',');
	execFileSync(ffmpeg, ['-v', 'error', '-y', '-f', 'lavfi', '-i', `aevalsrc=exprs='${expr}':s=48000:d=${d}`, '-af', filters, '-ac', '2', path.join(OUT, `${name}.wav`)]);
	console.log(`✓ ${name}.wav`);
}

// Typing: 14 keystrokes at slightly irregular intervals.
const typing = path.join(OUT, 'typing.wav');
const times = [];
for (let t = 0, i = 0; i < 14; i++) times.push((t += 0.06 + ((i * 37) % 5) * 0.012));
const clicks = times.map((t) => `${N}*exp(-(t-${t.toFixed(3)})*500)*gte(t,${t.toFixed(3)})*0.6`).join('+');
execFileSync(ffmpeg, ['-v', 'error', '-y', '-f', 'lavfi', '-i', `aevalsrc=exprs='${clicks}':s=48000:d=1.1`, '-af', 'bandpass=f=3000:width_type=o:w=2,volume=2,alimiter=limit=0.7', '-ac', '2', typing]);
console.log('✓ typing.wav');
