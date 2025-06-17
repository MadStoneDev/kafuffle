import "./globals.css";

import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import ThemeProvider from "@/components/providers/theme-provider";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Kafuffle | ",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`bg-neutral-100 dark:bg-black/95 text-neutral-900 dark:text-neutral-200 ${lexend.className} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
