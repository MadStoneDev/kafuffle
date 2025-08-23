import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Link from "next/link";
import { IconSettings, IconUser } from "@tabler/icons-react";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Kafuffle | #zone-name | #server-name",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const outfit = Outfit({
  variable: "--font-outfit",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} max-h-screen antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <aside
            className={`pointer-events-none p-4 md:px-8 fixed top-0 left-0 right-0 flex flex-row justify-between items-center`}
          >
            <button
              className={`pointer-events-auto p-1 border border-foreground/30 hover:bg-foreground rounded-md hover:text-background transition-all duration-300 ease-in-out`}
            >
              <IconUser />
            </button>

            <button
              className={`pointer-events-auto p-1 border border-foreground/30 hover:bg-foreground rounded-md hover:text-background transition-all duration-300 ease-in-out`}
            >
              <IconSettings />
            </button>
          </aside>

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
