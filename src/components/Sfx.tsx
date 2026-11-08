import { Audio } from "@remotion/media";
import { SFX, type SfxName, sfxSrc } from "../brand/sfx";

export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number; userFiles: string[] }> = ({
  name,
  at,
  volume,
  userFiles,
}) => {
  const s: (typeof SFX)[SfxName] & { playbackRate?: number } = SFX[name];
  return (
    <Audio
      name={`sfx:${name}`}
      src={sfxSrc(name, userFiles)}
      from={Math.max(0, at + s.offset)}
      volume={volume ?? s.volume}
      playbackRate={s.playbackRate ?? 1}
    />
  );
};
