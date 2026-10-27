jest.mock("next/cache", () => ({
  cacheLife: jest.fn(),
  cacheTag: jest.fn(),
}));

import { getDeadlineById, getDeadlines, getSubjects } from "@/lib/data";

describe("server JSON data readers", () => {
  it("reads the subjects and deadline records from the JSON files", async () => {
    const [subjects, deadlines] = await Promise.all([
      getSubjects(),
      getDeadlines(),
    ]);

    expect(subjects).toHaveLength(4);
    expect(deadlines).toHaveLength(12);
    expect(deadlines[0].subject.name).toBeTruthy();
  });

  it("returns null for an unknown deadline ID", async () => {
    await expect(getDeadlineById("unknown-deadline-id")).resolves.toBeNull();
  });
});
