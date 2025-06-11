'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Hash, Users } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectPage() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const params = useParams()
    const supabase = createClient()

    const workspaceId = params?.workspaceId as string

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Create project
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .insert({
                    name: name.trim(),
                    description: description.trim() || null,
                    workspace_id: workspaceId,
                    owner_id: user.id,
                })
                .select()
                .single()

            if (projectError) throw projectError

            // Add user as project member
            const { error: memberError } = await supabase
                .from('project_members')
                .insert({
                    project_id: project.id,
                    user_id: user.id,
                    role: 'owner',
                })

            if (memberError) throw memberError

            // Create default board
            const { data: board, error: boardError } = await supabase
                .from('boards')
                .insert({
                    name: 'Main Board',
                    description: 'Default board for the project',
                    project_id: project.id,
                })
                .select()
                .single()

            if (boardError) throw boardError

            // Create default lists
            const defaultLists = [
                { name: 'To Do', position: 0 },
                { name: 'In Progress', position: 1 },
                { name: 'Done', position: 2 },
            ]

            const { error: listsError } = await supabase
                .from('lists')
                .insert(
                    defaultLists.map(list => ({
                        ...list,
                        board_id: board.id,
                    }))
                )

            if (listsError) throw listsError

            // Create default section and channel
            const { data: section, error: sectionError } = await supabase
                .from('sections')
                .insert({
                    name: 'General',
                    project_id: project.id,
                    position: 0,
                })
                .select()
                .single()

            if (sectionError) throw sectionError

            const { error: channelError } = await supabase
                .from('channels')
                .insert({
                    name: 'general',
                    description: 'General discussion for the project',
                    project_id: project.id,
                    section_id: section.id,
                    position: 0,
                })

            if (channelError) throw channelError

            router.push(`/workspace/${workspaceId}/project/${project.id}`)
        } catch (error: any) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 bg-white">
            <div className="max-w-2xl mx-auto py-12 px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/workspace/${workspaceId}`}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Workspace
                    </Link>
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Hash className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create Project</h1>
                            <p className="text-gray-600">Start a new project in this workspace</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Project Name *
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Website Redesign, Mobile App, Q1 Planning"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description (optional)
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this project about?"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Help your team understand the project goals
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2">What gets created</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• A default Kanban board with To Do, In Progress, and Done lists</li>
                            <li>• A general channel for team communication</li>
                            <li>• Calendar and documents ready to use</li>
                        </ul>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-6">
                        <Link
                            href={`/workspace/${workspaceId}`}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}