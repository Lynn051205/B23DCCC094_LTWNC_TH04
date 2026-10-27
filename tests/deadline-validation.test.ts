import { deadlineInputSchema } from "@/lib/deadline-validation";

const validDeadline = {
  subjectId: "web-development",
  title: "Bài tập thiết kế website",
  description: "Hoàn thiện giao diện và tài liệu dự án.",
  dueAt: "2030-10-25T23:59",
  submissionType: "Nộp trực tuyến",
  instructions: "Đính kèm mã nguồn và báo cáo.",
};

describe("deadline input validation", () => {
  it("accepts a complete deadline with a valid local date and time", () => {
    expect(deadlineInputSchema.safeParse(validDeadline).success).toBe(true);
  });

  it.each(["2030-02-29T10:00", "2030-10-25", "2030-13-01T10:00"])(
    "rejects an invalid due date %s",
    (dueAt) => {
      expect(
        deadlineInputSchema.safeParse({ ...validDeadline, dueAt }).success,
      ).toBe(false);
    },
  );

  it("rejects missing and malformed required fields", () => {
    expect(
      deadlineInputSchema.safeParse({
        ...validDeadline,
        title: "x",
        instructions: "",
      }).success,
    ).toBe(false);
  });
});
