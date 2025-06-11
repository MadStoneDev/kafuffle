import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import KanbanBoard from '@/components/kanban/kanban-board'
import { Plus } from 'lucide-react'

interface PageProps {
    params: {
        workspaceId: string
        projectId: string
    }
}

export default async function BoardsPage({ params }: PageProps) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    // Get boards for this project
    const { data: boards } = await supabase
        .from('boards')
        .select(`
      *,
      lists (
        *,
        cards (
          *,
          card_assignments (
            profiles (
              id,
              full_name
            )
          )
        )
      )
    `)
        .eq('project_id', params.projectId)
        .order('created_at', { ascending: false })

    return (
        <div className="flex-1 bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Boards</h1>
                    <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="h-4 w-4 mr-2" />
                        New Board
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {boards && boards.length > 0 ? (
                    <div className="space-y-8">
                        {boards.map((board) => (
                            <div key={board.id}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">{board.name}</h2>
                                    {board.description && (
                                        <p className="text-gray-600">{board.description}</p>
                                    )}
                                </div>
                                <KanbanBoard
                                    board={board}
                                    workspaceId={params.workspaceId}
                                    projectId={params.projectId}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Plus className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No boards yet</h3>
                        <p className="text-gray-600 mb-6">Create your first Kanban board to start organizing tasks</p>
                        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Board
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}