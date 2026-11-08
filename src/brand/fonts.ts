// Loads the fonts from public/assets/fonts/ (all SIL Open Font License).
// Rubik Black ≈ the heavy rounded Arabic face of the references; Barlow Semi Condensed ≈ their DIN-style digits.
import { continueRender, delayRender, staticFile } from "remotion";

export const FONT_FAMILY = "BrandArabic";
export const NUMBER_FONT_FAMILY = "BrandNumbers";

const faces = [
  { family: FONT_FAMILY, file: "Rubik-Variable.ttf", weight: "300 900" },
  { family: NUMBER_FONT_FAMILY, file: "BarlowSemiCondensed-Bold.ttf", weight: "700" },
  { family: NUMBER_FONT_FAMILY, file: "BarlowSemiCondensed-ExtraBold.ttf", weight: "800 900" },
];

const handle = delayRender("Loading brand fonts");

// Resolves once every face is ready, so text can be measured.
export const fontsLoaded: Promise<void> = Promise.all(
  faces.map(({ family, file, weight }) =>
    new FontFace(family, `url('${staticFile(`assets/fonts/${file}`)}')`, { weight })
      .load()
      .then((f) => {
        document.fonts.add(f);
      }),
  ),
)
  .then(() => undefined)
  .catch((err) => console.error("Font load failed", err))
  .finally(() => continueRender(handle));
