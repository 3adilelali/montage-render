# خريطة المحرك (لـ Claude)

> مشروع [Remotion](https://www.remotion.dev). تركيبة واحدة: `Explainer` بمقاس **1920×1080** و30fps. الأسلوب في `الأسلوب/أسلوب-المونتاج.md`.
> كل الأوامر من داخل `المحرك/`. للمعرفة العامة بـ Remotion حمّل المهارة `remotion-best-practices` (مشتركة في جذر النظام الكامل: `../.claude/skills/remotion-best-practices/`). مكتبات npm مثبّتة مرة واحدة في جذر النظام الكامل (`node_modules/` هناك)، لا داخل `المحرك/`.

## 1. المسار

```
المدخلات/ ─► prepare.mjs ─► cut-words.mjs (الإعادات) ─► public/explainer/ (voice.wav + captions + levels + timeline)
                                   │
           Claude يكتب plan.json ◄─┘   (حسب §11 من الأسلوب)
العناصر/ + الموسيقى/ + المؤثرات/ + أيقونات الخطة ─► sync-assets.mjs ─► public/explainer/{assets,icons}, assets.json
                                   │
                         render.mjs (يشغّل sync أولاً) ─► المخرجات/
```

## 2. الملفات

| المسار | الوظيفة |
|---|---|
| `scripts/setup.mjs` | فحص الجهاز وتثبيت الناقص (npm، auto-editor، yt-dlp) |
| `scripts/source.mjs` | فيديو مصدر (رابط) ← `الأفكار/<اسم>/`: `المصدر.md` + `النص-الأصلي.txt` (ترجمة صاحب الفيديو، أو ترجمة يوتيوب التلقائية الأصلية، أو Whisper بـ `--whisper`). `--out` لمجلد آخر |
| `scripts/audio.mjs` | مشترك: `polishVoice` (highpass + afftdn + compressor + loudnorm -14 LUFS بـ ffmpeg النظام)، و`writeLevels`، و`durationMsOf` |
| `scripts/cut-words.mjs` | حذف الإعادات والأخطاء بأرقام الكلمات من `public/explainer/cuts.json`: يقص الصوت بنعومة، ويزيح `captions.json`، ويعيد `levels.json` و`timeline.json`. يبدأ دائماً من `*.before-cuts.*` |
| `scripts/prepare.mjs` | صوت المدخل ← تنظيف الصوت ← قص الوقفات (auto-editor: `--min-cut 0.6s --margin 0.15s`، أو `--no-cut`) ← `levels.json` (مستوى الصوت + 16 نطاق طيف لكل إطار) ← Whisper ← `captions.json`. يصفّر `plan.json` إذا تغيّر المصدر |
| `scripts/sync-assets.mjs` | ينسخ `العناصر/` بأسماء ASCII، والموسيقى، ومؤثرات الطالب، ويولّد SVG لكل أيقونة في الخطة من حزم Iconify المحلية. يطبع `MISSING` و`UNKNOWN icons` |
| `scripts/screen-focus.py` | الفيديو ← `public/explainer/screens.json`: أجزاء الشاشة غير السودا، ووين الكاميرا لازم تطلّع (بيلحق الماوس والنص اللي عم ينكتب) |
| `scripts/icons.mjs` | بحث عن أسماء الأيقونات: `node scripts/icons.mjs money rocket` |
| `scripts/render.mjs` | `--still f1 f2 …` ← `المخرجات/.فحص/frame-<f>.png`، أو الفيديو الكامل ← `المخرجات/<اسم> - مونتاج.mp4` |
| `scripts/make-sfx.mjs` | يولّد مؤثرات الأسلوب (pop، whoosh، swish، riser، impact، sparkle، glitch، tick، click، cash، bloop، wrong، typing) بـ ffmpeg النظام |
| `scripts/add-sfx.mjs` | تحميل مؤثرات من مكتبة Remotion (`vine-boom`، `ding`…) |
| `scripts/study.mjs` + `src/study/ContactSheet.tsx` | دراسة المراجع (أوراق اتصال + قطعات + قفزات صوت + تفريغ) |
| `scripts/transcribe.mjs` | Whisper medium محلي (`~/.montage-whisper`) |
| `src/brand/` | `colors.ts` (ألوان العلامة فقط: `green`=برتقالي، و`red`=ماجنتا، و`blue`=بنفسجي)، و`fonts.ts` (Rubik للعربي، وBarlow Semi Condensed للأرقام)، و`motion.ts`، و`sfx.ts` |
| `src/scenes/Explainer/` | المشهد كاملاً (أدناه) |

## 3. `src/scenes/Explainer/`

| الملف | الدور |
|---|---|
| `types.ts` | عقد `plan.json` و`assets.json` و`levels.json` |
| `Explainer.tsx` | التحميل، وتوقيت المشاهد (`buildScenes`)، والانتقالات (`SceneView`، `Trail`، `Flash`)، والخلفية، والصوت (`buildCues` + الموسيقى) |
| `layout.ts` | التخطيط التلقائي: `group` (row/stack) و`tree`. وزن كل عنصر في التخطيط يكبر بـ spring عند ظهوره، فتنزاح العناصر القديمة بنعومة. الأحجام في `TEXT_SIZE`، `VISUAL_SIZE`… |
| `anim.ts` | الدخول (`pop`، `chars`، `words`، `slide`، `drop`، `rise`، `spin`، `flip`، `none`)، والنمو البطيء، والخروج عند `out` |
| `TextLeaf.tsx` | النص (حروف عشوائية، كلمة بكلمة، تحوّل اللون) |
| `VisualLeaf.tsx` | أيقونة / صورة / فيديو (`look`: `sticker`، `card`، `screen`، `circle`، `plain`، `full`)، و`tint`، و`highlights`، و`corner` |
| `Graphics.tsx` | `number`، `counter`، `steps`، `card`، `badge`، `ribbon`، `ring`، `search`، `scribble`، `subscribe`، و`Rays` |
| `Host.tsx` | الشعار النابض مع الصوت وأعمدة الطيف |
| `Screen.tsx` | أجزاء تسجيل الشاشة (شاشة اللابتوب) من `screens.json`: الفيديو الأصلي متزامن مع الصوت ببطاقة بإطار العلامة، مع زوم بيلحق الحركة. بيشتغل بس إذا `plan.screens: true` |
| `thumbnail/Thumbnail.tsx` | الصورة المصغّرة 1280×720 (composition `Thumbnail`): البطل من `public/thumbnail/` (جيميناي مقصوص بـ rembg)، والكلام يمين: `brand` و`word` و`pill`، و`theme: "light"` لنسخة فاتحة (2026-11-03)، و`wordSize` و`heroHeight`. التصدير: `node scripts/thumbnail.mjs "<الاسم>" [props.json]`، ويطلع بـ `المخرجات/<الاسم> - صورة مصغرة.png` |
| `Skool.tsx` | عناصر يوتيوب سكول (§16 من الأسلوب): `bar3d`، `banner`، `disc`، `xstamp`، `arrow`، `multiply`، `checklist`، `fly3d`، `mc-claude`، `mc-folder`، `mc-player`، و`Burst`. أحجامها بـ `skoolSize.ts`. انتقالات `push`/`through`/`black` بـ `Explainer.tsx`، و`plan.transition` افتراضي لكل المشاهد |
| `Chapters.tsx` | شريط الخطوات (§17 من الأسلوب): عنوان كبير على كامل الشاشة قبل كل خطوة، وبعدين كبسولات مثبّتة فوق (الحالية برتقالي، والخالصة رمادي). `plan.chapters` |
| `Board.tsx` | وضع الشرح: عنوان القسم المثبّت فوق (`scene.header`) وسلّم المستويات بالزاوية (`plan.ladder`)، §15 من الأسلوب |

## 4. عقد `plan.json`

```jsonc
{
  "source": "لا تغيّرها",
  "music": { "volume": 0.09 },            // اختياري
  "chapters": { "items": [{ "label": "اختيار المجال", "short": "المجال", "word": 66 }], "endWord": 426, "hide": [{ "from": 249, "to": 270 }] }, // اختياري: شريط الخطوات (Chapters.tsx)، والوقفة قبل كل خطوة من insert-pauses
  "scenes": [{
    "from": 12,                            // رقم الكلمة التي يبدأ عندها المشهد
    "transition": "whip",                  // whip | zoom | glitch | trail | flash | cut | fade
    "header": { "title": "…", "sub": "…", "subAt": 40 }, // اختياري: وضع الشرح (Board.tsx)
    "layout": "stack",                     // stack (عمودي) | row (أفقي، الأول يميناً)
    "gap": 46,                             // اختياري
    "bg": "rays",                          // اختياري: أشعة خلف المشهد
    "items": [ /* عناصر أو مجموعات */ ]
  }]
}
```

**حقول مشتركة لكل عنصر:** `word` (يظهر عند نطقها)، و`out` (يختفي ويُغلق مكانه)، و`enter`، و`size` (`s`/`m`/`l`/`xl`)، و`sfx` (اسم من `sfx.ts` أو `"none"`)، و`dx`/`dy`/`tilt`.

| `type` | الحقول الخاصة |
|---|---|
| `text` | `text` (`\n` سطر)، `tone` (`white`/`green`/`red`/`yellow`/`blue`)، `toneAt` + `toneTo` |
| `visual` | `icon` (`set:name`) أو `file` (اسم في العناصر) + `fallback`، و`look` (منها `phone` للقطات الجوال)، و`tint` (`red`/`green`/`gray`) + `tintAt`، و`highlights` [{`x`,`y`,`w`,`h` بالنسبة %، `tone`، `word`}]، و`corner` («?» أو أيقونة) + `cornerAt` |
| `number` | `text`، `tone` (`red`/`green`/`white`) |
| `counter` | `to`، `from`، `frames`، `prefix`، `suffix`، `tone`، `rays` |
| `steps` | `labels`، `style` (`plain`/`chips`)، `done` [{`word`, `upto`}] |
| `card` | `text` |
| `badge` | `text` و/أو `icon`، `shape` (`octagon`/`pentagon`/`diamond`) |
| `ribbon` | `text` |
| `ring` | `text` |
| `search` | `text`، `end` (كلمة انتهاء الكتابة) |
| `scribble` | `tone` (`red`/`white`) |
| `subscribe` | `clickAt` |
| `host` | — (الشعار من `العناصر/شعاري.*`) |
| `meter` | `value`، `steps` [{`word`,`value`}]، `label`، `tone`، `marks` [{`at` %، `text`، `tone`، `word`}] (`Extras.tsx`) |
| `bars` | `bars` [{`label`، `value`، `text`، `tone`، `icon`، `word`}] (`Extras.tsx`) |
| `carousel` | `slides` [{`text`/`icon`/`file`}]، `at` [كلمة لكل قلبة]، أو `every` إطارات (`Extras.tsx`) |
| `mc-search` / `mc-flow` / `mc-chart` / `mc-week` / `mc-form` / `mc-typing` / `mc-grid` | بطاقات الموشن الشارحة (`MotionCards.tsx`)، الحقول في `الأسلوب/أسلوب-المونتاج.md` §14.2 |
| `shot` | شاشة حقيقية بزووم ودوائر برتقالية (`Shot.tsx`): `file`، `zoom`، `marks`، `label`، الحقول في §14.4 من الأسلوب. `plan.sfxVolume` بيضرب كل المؤثرات |
| `mc-chat` / `title-3d` / `mc-price` | بطاقات فيديو صفحة الدورة (`MotionCards3.tsx`)، الحقول في §14.7 من الأسلوب. أيقونات `mc-chat` بحقل `nodes` حتى يجيبها `sync-assets` |
| `group` | `dir` (`row`/`stack`)، `gap`، `items` |
| `tree` | `word`، `items` (الأول الجذر، والباقي فروع) |

**قواعد المحرك:** المشهد يبدأ قبل كلمته بـ 3f، والعنصر يظهر قبل كلمته بـ 2f. العنصر الذي كلمته بعد بداية المشهد التالي لا يظهر. الخلفية والإطار 1920×1080 والمركز (960، 540).

## 5. إضافة عنصر جديد
1. نوعه في `types.ts` (ضمن `Leaf`).
2. حجمه في `leafSize` (`layout.ts`).
3. رسمه في `Graphics.tsx` (أو ملف جديد) وربطه في `renderLeaf` (`Explainer.tsx`).
4. صوته الافتراضي في `defaultSfx` (`Explainer.tsx`).
5. توثيقه في §6 و§12 من الأسلوب وفي هذا الملف.
6. `npx tsc --noEmit` ثم `node scripts/render.mjs --still …`.
