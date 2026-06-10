import { ImageResponse } from "next/og";
import { BRAND_COLORS } from "@/lib/site";

export const alt = "MERIDIAN — Modern essentials, refined.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BRAND_COLORS.bone,
          color: BRAND_COLORS.ink,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 88,
            height: 88,
            borderRadius: "50%",
            border: `3px solid ${BRAND_COLORS.ink}`,
            fontSize: 44,
            marginBottom: 48,
          }}
        >
          M
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 600,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            // Visually re-center: tracking adds trailing space after the last glyph.
            paddingLeft: "0.34em",
          }}
        >
          Meridian
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            letterSpacing: "0.04em",
            color: BRAND_COLORS.clay,
          }}
        >
          Modern essentials, refined.
        </div>
      </div>
    ),
    size
  );
}
