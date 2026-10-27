import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

export function revalidateDeadlinePages(deadlineId?: string): void {
  revalidateTag("deadlines", { expire: 0 });

  if (deadlineId) {
    revalidateTag(`deadline:${deadlineId}`, { expire: 0 });
  }

  revalidatePath("/");
  revalidatePath("/deadlines");
  revalidatePath("/sitemap.xml");
  revalidatePath("/deadlines/[id]", "page");
  revalidatePath("/subjects/[slug]", "page");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}
