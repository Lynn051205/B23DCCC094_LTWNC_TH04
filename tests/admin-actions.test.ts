jest.mock("@/lib/auth-server", () => ({
  getAuthorizedActionUser: jest.fn(),
}));
jest.mock("@/lib/data", () => ({
  createDeadline: jest.fn(),
  deleteDeadline: jest.fn(),
}));
jest.mock("@/lib/revalidation", () => ({
  revalidateDeadlinePages: jest.fn(),
}));

import { createDeadlineAction } from "@/app/(app)/admin/actions";
import { getAuthorizedActionUser } from "@/lib/auth-server";
import { createDeadline } from "@/lib/data";

const validInput = {
  subjectId: "web-development",
  title: "Bài tập thiết kế website",
  description: "Hoàn thiện giao diện và tài liệu dự án.",
  dueAt: "2030-10-25T23:59",
  submissionType: "Nộp trực tuyến",
  instructions: "Đính kèm mã nguồn và báo cáo.",
};

function makeFormData(input: typeof validInput): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(input)) {
    formData.set(key, value);
  }

  return formData;
}

describe("createDeadlineAction server-side checks", () => {
  it("rejects an unauthorized direct action call before accessing data", async () => {
    jest.mocked(getAuthorizedActionUser).mockResolvedValue({
      error: "Bạn không có quyền thực hiện thao tác này.",
    });

    const result = await createDeadlineAction(
      { message: "" },
      makeFormData(validInput),
    );

    expect(result.error).toBe(true);
    expect(createDeadline).not.toHaveBeenCalled();
  });

  it("rejects invalid dates before writing deadline data", async () => {
    jest.mocked(getAuthorizedActionUser).mockResolvedValue({
      user: {
        id: "admin",
        email: "admin@ptit.edu.vn",
        name: "Admin",
        role: "admin",
      },
    });

    const result = await createDeadlineAction(
      { message: "" },
      makeFormData({ ...validInput, dueAt: "2030-02-29T10:00" }),
    );

    expect(result.error).toBe(true);
    expect(createDeadline).not.toHaveBeenCalled();
  });
});
