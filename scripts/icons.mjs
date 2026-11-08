// Find icon ids for plan.json (offline, from the installed Iconify sets).
// Usage: node scripts/icons.mjs <english keyword...>     e.g.  node scripts/icons.mjs money rocket
// Sets: fluent-emoji-flat (flat colourful, the default look), fluent-emoji (3D glossy),
//       flat-color-icons, logos + skill-icons (brands: youtube, instagram, tiktok, claude, openai …).
import fs from 'node:fs';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const SETS = ['fluent-emoji-flat', 'logos', 'skill-icons', 'flat-color-icons', 'fluent-emoji'];
const words = process.argv.slice(2).map((w) => w.toLowerCase());
if (!words.length) {
	console.error('Usage: node scripts/icons.mjs <keyword...>');
	process.exit(1);
}
for (const prefix of SETS) {
	const set = JSON.parse(fs.readFileSync(require.resolve(`@iconify-json/${prefix}/icons.json`), 'utf8'));
	const names = [...Object.keys(set.icons), ...Object.keys(set.aliases ?? {})];
	for (const w of words) {
		const hits = names.filter((n) => n.includes(w)).slice(0, 12);
		if (hits.length) console.log(`${prefix} [${w}]: ${hits.map((h) => `${prefix}:${h}`).join('  ')}`);
	}
}
