'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
    Hash,
    Calendar,
    FileText,
    Kanban,
    Plus,
    ChevronDown,
    ChevronRight
} from 'lucide-react'

interface Section {
    id: string
    name: string
    position: number
    channels: Channel[]
}

interface Channel {
    id: string
    name: string
    type: 'text' | 'voice'
    section_id: string | null
}

export default function ChannelSidebar() {
    const [sections, setSections] = useState<Section[]>([])
    const [channels, setChannels] = useState<Channel[]>([])
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
    const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const params = useParams()
    const supabase = createClient()

    const workspaceId = params?.workspaceId as string
    const projectId = params?.projectId as string

    useEffect(() => {
        if (projectId) {
            fetchSectionsAndChannels()
        }
    }, [projectId])

    const fetchSectionsAndChannels = async () => {
        if (!projectId) return

        setLoading(true)

        // Fetch sections
        const { data: sectionsData } = await supabase
            .from('sections')
            .select('*')
            .eq('project_id', projectId)
            .order('position')

        // Fetch channels
        const { data: channelsData } = await supabase
            .from('channels')
            .select('*')
            .eq('project_id', projectId)
            .order('position')

        // Group channels by section
        const sectionsWithChannels = (sectionsData || []).map(section => ({
            ...section,
            channels: (channelsData || []).filter(channel => channel.section_id === section.id)
        }))

        // Channels without sections
        const ungroupedChannels = (channelsData || []).filter(channel => !channel.section_id)

        setSections(sectionsWithChannels)
        setChannels(ungroupedChannels)
        setLoading(false)
    }

    const toggleSection = (sectionId: string) => {
        const newCollapsed = new Set(collapsedSections)
        if (newCollapsed.has(sectionId)) {
            newCollapsed.delete(sectionId)
        } else {
            newCollapsed.add(sectionId)
        }
        setCollapsedSections(newCollapsed)
    }

    const handleChannelSelect = (channelId: string) => {
        setSelectedChannel(channelId)
        router.push(`/workspace/${workspaceId}/project/${projectId}/channel/${channelId}`)
    }

    const handleViewSelect = (view: string) => {
        router.push(`/workspace/${workspaceId}/project/${projectId}/${view}`)
    }

    if (!projectId) {
        return (
            <div className="w-64 bg-neutral-700 text-white flex items-center justify-center">
                <p className="text-neutral-400 text-sm">Select a project</p>
            </div>
        )
    }

    return (
        <div className="w-64 bg-neutral-700 text-white flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-neutral-600">
                <h2 className="font-semibold text-lg">Channels</h2>
            </div>

            {/* Quick Views */}
            <div className="p-2 border-b border-neutral-600">
                <div className="space-y-1">
                    <button
                        onClick={() => handleViewSelect('boards')}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-neutral-300 hover:bg-neutral-600 hover:text-white rounded-lg transition-colors"
                    >
                        <Kanban className="h-4 w-4" />
                        <span className="text-sm">Boards</span>
                    </button>
                    <button
                        onClick={() => handleViewSelect('calendar')}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-neutral-300 hover:bg-neutral-600 hover:text-white rounded-lg transition-colors"
                    >
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Calendar</span>
                    </button>
                    <button
                        onClick={() => handleViewSelect('documents')}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-neutral-300 hover:bg-neutral-600 hover:text-white rounded-lg transition-colors"
                    >
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Documents</span>
                    </button>
                </div>
            </div>

            {/* Channels */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="text-neutral-400 text-sm p-4">Loading...</div>
                ) : (
                    <div className="p-2 space-y-2">
                        {/* Ungrouped Channels */}
                        {channels.map((channel) => (
                            <button
                                key={channel.id}
                                onClick={() => handleChannelSelect(channel.id)}
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                    selectedChannel === channel.id
                                        ? 'bg-neutral-600 text-white'
                                        : 'text-neutral-300 hover:bg-neutral-600 hover:text-white'
                                }`}
                            >
                                <Hash className="h-4 w-4" />
                                <span className="text-sm">{channel.name}</span>
                            </button>
                        ))}

                        {/* Sections with Channels */}
                        {sections.map((section) => (
                            <div key={section.id}>
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full flex items-center space-x-2 px-2 py-1 text-neutral-400 hover:text-white transition-colors"
                                >
                                    {collapsedSections.has(section.id) ? (
                                        <ChevronRight className="h-3 w-3" />
                                    ) : (
                                        <ChevronDown className="h-3 w-3" />
                                    )}
                                    <span className="text-xs font-semibold uppercase tracking-wide">
                    {section.name}
                  </span>
                                </button>

                                {!collapsedSections.has(section.id) && (
                                    <div className="ml-2 space-y-1">
                                        {section.channels.map((channel) => (
                                            <button
                                                key={channel.id}
                                                onClick={() => handleChannelSelect(channel.id)}
                                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                                    selectedChannel === channel.id
                                                        ? 'bg-neutral-600 text-white'
                                                        : 'text-neutral-300 hover:bg-neutral-600 hover:text-white'
                                                }`}
                                            >
                                                <Hash className="h-4 w-4" />
                                                <span className="text-sm">{channel.name}</span>
                                            </button>
                                        ))}

                                        <button className="w-full flex items-center space-x-3 px-3 py-2 text-neutral-400 hover:text-neutral-300 rounded-lg transition-colors">
                                            <Plus className="h-3 w-3" />
                                            <span className="text-xs">Add Channel</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Add Section */}
                        <button className="w-full flex items-center space-x-3 px-3 py-2 text-neutral-400 hover:text-neutral-300 rounded-lg transition-colors">
                            <Plus className="h-4 w-4" />
                            <span className="text-sm">Add Section</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}