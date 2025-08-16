// /app/spaces/[spaceId]/layout.tsx
import { ReactNode } from "react";
import SpacesSidebar from "@/components/user/spaces-sidebar";
import ZonesSidebar from "@/components/user/zones-sidebar";

export default async function SpacesLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;

  return (
    <main className="flex h-screen bg-background overflow-hidden">
      {/* Spaces Sidebar (left) */}
      <SpacesSidebar spaceId={spaceId} />

      {/* Content Area */}
      <div className="relative py-4 pr-4 flex items-stretch gap-3 w-full h-screen">
        {/* Main Content */}
        <section className="flex-grow flex flex-col justify-end rounded-3xl border border-foreground/20 overflow-hidden">
          {children}
        </section>

        {/* Zones Sidebar (right) */}
        <ZonesSidebar spaceId={spaceId} />
      </div>
    </main>
  );
}
