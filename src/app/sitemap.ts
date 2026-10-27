import type { MetadataRoute } from "next";
import { getDeadlines, getSubjects } from "@/lib/data";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [subjects, deadlines] = await Promise.all([
    getSubjects(),
    getDeadlines(),
  ]);

  return [
    { url: new URL("/", siteUrl).toString(), priority: 1 },
    ...subjects.map((subject) => ({
      url: new URL(
        `/subjects/${encodeURIComponent(subject.slug)}`,
        siteUrl,
      ).toString(),
      priority: 0.7,
    })),
    ...deadlines.map((deadline) => ({
      url: new URL(
        `/deadlines/${encodeURIComponent(deadline.id)}`,
        siteUrl,
      ).toString(),
      lastModified: new Date(deadline.createdAt),
      priority: 0.6,
    })),
  ];
}
