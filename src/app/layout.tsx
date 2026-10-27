import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Class Deadline Hub",
    template: "%s | Class Deadline Hub",
  },
  description:
    "Theo dõi môn học, bài tập và hạn nộp để chủ động hoàn thành kế hoạch học tập.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Class Deadline Hub",
    title: "Class Deadline Hub",
    description:
      "Theo dõi môn học, bài tập và hạn nộp để chủ động hoàn thành kế hoạch học tập.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Class Deadline Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Class Deadline Hub",
    description:
      "Theo dõi môn học, bài tập và hạn nộp để chủ động hoàn thành kế hoạch học tập.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={notoSans.variable} lang="vi">
      <body>{children}</body>
    </html>
  );
}
