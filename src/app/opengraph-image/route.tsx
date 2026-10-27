import { ImageResponse } from "next/og";

export async function GET(): Promise<ImageResponse> {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "linear-gradient(135deg, #172554 0%, #3659d9 55%, #8bb6ff 100%)",
          color: "#ffffff",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "80px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              color: "#dbeafe",
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 4,
            }}
          >
            CLASS DEADLINE HUB
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            <span>Theo dõi deadline,</span>
            <span>chủ động học tập.</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
