import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Kanban, Calendar, FileText, Users, Hash } from "lucide-react";

interface PageProps {
  params: {
    workspaceId: string;
    projectId: string;
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Get project details
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.projectId)
    .single();

  if (!project) {
    redirect(`/workspace/${params.workspaceId}`);
  }

  // Get recent channels
  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .eq("project_id", params.projectId)
    .limit(5);

  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href={`/workspace/${params.workspaceId}/project/${params.projectId}/boards`}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Kanban className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Boards</h3>
                <p className="text-sm text-gray-600">Manage tasks</p>
              </div>
            </div>
          </Link>

          <Link
            href={`/workspace/${params.workspaceId}/project/${params.projectId}/calendar`}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Calendar</h3>
                <p className="text-sm text-gray-600">Schedule events</p>
              </div>
            </div>
          </Link>

          <Link
            href={`/workspace/${params.workspaceId}/project/${params.projectId}/documents`}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Documents</h3>
                <p className="text-sm text-gray-600">Knowledge base</p>
              </div>
            </div>
          </Link>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Team</h3>
                <p className="text-sm text-gray-600">1 member</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Channels */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Channels
          </h2>

          {channels && channels.length > 0 ? (
            <div className="space-y-2">
              {channels.map((channel) => (
                <Link
                  key={channel.id}
                  href={`/workspace/${params.workspaceId}/project/${params.projectId}/channel/${channel.id}`}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Hash className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    {channel.name}
                  </span>
                  {channel.description && (
                    <span className="text-sm text-gray-500">
                      - {channel.description}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Hash className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                No channels yet. Create your first channel to start chatting!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
