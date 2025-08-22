// /app/spaces/[spaceId]/layout.tsx
import { ReactNode } from "react";
import ZonesSidebar from "@/components/user/zones-sidebar";
import SpaceHeader from "@/components/user/space-header";

export default async function SpacesLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;

  return (
    <main className="flex flex-col w-full h-screen overflow-hidden">
      {/* Header Bar */}
      <SpaceHeader spaceId={spaceId} />

      {/* Content Area */}
      <div className="relative pl-4 py-4 pt-0 flex items-stretch overflow-hidden">
        {/* Main Content */}
        <section className="mr-4 flex-grow flex flex-col justify-end rounded-2xl border border-foreground/20 overflow-hidden">
          {children}
        </section>

        {/* Zones Sidebar (right) */}
        <ZonesSidebar spaceId={spaceId} />
      </div>
    </main>
  );
}
