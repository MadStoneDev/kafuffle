// /app/me/layout.tsx
import { ReactNode } from "react";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <main className="h-screen bg-background overflow-hidden">{children}</main>
  );
}
