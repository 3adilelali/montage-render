import "./index.css";
import "./brand/fonts";
import { Composition } from "remotion";
import { Explainer, calculateExplainerMetadata } from "./scenes/Explainer/Explainer";
import type { ExplainerProps } from "./scenes/Explainer/types";
import { FPS, HEIGHT, WIDTH } from "./brand/motion";
import {
  ContactSheet,
  calculateContactSheetMetadata,
  contactSheetDefaults,
} from "./study/ContactSheet";
import { Thumbnail, thumbnailDefaults } from "./thumbnail/Thumbnail";

const explainerDefaults: ExplainerProps = {
  timeline: null,
  captions: [],
  plan: { source: "", scenes: [] },
  assets: { files: {}, icons: [], logo: null, music: null, sfxUser: [] },
  levels: null,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* The montage: voice → explainer motion graphics, YouTube 16:9 (/montage) */}
      <Composition
        id="Explainer"
        component={Explainer}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={explainerDefaults}
        calculateMetadata={calculateExplainerMetadata}
      />
      {/* Study tool: contact sheets of a reference edit (/start → scripts/study.mjs) */}
      <Composition
        id="ContactSheet"
        component={ContactSheet}
        durationInFrames={1}
        fps={30}
        width={1000}
        height={1000}
        defaultProps={contactSheetDefaults}
        calculateMetadata={calculateContactSheetMetadata}
      />
      {/* YouTube thumbnail still, 1280×720 (scripts/thumbnail.mjs) */}
      <Composition
        id="Thumbnail"
        component={Thumbnail}
        durationInFrames={1}
        fps={30}
        width={1280}
        height={720}
        defaultProps={thumbnailDefaults}
      />
    </>
  );
};
