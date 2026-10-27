jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateDeadlinePages } from "@/lib/revalidation";

describe("deadline cache revalidation", () => {
  it("revalidates public, private, subject, and sitemap paths", () => {
    revalidateDeadlinePages();

    expect(revalidateTag).toHaveBeenCalledWith("deadlines", { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/deadlines");
    expect(revalidatePath).toHaveBeenCalledWith("/deadlines/[id]", "page");
    expect(revalidatePath).toHaveBeenCalledWith("/subjects/[slug]", "page");
    expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("also invalidates the specific cached deadline tag", () => {
    revalidateDeadlinePages("deadline-1");

    expect(revalidateTag).toHaveBeenCalledWith("deadline:deadline-1", {
      expire: 0,
    });
  });
});
