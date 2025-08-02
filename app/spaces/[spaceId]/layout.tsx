import { ReactNode } from "react";
import SpacesSidebar from "@/components/user/spaces-sidebar";

export default async function SpacesLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ spaceId: string }>;
}) {
  // Hooks
  const { spaceId } = await params;

  return (
    <main className={`flex h-screen bg-background overflow-hidden`}>
      {/* Spaces */}
      <SpacesSidebar spaceId={spaceId} />

      {/* Content */}
      {children}
    </main>
  );
}
