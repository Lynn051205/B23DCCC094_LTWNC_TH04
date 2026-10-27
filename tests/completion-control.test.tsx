/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CompletionControl from "@/components/CompletionControl";

const mockSetCompletionAction = jest.fn();

jest.mock("@/app/(app)/dashboard/actions", () => ({
  setCompletionAction: (...args: unknown[]) =>
    mockSetCompletionAction(...args),
}));

describe("CompletionControl", () => {
  beforeEach(() => {
    mockSetCompletionAction.mockReset();
    mockSetCompletionAction.mockResolvedValue({ message: "Đã cập nhật." });
  });

  it("submits the user's completion toggle and shows action feedback", async () => {
    render(
      <CompletionControl completed={false} deadlineId="deadline-1" />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Đánh dấu hoàn thành" }),
    );

    await waitFor(() => {
      expect(mockSetCompletionAction).toHaveBeenCalled();
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Đã cập nhật.",
    );
  });
});
