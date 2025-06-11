import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import WorkspaceSidebar from "@/components/dashboard/workspace-sidebar";
import ProjectSidebar from "@/components/dashboard/project-sidebar";
import ChannelSidebar from "@/components/dashboard/channel-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if (!user) {
  //   redirect("/auth");
  // }

  // Get user's workspaces
  // const { data: workspaces } = await supabase
  //   .from("workspaces")
  //   .select(
  //     `
  //     *,
  //     workspace_members!inner(role)
  //   `,
  //   )
  //   .eq("workspace_members.user_id", user.id)
  //   .order("created_at", { ascending: false });

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
