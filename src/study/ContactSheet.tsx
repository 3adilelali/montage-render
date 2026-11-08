import { AbsoluteFill, type CalculateMetadataFunction, Img, staticFile } from "remotion";

// Grid of reference frames, each labelled with its time and source frame number.
// Rendered by scripts/study.mjs so Claude can study a reference edit frame by frame.

export type ContactSheetProps = {
  frames: { file: string; label: string }[];
  cols: number;
  tileW: number;
  tileH: number;
};

const GAP = 12;
const LABEL = 44;

export const contactSheetDefaults: ContactSheetProps = { frames: [], cols: 5, tileW: 432, tileH: 768 };

export const calculateContactSheetMetadata: CalculateMetadataFunction<ContactSheetProps> = ({ props }) => {
  const rows = Math.max(1, Math.ceil(props.frames.length / props.cols));
  return {
    width: props.cols * (props.tileW + GAP) + GAP,
    height: rows * (props.tileH + LABEL + GAP) + GAP,
  };
};

export const ContactSheet: React.FC<ContactSheetProps> = ({ frames, cols, tileW, tileH }) => (
  <AbsoluteFill style={{ backgroundColor: "#111", padding: GAP }}>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${tileW}px)`, gap: GAP }}>
      {frames.map((f) => (
        <div key={f.file}>
          <Img src={staticFile(f.file)} style={{ width: tileW, height: tileH, objectFit: "cover", display: "block" }} />
          <div
            style={{
              height: LABEL,
              color: "#FFE14D",
              fontFamily: "monospace",
              fontSize: 30,
              lineHeight: `${LABEL}px`,
            }}
          >
            {f.label}
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
