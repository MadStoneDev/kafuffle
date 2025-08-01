import SpacesSidebar from "@/components/user/spaces-sidebar";

export default function SpacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className={`flex h-screen bg-background overflow-hidden`}>
      {/* Spaces */}
      <SpacesSidebar />

      {/* Content */}
      {children}
    </main>
  );
}
