import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Users, Crown } from 'lucide-react'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Get user's workspaces
  const { data: workspaces } = await supabase
      .from('workspaces')
      .select(`
      *,
      workspace_members!inner(
        role
      )
    `)
      .eq('workspace_members.user_id', user.id)
      .order('created_at', { ascending: false })

  const getWorkspaceInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
      <div className="flex-1 bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Choose a workspace to continue.</p>
            </div>
            <Link
                href="/workspace/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Workspace
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {workspaces && workspaces.length > 0 ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Workspaces</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workspaces.map((workspace) => {
                    const isOwner = workspace.owner_id === user.id
                    const role = workspace.workspace_members[0]?.role || 'member'

                    return (
                        <Link
                            key={workspace.id}
                            href={`/workspace/${workspace.id}`}
                            className="block bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow p-6"
                        >
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                              {getWorkspaceInitials(workspace.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{workspace.name}</h3>
                              {workspace.description && (
                                  <p className="text-sm text-gray-500 truncate">{workspace.description}</p>
                              )}
                            </div>
                            {isOwner && (
                                <Crown className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {role === 'owner' ? 'Owner' : role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                            <span>
                        {new Date(workspace.created_at).toLocaleDateString()}
                      </span>
                          </div>
                        </Link>
                    )
                  })}
                </div>
              </div>
          ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Users className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first workspace to start collaborating with your team!
                </p>
                <Link
                    href="/workspace/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workspace
                </Link>
              </div>
          )}
        </div>
      </div>
  )
}