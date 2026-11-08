# Accurate word-level transcription with faster-whisper (large-v3-turbo, int8, VAD) — fewer hallucinations than whisper.cpp.
# Usage: python scripts/transcribe-fw.py <audio> <out.json> [lang=ar] [--prompt-file script.md]
# Output: Caption[] like @remotion/captions: [{text, startMs, endMs, timestampMs, confidence}], one entry per word (text has a leading space).
import json
import subprocess
import numpy as np
import sys
from pathlib import Path
from faster_whisper import WhisperModel

args = [a for a in sys.argv[1:] if not a.startswith("--")]
audio, out = args[0], args[1]
lang = args[2] if len(args) > 2 else "ar"
prompt = None
if "--prompt-file" in sys.argv:
    p = Path(sys.argv[sys.argv.index("--prompt-file") + 1]).read_text(encoding="utf8")
    # The script's vocabulary steers spelling (Claude, Remotion, منتج…). Keep it short: Whisper uses the last ~220 tokens.
    prompt = " ".join(p.split())[:600]

model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8", download_root=str(Path.home() / ".montage-whisper" / "fw"))
# Decode with ffmpeg ourselves (faster-whisper's PyAV decoder breaks with some av versions).
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", audio, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
samples = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
segments, info = model.transcribe(
    samples,
    language=lang,
    word_timestamps=True,
    vad_filter=True,
    vad_parameters={"min_silence_duration_ms": 200},
    condition_on_previous_text=False,
    initial_prompt=prompt,
    beam_size=5,
)
words = []
for seg in segments:
    for w in seg.words or []:
        t = w.word.strip()
        if not t:
            continue
        words.append({
            "text": " " + t,
            "startMs": round(w.start * 1000),
            "endMs": round(w.end * 1000),
            "timestampMs": round((w.start + w.end) * 500),
            "confidence": round(w.probability, 3),
        })
    print(f"\r{seg.end:7.1f}s / {info.duration:.1f}s", end="", flush=True)
print()
Path(out).write_text(json.dumps(words, ensure_ascii=False, indent=1), encoding="utf8")
print(f"Saved {len(words)} words to {out}")
