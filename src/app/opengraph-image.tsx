import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const alt = "Multivrs - Build Beyond Limits";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background:
            "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.3), transparent 45%), radial-gradient(circle at 85% 30%, rgba(56,189,248,0.28), transparent 48%), #030303",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 3, opacity: 0.7 }}>MULTIVRS</div>
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 18, lineHeight: 1.05 }}>
          Build Beyond
          <br />
          Limits
        </div>
        <div style={{ fontSize: 28, marginTop: 24, opacity: 0.8 }}>
          Cloud platform, developer tools, and AI products.
        </div>
      </div>
    ),
    size
  );
}
