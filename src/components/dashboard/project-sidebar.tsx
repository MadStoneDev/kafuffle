'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Plus, Hash, Calendar, FileText, Settings } from 'lucide-react'

interface Project {
    id: string
    name: string
    description: string | null
}

export default function ProjectSidebar() {
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedProject, setSelectedProject] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const params = useParams()
    const supabase = createClient()

    const workspaceId = params?.workspaceId as string

    useEffect(() => {
        if (workspaceId) {
            fetchProjects()
        }
    }, [workspaceId])

    const fetchProjects = async () => {
        if (!workspaceId) return

        setLoading(true)
        const { data } = await supabase
            .from('projects')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })

        setProjects(data || [])
        setLoading(false)
    }

    const handleProjectSelect = (projectId: string) => {
        setSelectedProject(projectId)
        router.push(`/workspace/${workspaceId}/project/${projectId}`)
    }

    const getProjectIcon = (name: string) => {
        return name.charAt(0).toUpperCase()
    }

    if (!workspaceId) {
        return (
            <div className="w-60 bg-neutral-800 text-white flex items-center justify-center">
                <p className="text-neutral-400 text-sm">Select a workspace</p>
            </div>
        )
    }

    return (
        <div className="w-60 bg-neutral-800 text-white flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-neutral-700">
                <h2 className="font-semibold text-lg">Projects</h2>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-1">
                    {loading ? (
                        <div className="text-neutral-400 text-sm p-2">Loading...</div>
                    ) : projects.length === 0 ? (
                        <div className="text-neutral-400 text-sm p-2">No projects yet</div>
                    ) : (
                        projects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => handleProjectSelect(project.id)}
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                    selectedProject === project.id
                                        ? 'bg-neutral-700 text-white'
                                        : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                                }`}
                            >
                                <div className="w-8 h-8 bg-kafuffle-primary rounded-lg flex items-center justify-center text-sm font-semibold">
                                    {getProjectIcon(project.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{project.name}</div>
                                    {project.description && (
                                        <div className="text-xs text-neutral-400 truncate">
                                            {project.description}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-neutral-700 space-y-2">
                <button
                    onClick={() => router.push(`/workspace/${workspaceId}/project/new`)}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-neutral-300 hover:bg-neutral-700 hover:text-white rounded-lg transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">New Project</span>
                </button>
            </div>
        </div>
    )
}
