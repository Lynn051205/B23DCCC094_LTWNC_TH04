import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/auth";
import { getProgressForUser } from "@/lib/data";

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Bạn cần đăng nhập để xem tiến độ cá nhân." },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const progress = await getProgressForUser(session.user.id);
  const completedDeadlineIds = progress
    .filter((entry) => entry.completed)
    .map((entry) => entry.deadlineId);

  return NextResponse.json(
    { completedDeadlineIds },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
