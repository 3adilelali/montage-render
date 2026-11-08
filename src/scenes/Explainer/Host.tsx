import { Img, staticFile } from "remotion";
import { colors } from "../../brand/colors";
import { HOST_SIZE } from "./layout";
import type { Assets, HostItem, Levels } from "./types";

// The channel logo pulsing with the voice, ringed by spectrum bars (refs: «SK» logo between visuals).
export const HostLeaf: React.FC<{ item: HostItem; frame: number; assets: Assets; levels: Levels | null }> = ({ item, frame, assets, levels }) => {
  const d = HOST_SIZE[item.size ?? "m"];
  const f = Math.max(0, Math.min((levels?.level.length ?? 1) - 1, frame));
  const level = levels?.level[f] ?? 0;
  const spec = levels?.spectrum[f] ?? [];
  const pulse = 1 + level * 0.09;
  const bars = 72;
  const R = d / 2 + 6;
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={d * 1.35} height={d * 1.35} style={{ position: "absolute" }} viewBox={`${-d * 0.675} ${-d * 0.675} ${d * 1.35} ${d * 1.35}`}>
        {Array.from({ length: bars }).map((_, i) => {
          // Bars mirror the spectrum around the ring; strongest on the upper right like the refs.
          const band = spec.length ? spec[Math.floor(((i < bars / 2 ? i : bars - 1 - i) / (bars / 2)) * spec.length) % spec.length] : 0;
          const bias = 0.35 + 0.65 * Math.max(0, Math.cos(((i / bars) * 2 * Math.PI) - Math.PI / 4));
          const len = 4 + band * d * 0.32 * bias * pulse;
          const a = (i / bars) * 2 * Math.PI - Math.PI / 2;
          return (
            <line
              key={i}
              x1={Math.cos(a) * R}
              y1={Math.sin(a) * R}
              x2={Math.cos(a) * (R + len)}
              y2={Math.sin(a) * (R + len)}
              stroke={colors.spectrum}
              strokeWidth={2.4}
              strokeLinecap="round"
              opacity={0.9}
            />
          );
        })}
      </svg>
      <div
        style={{
          width: d,
          height: d,
          borderRadius: "50%",
          overflow: "hidden",
          transform: `scale(${pulse})`,
          background: "#06121a",
          boxShadow: "0 18px 40px rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {assets.logo ? (
          <Img src={staticFile(assets.logo.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          // No logo yet: a red play mark as placeholder (ask the student for العناصر/شعاري.png).
          <div style={{ width: 0, height: 0, borderTop: `${d * 0.24}px solid transparent`, borderBottom: `${d * 0.24}px solid transparent`, borderLeft: `${d * 0.38}px solid ${colors.red}`, marginLeft: d * 0.08 }} />
        )}
      </div>
    </div>
  );
};
