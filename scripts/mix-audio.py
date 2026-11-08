# Final audio track for long videos, mixed outside Remotion (2026-10-25).
# Remotion's inline audio mixing needs ~1 MB of temp disk per frame (a 33-minute video filled the disk),
# so long videos render the picture with --muted in chunks and this script mixes the sound the same way
# Explainer.tsx does: voice + music (looped, faded) + the scene / element sound effects (buildCues).
# Keep in sync with buildScenes / buildCues / defaultSfx in src/scenes/Explainer/Explainer.tsx and src/brand/sfx.ts.
# Usage: python scripts/mix-audio.py <out.wav>
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "public/explainer"
SR = 48000
FPS = 30
SCENE_LEAD = 3
VO_DUCK = 0.75

# src/brand/sfx.ts
SFX = {}
for m in re.finditer(r"(\w+): \{ file: \"([^\"]+)\", offset: (-?\d+), volume: ([\d.]+)", (ROOT / "src/brand/sfx.ts").read_text(encoding="utf8")):
    SFX[m.group(1)] = {"file": m.group(2), "offset": int(m.group(3)), "volume": float(m.group(4))}

captions = json.loads((DATA / "captions.json").read_text(encoding="utf8"))
plan = json.loads((DATA / "plan.json").read_text(encoding="utf8"))
timeline = json.loads((DATA / "timeline.json").read_text(encoding="utf8"))
total = int(np.ceil(timeline["durationMs"] / 1000 * FPS))


def word_at(i):
    i = max(0, min(i, len(captions) - 1))
    return round(captions[i]["startMs"] / 1000 * FPS)


sc = plan["scenes"]
starts = [0 if i == 0 else max(0, word_at(s["from"]) - SCENE_LEAD) for i, s in enumerate(sc)]
scenes = [{**s, "index": i, "start": starts[i], "enter": "cut" if i == 0 else s.get("transition", "whip")} for i, s in enumerate(sc)]


def leaves(items):
    out = []
    for it in items:
        if it["type"] in ("group", "tree"):
            out += leaves(it["items"])
        else:
            out.append(it)
    return out


def default_sfx(it):
    t = it["type"]
    if t == "text":
        return None if it.get("enter") == "none" else "swish"
    if t == "visual":
        return None if it.get("look") == "full" else ("bloop" if it.get("file") else "pop")
    return {
        "number": "impact", "badge": "impact", "counter": "tick", "card": "bloop", "ribbon": "pop", "ring": "swish",
        "scribble": "swish", "search": "typing", "steps": "tick", "mc-search": "typing", "mc-typing": "typing",
        "mc-form": "typing", "mc-code": "typing", "mc-post": "bloop", "mc-levels": "bloop", "mc-doc": "bloop",
        "mc-rhythm": "bloop", "mc-frames": "bloop", "mc-flow": "bloop", "mc-chart": "bloop", "mc-week": "bloop",
        "mc-grid": "bloop", "meter": "riser", "bars": "riser", "carousel": "bloop", "mc-chat": "bloop",
        "title-3d": "whooshBig", "mc-price": "impact",
    }.get(t)


cues = []
for s in scenes:
    at = lambda w: max(s["start"], word_at(w) - 2)  # noqa: E731
    if s["index"] > 0:
        e = s["enter"]
        name = "glitch" if e == "glitch" else "whoosh" if e == "trail" else "whooshBig" if e in ("zoom", "flash") else None if e in ("cut", "fade") else "whip"
        if name:
            cues.append((name, s["start"], 3))
    prev = scenes[s["index"] - 1] if s["index"] > 0 else None
    h = s.get("header")
    if h and (not prev or (prev.get("header") or {}).get("title") != h["title"]):
        cues.append(("whoosh", s["start"] + 2, 4))
    if h and h.get("sub") and (not prev or (prev.get("header") or {}).get("sub") != h["sub"]):
        cues.append(("impact", at(h.get("subAt", s["from"])), 4))
    for it in leaves(s["items"]):
        name = None if it.get("sfx") == "none" else it.get("sfx") or default_sfx(it)
        if name:
            cues.append((name, at(it["word"]), 4 if it.get("sfx") else 2))
        if it["type"] == "counter":
            cues.append(("ding", at(it["word"]) + it.get("frames", 24), 1))
        if it["type"] == "text" and "toneAt" in it and it.get("toneTo") == "green":
            cues.append(("sparkle", at(it["toneAt"]), 3))
        if it["type"] == "steps":
            for d in it.get("done", []):
                cues.append(("sparkle", at(d["word"]), 3))
        if it["type"] == "visual" and "tintAt" in it and it.get("tint") in ("red", "green"):
            cues.append(("wrong" if it["tint"] == "red" else "sparkle", at(it["tintAt"]), 3))
        if it["type"] == "subscribe":
            cues.append(("click", at(it["clickAt"]) if "clickAt" in it else at(it["word"]) + 24, 4))

cues = sorted(((n, max(0, a), p) for n, a, p in cues), key=lambda c: (c[1], -c[2]))
kept = []
for c in cues:
    if kept and c[1] - kept[-1][1] < 3:
        if c[2] > kept[-1][2]:
            kept[-1] = c
        continue
    kept.append(c)


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2)


n = int(total / FPS * SR)
mix = np.zeros((n, 2), np.float32)
voice = load(DATA / timeline["audio"])[:n]
mix[: len(voice)] += voice

music_file = next(iter(sorted(DATA.glob("music.*"))), None)
if music_file:
    m = load(music_file)
    reps = int(np.ceil(n / len(m)))
    m = np.tile(m, (reps, 1))[:n]
    f = np.arange(n) / SR * FPS
    env = np.interp(f, [0, 30, total - 45, total], [0, 1, 1, 0])
    mix += m * (plan.get("music", {}).get("volume", 0.09) * env)[:, None]

cache = {}
for name, at, _ in kept:
    d = SFX[name]
    if name not in cache:
        cache[name] = load(ROOT / "public/assets/sfx" / f"{d['file']}.wav")
    clip = cache[name] * d["volume"] * VO_DUCK
    a = int(max(0, at + d["offset"]) / FPS * SR)
    b = min(n, a + len(clip))
    if a < n:
        mix[a:b] += clip[: b - a]

np.clip(mix, -1, 1, out=mix)
out = Path(sys.argv[1])
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s16le", str(out)], input=mix.tobytes(), check=True)
print(f"{len(kept)} sound effects, {n / SR:.1f}s → {out}")
