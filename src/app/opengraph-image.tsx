import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "ClearRx — Drug Interaction Checker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          background: "#FAF8F3",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.2em",
              color: "#5B8A8A",
              fontWeight: 500,
            }}
          >
            CLEARRX
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 400,
              color: "#2C2825",
              textAlign: "center",
              maxWidth: "80%",
              lineHeight: 1.2,
            }}
          >
            Know Before You Swallow
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#9A9490",
              textAlign: "center",
              maxWidth: "70%",
              marginTop: "8px",
            }}
          >
            Drug interaction checker by a licensed pharmacist. Visual network
            diagram. 100% private.
          </div>
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "24px",
              fontSize: 16,
              color: "#5B8A8A",
            }}
          >
            <span>35+ Drugs</span>
            <span>·</span>
            <span>60+ Interactions</span>
            <span>·</span>
            <span>RPh Reviewed</span>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            fontSize: 14,
            color: "#9A9490",
          }}
        >
          clearrx.vibed-lab.com
        </div>
      </div>
    ),
    { ...size }
  );
}
