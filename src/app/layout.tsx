import "./globals.css";

import type { Metadata } from "next";
import { Lexend } from "next/font/google";

import { StyledToaster } from "@/hooks/use-toast";

const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kafuffle - Organize Your Beautiful Chaos",
  description:
    "Transform scattered team communication into structured productivity. Chat, collaborate, and manage projects all in one beautiful workspace.",
  keywords:
    "team collaboration, project management, chat, kanban, productivity",
  authors: [{ name: "Kafuffle Team" }],
  openGraph: {
    title: "Kafuffle - Organize Your Beautiful Chaos",
    description:
      "Transform scattered team communication into structured productivity.",
    type: "website",
    images: ["/og-image.png"], // You'll want to add this
  },
  twitter: {
    card: "summary_large_image",
    title: "Kafuffle - Organize Your Beautiful Chaos",
    description:
      "Transform scattered team communication into structured productivity.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${lexend.className} antialiased`}>
        {children}
        <StyledToaster />
      </body>
    </html>
  );
}
