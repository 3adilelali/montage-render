# مكتبة المؤثرات الصوتية

> أي صوت يُستخدم ومتى: `الأسلوب/أسلوب-المونتاج.md` §8. الربط التلقائي بالعناصر في `defaultSfx` و`buildCues` داخل `src/scenes/Explainer/Explainer.tsx`.

## 1. كيف يعمل

| الملف | الدور |
|---|---|
| `public/assets/sfx/*.wav` | الأصوات المحلية (الرندر يعمل دون إنترنت) |
| `src/brand/sfx.ts` | قاموس **الأحداث**: اسم الحدث ← ملف + تقديم (`offset`) + مستوى (`volume`) |
| `src/components/Sfx.tsx` | يشغّل حدثاً عند فريم، ويفضّل ملف الطالب إن وُجد |
| `المؤثرات/` (عند الطالب) | ملف بنفس اسم ملف المحرك (مثل `pop.wav` أو `whoosh.mp3`) يحل محله تلقائياً |
| `scripts/make-sfx.mjs` | يولّد المؤثرات الأساسية (تحتاج ffmpeg كامل على النظام) |
| `scripts/add-sfx.mjs` | يحمّل من مكتبة Remotion: `node scripts/add-sfx.mjs shutter-old` |

## 2. الأحداث (`SFX` في `sfx.ts`)

| الحدث | الملف | المصدر | offset | volume | الاستخدام الافتراضي |
|---|---|---|---|---|---|
| `whip` | whoosh-simple | الطالب | ‎-3f | 0.55 | انتقال `whip` |
| `whoosh` | whoosh-end | الطالب | ‎-13f | 0.3 | انتقال `trail` |
| `whooshBig` | whoosh-sub | الطالب | ‎-28f | 0.32 | انتقال `zoom` / `flash` |
| `swish` | swish | مولّد | ‎-1f | 0.22 | نص، دائرة، خربشة، `trail` |
| `pop` | pop | مولّد | 0 | 0.45 | أيقونة، شريط |
| `bloop` | bloop | مولّد | 0 | 0.35 | صورة، بطاقة |
| `impact` | impact | مولّد | 0 | 0.5 | رقم، شارة، `flash` |
| `riser` | riser | مولّد | ‎-20f | 0.3 | قبل كشف كبير (يدوي) |
| `sparkle` | sparkle | مولّد | 0 | 0.35 | تحوّل للأخضر، إنجاز خطوة |
| `glitch` | glitch | مولّد | 0 | 0.4 | انتقال `glitch` |
| `tick` | tick | مولّد | 0 | 0.3 | عدّاد، خطوات |
| `click` | click | مولّد | 0 | 0.55 | زر الاشتراك |
| `typing` | typing | مولّد | 0 | 0.4 | شريط البحث |
| `cash` | cash | مولّد | 0 | 0.45 | فلوس (يدوي) |
| `wrong` | wrong | مولّد | 0 | 0.35 | تحوّل للأحمر |
| `ding` | ding | Remotion | 0 | 0.3 | نهاية العدّاد |
| `boom` | vine-boom | Remotion | 0 | 0.4 | صدمة (يدوي) |
| `shutter` | shutter-modern | Remotion | 0 | 0.4 | لقطة شاشة (يدوي) |
| `notify` | snapchat-notification | Remotion | 0 | 0.35 | إشعار (يدوي) |
| `page` | page-turn | Remotion | 0 | 0.4 | مستند (يدوي) |
| `scratch` | record-scratch | Remotion | 0 | 0.45 | «انتظر!» (يدوي) |

«يدوي» = يُضاف بحقل `"sfx": "<الاسم>"` في العنصر.

## 3. قواعد الميكساج
- كل المؤثرات × 0.75 تحت الصوت (`VO_DUCK`).
- لا مؤثرين في أقل من 3f، وعند التعارض يبقى الأهم (المحدد يدوياً، ثم الانتقالات، ثم الظهور).
- الموسيقى من `الموسيقى/` بمستوى 0.09 (أو `plan.music.volume`)، مع ظهور 1s واختفاء 1.5s.
