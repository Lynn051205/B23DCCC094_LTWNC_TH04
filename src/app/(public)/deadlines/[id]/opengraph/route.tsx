import { ImageResponse } from "next/og";
import { getDeadlineById } from "@/lib/data";
import { formatDueDate } from "@/lib/format";

interface OpenGraphImageProps {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: OpenGraphImageProps,
): Promise<Response> {
  const { id } = await params;
  const deadline = await getDeadlineById(id);

  if (!deadline) {
    return new Response("Không tìm thấy deadline.", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #172554 0%, #3659d9 58%, #8bb6ff 100%)",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          gap: 32,
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 84px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#dbeafe",
            display: "flex",
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: 3,
          }}
        >
          CLASS DEADLINE HUB · {deadline.subject.name.toLocaleUpperCase("vi")}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 56,
            fontWeight: 700,
            gap: 24,
            lineHeight: 1.15,
            maxHeight: 300,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex" }}>{deadline.title}</div>
          <div
            style={{
              color: "#dbeafe",
              display: "flex",
              fontSize: 32,
              fontWeight: 500,
            }}
          >
            Hạn nộp: {formatDueDate(deadline.dueAt)}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
