// Render the montage on GitHub Actions (free, parallel) instead of this PC. Same output as scripts/render.mjs.
// Usage: node scripts/cloud-render.mjs [--chunks N]
//        node scripts/cloud-render.mjs --course l1 --out "<lesson folder>/<name>.mp4"   (كورس كلود بالعربي: CourseLesson)
// 1) pushes engine code to the public repo (no public/, no keys), 2) uploads public/ as job.tar to a temporary
// release, 3) runs .github/workflows/render.yml, 4) downloads final.mp4 into المخرجات/, 5) deletes the release.
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {ENGINE, OUTPUT_DIR, PUBLIC_DIR, SCRIPTS_DIR, q} from './common.mjs';

const REPO = '3adilelali/montage-render';
const GH = fs.existsSync('C:/Program Files/GitHub CLI/gh.exe') ? 'C:/Program Files/GitHub CLI/gh.exe' : 'gh';
const run = (cmd, args, opts = {}) => {
	const r = spawnSync(cmd, args, {cwd: ENGINE, encoding: 'utf8', stdio: opts.capture ? 'pipe' : 'inherit', ...opts});
	if (r.status !== 0 && !opts.ok) throw new Error(`${cmd} ${args.join(' ')} failed\n${r.stderr ?? ''}`);
	return (r.stdout ?? '').trim();
};
const gh = (args, opts) => run(GH, args, opts);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const arg = (k) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : null; };
const course = arg('--course');
const COMP = course ? 'CourseLesson' : 'Explainer';
const PROPS = course ? JSON.stringify({lessonId: course, lesson: null}) : '{}';
if (course) fs.writeFileSync(path.join(PUBLIC_DIR, 'course', course, 'props.json'), PROPS);
// 0) assets + frame count
if (!course && spawnSync('node', [q(path.join(SCRIPTS_DIR, 'sync-assets.mjs'))], {cwd: ENGINE, stdio: 'inherit', shell: true}).status !== 0) process.exit(1);
const comps = spawnSync('npx', ['remotion', 'compositions', ...(course ? [`--props=${q(path.join(PUBLIC_DIR, 'course', course, 'props.json'))}`] : [])], {cwd: ENGINE, encoding: 'utf8', shell: true}).stdout;
const frames = Number(comps.match(new RegExp(COMP + String.raw`\s+\d+\s+\d+x\d+\s+(\d+)`))?.[1] ?? comps.match(/Explainer\s+\d+\s+\d+x\d+\s+(\d+)/)?.[1]);
if (!frames) throw new Error('could not read the frame count');
if (course && !arg('--out')) throw new Error('--out is required with --course');
const ci = process.argv.indexOf('--chunks');
const chunks = ci > -1 ? Number(process.argv[ci + 1]) : Math.min(20, Math.max(6, Math.ceil(frames / 1200)))  // smaller chunks even out heavy scenes;
console.log(`frames ${frames} → ${chunks} machines`);

// 1) engine code → repo (public/, node_modules and the keys are in .gitignore)
if (!fs.existsSync(path.join(ENGINE, '.git'))) run('git', ['init', '-b', 'main']);
if (!run('git', ['remote'], {capture: true}).includes('origin')) run('git', ['remote', 'add', 'origin', `https://github.com/${REPO}.git`]);
run('git', ['add', '-A']);
const tracked = run('git', ['ls-files'], {capture: true});
if (/مفتاح|\.env|ElevenLabs\.txt|^public\//m.test(tracked)) throw new Error('a key or public/ file would be uploaded — stopped');
run('git', ['-c', 'user.name=Adil', '-c', 'user.email=render@local', 'commit', '-qm', 'engine'], {ok: true});
run('git', ['push', '-q', '-u', 'origin', 'main']);

// 2) job.tar = public/ minus the working copies of the voice
const tag = `job-${Date.now()}`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'render-'));
const tar = path.join(tmp, 'job.tar');  // the asset name must be job.tar (render.yml downloads that)
const SKIP = /^public\/(_study|thumbnail)\/|^public\/explainer\/(voice\.(raw|no-[^.]+|before-pauses)\.wav|captions\.before-pauses\.json)$/;
// only the asset files this plan uses (any string in plan.json that names an asset) + the logo
const A = course ? {files: {}} : JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'explainer', 'assets.json'), 'utf8'));
const keep = new Set(A.logo?.src ? ['public/' + A.logo.src] : []);
(function walk(o) {
	if (typeof o === 'string' && A.files[o]) keep.add('public/' + A.files[o].src);
	else if (o && typeof o === 'object') Object.values(o).forEach(walk);
})(course ? {} : JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'explainer', 'plan.json'), 'utf8')));
// course job: only this lesson's cut + voice + lesson.json, the logo, fonts and sfx
const only = course ? `^public/(course/${course}/(cut\.mp4|voice\.flac|lesson\.json)|course/logo\.jpg|assets/(fonts|sfx)/.*)$` : '';
const keepFile = path.join(tmp, 'keep.json');
fs.writeFileSync(keepFile, JSON.stringify([...keep]));
const py = `import tarfile,os,re,sys,json
skip=re.compile(sys.argv[2]); only=re.compile(sys.argv[4]) if sys.argv[4] else None; keep=set(json.load(open(sys.argv[3],encoding='utf-8')))
with tarfile.open(sys.argv[1],'w',format=tarfile.PAX_FORMAT,encoding='utf-8') as t:
  for d,_,fs in os.walk('public'):
    for f in fs:
      p=os.path.join(d,f).replace(os.sep,'/')
      if only and not only.search(p): continue
      if skip.search(p) or (p.startswith('public/explainer/assets/') and p not in keep): continue
      t.add(p)`;
run('python', ['-I', '-c', py, tar, SKIP.source, keepFile, only]);
console.log(`job ${(fs.statSync(tar).size / 1e6).toFixed(0)} MB`);

let ok = false;
try {
	gh(['release', 'create', tag, tar, '-R', REPO, '--title', tag, '--notes', 'temporary render job', '--prerelease']);
	const before = gh(['run', 'list', '-R', REPO, '--workflow', 'render.yml', '-L', '1', '--json', 'databaseId', '-q', '.[0].databaseId'], {capture: true, ok: true});
	gh(['workflow', 'run', 'render.yml', '-R', REPO, '-f', `job=${tag}`, '-f', `frames=${frames}`, '-f', `chunks=${chunks}`, '-f', `comp=${COMP}`, '-f', `props=${PROPS}`]);
	let id = before;
	for (let i = 0; i < 30 && id === before; i++) {
		await sleep(3000);
		id = gh(['run', 'list', '-R', REPO, '--workflow', 'render.yml', '-L', '1', '--json', 'databaseId', '-q', '.[0].databaseId'], {capture: true, ok: true});
	}
	console.log(`run https://github.com/${REPO}/actions/runs/${id}`);
	gh(['run', 'watch', id, '-R', REPO, '--exit-status', '-i', '30']);

	// 4) download
	let out;
	if (course) {
		out = path.resolve(ENGINE, arg('--out'));
		fs.mkdirSync(path.dirname(out), {recursive: true});
	} else {
		const {source} = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'explainer', 'timeline.json'), 'utf8'));
		const base = source.replace(/@\d+$/, '').replace(/\.[^.]+$/, '');
		fs.mkdirSync(OUTPUT_DIR, {recursive: true});
		out = path.join(OUTPUT_DIR, `${base} - مونتاج.mp4`);
		for (let i = 2; fs.existsSync(out); i++) out = path.join(OUTPUT_DIR, `${base} - مونتاج ${i}.mp4`);
	}
	gh(['release', 'download', tag, '-R', REPO, '-p', 'final.mp4', '-O', out, '--clobber']);
	console.log(`\nSaved: ${out}`);
	ok = true;
} finally {
	// 5) nothing stays on GitHub (the run's chunk artifacts expire by themselves after 1 day)
	gh(['release', 'delete', tag, '-R', REPO, '--cleanup-tag', '-y'], {ok: true});
	fs.rmSync(tmp, {recursive: true, force: true});
	if (!ok) process.exitCode = 1;
}
