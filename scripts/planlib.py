# Helpers for writing public/explainer/plan.json by phrase instead of raw word indices.
#   from planlib import Plan
#   p = Plan()                       # loads captions.json
#   w = p.at("بتعمل مجلد")           # index of the first word of the phrase (searched forward from the cursor)
#   p.scene("كل اللي عم تشوفه", items=[...], transition="whip")   # scene starts at that phrase, cursor moves there
#   p.save()
import json
import re
import difflib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CAPS = ROOT / "public/explainer/captions.json"
PLAN = ROOT / "public/explainer/plan.json"

def norm(t):
    t = re.sub(r"[ً-ْـ]", "", t)  # harakat + tatweel
    t = re.sub(r"[أإآ]", "ا", t).replace("ة", "ه").replace("ى", "ي").replace("ؤ", "و").replace("ئ", "ي")
    t = re.sub(r"[^\w%]", "", t.lower())
    return t

def sim(a, b):
    if not a or not b:
        return 0
    if a == b:
        return 1
    return difflib.SequenceMatcher(None, a, b).ratio()

class Plan:
    def __init__(self):
        self.words = json.loads(CAPS.read_text(encoding="utf8"))
        self.toks = [norm(w["text"]) for w in self.words]
        self.cursor = 0
        self.plan = json.loads(PLAN.read_text(encoding="utf8"))
        self.scenes = []

    def find(self, phrase, start=None, window=260):
        """Best fuzzy match of phrase tokens, searched forward from start (default: cursor)."""
        p = [norm(x) for x in phrase.split() if norm(x)]
        s0 = self.cursor if start is None else start
        best, best_i = -1, None
        for i in range(s0, min(len(self.toks), s0 + window)):
            score = 0
            for k, tok in enumerate(p):
                if i + k >= len(self.toks):
                    break
                score += sim(tok, self.toks[i + k])
            score /= len(p)
            # Prefer the earliest strong match.
            if score > best + 0.08:
                best, best_i = score, i
            if best >= 0.92:
                break
        if best_i is None or best < 0.55:
            raise ValueError(f"phrase not found after {s0}: {phrase!r} (best {best:.2f})")
        return best_i

    def at(self, phrase, offset=0):
        """Word index of `phrase` (+offset words), searched from the current scene start."""
        return self.find(phrase) + offset

    def t(self, i):
        return self.words[i]["startMs"] / 1000

    def go(self, phrase):
        """Start a new scene at `phrase`; following at() calls search from here."""
        self.cursor = self.find(phrase)
        self.pending = self.cursor
        return self.cursor

    def add(self, items, **kw):
        sc = {"from": self.pending, **kw, "items": items}
        self.scenes.append(sc)
        return sc

    def save(self, music_volume=0.07):
        # Sanity: every item word must be inside its scene.
        problems = []
        for n, s in enumerate(self.scenes):
            nxt = self.scenes[n + 1]["from"] if n + 1 < len(self.scenes) else len(self.words)
            def walk(it):
                if "items" in it:
                    for x in it["items"]:
                        walk(x)
                for k in ("word", "toneAt", "tintAt", "cornerAt", "out", "clickAt", "end"):
                    if k in it and not (s["from"] <= it[k] < nxt):
                        problems.append(f"scene {n} ({self.words[s['from']]['text'].strip()}): {k}={it[k]} outside [{s['from']},{nxt})")
            for it in s["items"]:
                walk(it)
            if nxt <= s["from"]:
                problems.append(f"scene {n} starts at/after next scene")
        # Every element needs time to be read: if it would appear < MIN_VIS s before its scene ends,
        # anchor it to an earlier word (never before the scene start).
        MIN_VIS = 1.2  # only for things that must be read
        moved = 0
        for n, s in enumerate(self.scenes):
            nxt = self.scenes[n + 1]["from"] if n + 1 < len(self.scenes) else len(self.words) - 1
            end_t = self.t(nxt) if n + 1 < len(self.scenes) else self.words[-1]["endMs"] / 1000 + 1
            def fix(it):
                nonlocal moved
                if "items" in it and it.get("type") != "tree":
                    for x in it["items"]:
                        fix(x)
                    return
                if it.get("type") == "tree":
                    for x in it["items"]:
                        fix(x)
                if it.get("type") in ("text", "card", "counter", "search", "ribbon", "badge") and "word" in it and end_t - self.t(it["word"]) < MIN_VIS:
                    w = it["word"]
                    while w > s["from"] and end_t - self.t(w) < MIN_VIS:
                        w -= 1
                    if w != it["word"]:
                        it["word"] = w
                        moved += 1
                    for k in ("toneAt", "tintAt", "cornerAt"):
                        if k in it and it[k] < w:
                            it[k] = w
            for it in s["items"]:
                fix(it)
        if moved:
            print(f"moved {moved} late elements earlier")
        self.plan["scenes"] = self.scenes
        self.plan["music"] = {"volume": music_volume}
        PLAN.write_text(json.dumps(self.plan, ensure_ascii=False, indent=1), encoding="utf8")
        durs = [self.t(self.scenes[n + 1]["from"]) - self.t(s["from"]) for n, s in enumerate(self.scenes[:-1])]
        print(f"{len(self.scenes)} scenes, avg {sum(durs)/max(1,len(durs)):.2f}s, longest {max(durs):.1f}s")
        for p in problems:
            print("PROBLEM:", p)
        long = [(self.words[s['from']]['text'].strip(), round(d, 1)) for s, d in zip(self.scenes, durs) if d > 5]
        if long:
            print("scenes > 5s:", long)
