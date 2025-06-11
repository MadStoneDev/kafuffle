'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
    User,
    Home,
    Plus,
    LogOut,
    Settings,
    Crown
} from 'lucide-react'

interface Workspace {
    id: string
    name: string
    slug: string
    owner_id: string
    workspace_members: { role: string }[]
}

interface WorkspaceSidebarProps {
    workspaces: Workspace[]
    userId: string
}

export default function WorkspaceSidebar({ workspaces, userId }: WorkspaceSidebarProps) {
    const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/auth')
    }

    const handleWorkspaceSelect = (workspaceId: string) => {
        setSelectedWorkspace(workspaceId)
        router.push(`/workspace/${workspaceId}`)
    }

    const getWorkspaceInitials = (name: string) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <div className="w-16 bg-neutral-900 flex flex-col items-center py-3 space-y-2">
            {/* User Profile */}
            <div className="w-12 h-12 bg-kafuffle-primary rounded-full flex items-center justify-center mb-2">
                <User className="h-6 w-6 text-white" />
            </div>

            <div className="w-8 h-0.5 bg-neutral-700 mb-2" />

            {/* Dashboard */}
            <button
                onClick={() => router.push('/projects')}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:rounded-2xl ${
                    pathname === '/projects'
                        ? 'bg-kafuffle-primary rounded-2xl'
                        : 'bg-neutral-700 hover:bg-neutral-600'
                }`}
                title="Dashboard"
            >
                <Home className="h-6 w-6 text-white" />
            </button>

            <div className="w-8 h-0.5 bg-neutral-700 mb-2" />

            {/* Workspaces */}
            <div className="flex flex-col space-y-2 flex-1">
                {workspaces.map((workspace) => {
                    const isOwner = workspace.owner_id === userId
                    const isSelected = selectedWorkspace === workspace.id

                    return (
                        <div key={workspace.id} className="relative group">
                            <button
                                onClick={() => handleWorkspaceSelect(workspace.id)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-all hover:rounded-2xl relative ${
                                    isSelected
                                        ? 'bg-kafuffle-primary rounded-2xl'
                                        : 'bg-neutral-700 hover:bg-neutral-600'
                                }`}
                                title={workspace.name}
                            >
                                {getWorkspaceInitials(workspace.name)}
                                {isOwner && (
                                    <Crown className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400" />
                                )}
                            </button>

                            {/* Active indicator */}
                            {isSelected && (
                                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full -ml-1" />
                            )}
                        </div>
                    )
                })}

                {/* Add Workspace */}
                <button
                    onClick={() => router.push('/workspace/new')}
                    className="w-12 h-12 bg-neutral-700 hover:bg-green-600 rounded-full hover:rounded-2xl flex items-center justify-center transition-all group"
                    title="Create Workspace"
                >
                    <Plus className="h-6 w-6 text-neutral-400 group-hover:text-white" />
                </button>
            </div>

            {/* Settings & Logout */}
            <div className="space-y-2">
                <button
                    className="w-12 h-12 bg-neutral-700 hover:bg-neutral-600 rounded-full hover:rounded-2xl flex items-center justify-center transition-all"
                    title="Settings"
                >
                    <Settings className="h-5 w-5 text-neutral-400" />
                </button>

                <button
                    onClick={handleSignOut}
                    className="w-12 h-12 bg-neutral-700 hover:bg-red-600 rounded-full hover:rounded-2xl flex items-center justify-center transition-all"
                    title="Sign Out"
                >
                    <LogOut className="h-5 w-5 text-neutral-400" />
                </button>
            </div>
        </div>
    )
}

