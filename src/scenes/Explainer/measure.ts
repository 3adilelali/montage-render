// Text width with the real font (canvas). Called after fontsLoaded (see useFontsReady in Explainer.tsx).
let ctx: CanvasRenderingContext2D | null = null;

export const measureText = (text: string, fontSize: number, fontFamily: string, fontWeight: number | string = 900) => {
  if (typeof document === "undefined") return text.length * fontSize * 0.55;
  if (!ctx) ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return text.length * fontSize * 0.55;
  ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}"`;
  ctx.direction = "rtl";
  return ctx.measureText(text).width;
};
