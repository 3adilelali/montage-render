# Screen-recording parts of a recording (laptop screen, not black) → where the camera should look.
# Finds the non-black stretches, then follows what moves (cursor, new text) with a smooth vertical pan
# over the chat column, zoomed so the small screen text is readable (الأسلوب §14.4: never a full laptop screen).
# Usage: python scripts/screen-focus.py <video> [--zoom 2.1] [--cx 0.5625]
# Output: public/explainer/screens.json  {"zoom", "cx", "parts": [{"fromS", "toS", "keys": [{"t", "cy"}]}]}
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
args = sys.argv[1:]


def flag(name, default):
    if f"--{name}" in args:
        i = args.index(f"--{name}")
        v = args[i + 1]
        del args[i : i + 2]
        return float(v)
    return default


ZOOM = flag("zoom", 2.1)
CX = flag("cx", 0.5625)
video = args[0]
W, H, FPS = 320, 180, 4

raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", video, "-vf", f"fps={FPS},scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
    capture_output=True, check=True,
).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.int16)
n = len(frames)

# 1. Screen vs black: mean brightness.
bright = frames.reshape(n, -1).mean(1) > 40
parts = []
i = 0
while i < n:
    if bright[i]:
        j = i
        while j < n and bright[j]:
            j += 1
        if (j - i) / FPS > 3:
            parts.append((i, j))
        i = j
    else:
        i += 1

# 2. Follow the action inside each part (ignore the window bar, the taskbar and the left sidebar).
y0, y1, x0 = int(H * 0.05), int(H * 0.93), int(W * 0.12)
half = 0.5 / ZOOM
out = []
for a, b in parts:
    target = 0.5
    cy = 0.5
    keys = []
    for k in range(a + 1, b):
        d = np.abs(frames[k] - frames[k - 1])[y0:y1, x0:] > 28
        cnt = d.sum()
        if cnt > d.size * 0.12:
            pass  # scroll / page change: keep looking where we were
        elif cnt > 6:
            ys = np.nonzero(d)[0]
            target = (y0 + np.median(ys)) / H
        # Ease toward the target, with a dead zone so small moves don't shake the camera.
        if abs(target - cy) > 0.06:
            cy += (target - cy) * 0.18
        cy = min(max(cy, half), 1 - half)
        if (k - a) % 2 == 0:
            keys.append({"t": round(k / FPS, 2), "cy": round(cy, 3)})
    out.append({"fromS": round(a / FPS, 2), "toS": round(b / FPS, 2), "keys": keys})

dst = ROOT / "public/explainer/screens.json"
dst.write_text(json.dumps({"zoom": ZOOM, "cx": CX, "parts": out}, ensure_ascii=False), encoding="utf8")
for p in out:
    print(f"screen {p['fromS']:.1f}s → {p['toS']:.1f}s ({len(p['keys'])} keys)")
print(f"→ {dst}")
