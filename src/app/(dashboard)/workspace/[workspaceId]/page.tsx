import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Users, Calendar, BarChart3 } from 'lucide-react'

interface PageProps {
    params: { workspaceId: string }
}

export default async function WorkspacePage({ params }: PageProps) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    // Get workspace details
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', params.workspaceId)
        .single()

    if (!workspace) {
        redirect('/projects')
    }

    // Get projects in this workspace
    const { data: projects } = await supabase
        .from('projects')
        .select(`
      *,
      project_members(count)
    `)
        .eq('workspace_id', params.workspaceId)
        .order('created_at', { ascending: false })

    return (
        <div className="flex-1 bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
                        {workspace.description && (
                            <p className="text-gray-600 mt-1">{workspace.description}</p>
                        )}
                    </div>
                    <Link
                        href={`/workspace/${params.workspaceId}/project/new`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-4 w-4 text-white" />
                            </div>
                            <div className="ml-4">
                                <div className="text-2xl font-bold text-gray-900">{projects?.length || 0}</div>
                                <div className="text-sm text-gray-600">Projects</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <Users className="h-4 w-4 text-white" />
                            </div>
                            <div className="ml-4">
                                <div className="text-2xl font-bold text-gray-900">1</div>
                                <div className="text-sm text-gray-600">Members</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-white" />
                            </div>
                            <div className="ml-4">
                                <div className="text-2xl font-bold text-gray-900">0</div>
                                <div className="text-sm text-gray-600">Events</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
                    </div>

                    {projects && projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/workspace/${params.workspaceId}/project/${project.id}`}
                                    className="block bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow p-6"
                                >
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold">
                                            {project.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                                            {project.description && (
                                                <p className="text-sm text-gray-500 truncate">{project.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                                        <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                                            {project.project_members?.[0]?.count || 0}
                    </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <BarChart3 className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                            <p className="text-gray-600 mb-6">Create your first project to get started</p>
                            <Link
                                href={`/workspace/${params.workspaceId}/project/new`}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Project
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

