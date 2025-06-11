'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { createClient } from '@/utils/supabase/client'
import { Plus, MoreHorizontal, User } from 'lucide-react'

interface Card {
    id: string
    title: string
    description: string | null
    position: number
    due_date: string | null
    card_assignments: {
        profiles: {
            id: string
            full_name: string | null
        }
    }[]
}

interface List {
    id: string
    name: string
    position: number
    cards: Card[]
}

interface Board {
    id: string
    name: string
    description: string | null
    lists: List[]
}

interface KanbanBoardProps {
    board: Board
    workspaceId: string
    projectId: string
}

export default function KanbanBoard({ board, workspaceId, projectId }: KanbanBoardProps) {
    const [lists, setLists] = useState<List[]>(board.lists.sort((a, b) => a.position - b.position))
    const [dragDisabled, setDragDisabled] = useState(false)
    const supabase = createClient()

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId, type } = result

        if (!destination) return

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) return

        if (type === 'list') {
            // Handle list reordering
            const newLists = Array.from(lists)
            const [reorderedList] = newLists.splice(source.index, 1)
            newLists.splice(destination.index, 0, reorderedList)

            // Update positions
            const updatedLists = newLists.map((list, index) => ({
                ...list,
                position: index
            }))

            setLists(updatedLists)

            // Update in database
            const updates = updatedLists.map((list, index) =>
                supabase
                    .from('lists')
                    .update({ position: index })
                    .eq('id', list.id)
            )

            try {
                await Promise.all(updates)
            } catch (error) {
                console.error('Error updating list positions:', error)
                setLists(lists) // Revert on error
            }

        } else {
            // Handle card reordering
            const startList = lists.find(list => list.id === source.droppableId)
            const finishList = lists.find(list => list.id === destination.droppableId)

            if (!startList || !finishList) return

            if (startList === finishList) {
                // Moving within same list
                const newCards = Array.from(startList.cards)
                const [reorderedCard] = newCards.splice(source.index, 1)
                newCards.splice(destination.index, 0, reorderedCard)

                const updatedList = {
                    ...startList,
                    cards: newCards.map((card, index) => ({
                        ...card,
                        position: index
                    }))
                }

                setLists(lists.map(list =>
                    list.id === updatedList.id ? updatedList : list
                ))

                // Update card positions in database
                const updates = newCards.map((card, index) =>
                    supabase
                        .from('cards')
                        .update({ position: index })
                        .eq('id', card.id)
                )

                try {
                    await Promise.all(updates)
                } catch (error) {
                    console.error('Error updating card positions:', error)
                }

            } else {
                // Moving between lists
                const startCards = Array.from(startList.cards)
                const finishCards = Array.from(finishList.cards)
                const [movedCard] = startCards.splice(source.index, 1)
                finishCards.splice(destination.index, 0, movedCard)

                const updatedStartList = {
                    ...startList,
                    cards: startCards.map((card, index) => ({
                        ...card,
                        position: index
                    }))
                }

                const updatedFinishList = {
                    ...finishList,
                    cards: finishCards.map((card, index) => ({
                        ...card,
                        position: index,
                        list_id: finishList.id
                    }))
                }

                setLists(lists.map(list => {
                    if (list.id === updatedStartList.id) return updatedStartList
                    if (list.id === updatedFinishList.id) return updatedFinishList
                    return list
                }))

                // Update card in database
                try {
                    await supabase
                        .from('cards')
                        .update({
                            list_id: finishList.id,
                            position: destination.index
                        })
                        .eq('id', draggableId)

                    // Update positions for both lists
                    const startUpdates = startCards.map((card, index) =>
                        supabase
                            .from('cards')
                            .update({ position: index })
                            .eq('id', card.id)
                    )

                    const finishUpdates = finishCards.slice(0, destination.index)
                        .concat(finishCards.slice(destination.index + 1))
                        .map((card, index) =>
                            supabase
                                .from('cards')
                                .update({ position: index >= destination.index ? index + 1 : index })
                                .eq('id', card.id)
                        )

                    await Promise.all([...startUpdates, ...finishUpdates])
                } catch (error) {
                    console.error('Error moving card:', error)
                }
            }
        }
    }

    return (
        <div className="h-full">
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="board" type="list" direction="horizontal">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="flex space-x-4 h-full overflow-x-auto pb-4"
                        >
                            {lists.map((list, index) => (
                                <Draggable key={list.id} draggableId={list.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`w-72 bg-gray-100 rounded-lg flex flex-col max-h-full ${
                                                snapshot.isDragging ? 'shadow-lg' : ''
                                            }`}
                                        >
                                            {/* List Header */}
                                            <div
                                                {...provided.dragHandleProps}
                                                className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg"
                                            >
                                                <h3 className="font-semibold text-gray-900">{list.name}</h3>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-500">{list.cards.length}</span>
                                                    <button className="p-1 hover:bg-gray-200 rounded">
                                                        <MoreHorizontal className="h-4 w-4 text-gray-600" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Cards */}
                                            <Droppable droppableId={list.id} type="card">
                                                {(provided, snapshot) => (
                                                    <div
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                        className={`flex-1 p-2 space-y-2 overflow-y-auto ${
                                                            snapshot.isDraggingOver ? 'bg-blue-50' : ''
                                                        }`}
                                                    >
                                                        {list.cards
                                                            .sort((a, b) => a.position - b.position)
                                                            .map((card, cardIndex) => (
                                                                <Draggable key={card.id} draggableId={card.id} index={cardIndex}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                                                                                snapshot.isDragging ? 'shadow-lg rotate-3' : ''
                                                                            }`}
                                                                        >
                                                                            <h4 className="font-medium text-gray-900 mb-2">{card.title}</h4>
                                                                            {card.description && (
                                                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                                                    {card.description}
                                                                                </p>
                                                                            )}

                                                                            <div className="flex items-center justify-between">
                                                                                {card.due_date && (
                                                                                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                            Due {new Date(card.due_date).toLocaleDateString()}
                                          </span>
                                                                                )}

                                                                                {card.card_assignments.length > 0 && (
                                                                                    <div className="flex -space-x-1">
                                                                                        {card.card_assignments.slice(0, 3).map((assignment, idx) => (
                                                                                            <div
                                                                                                key={idx}
                                                                                                className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white border-2 border-white"
                                                                                                title={assignment.profiles.full_name || 'User'}
                                                                                            >
                                                                                                {assignment.profiles.full_name?.[0] || <User className="h-3 w-3" />}
                                                                                            </div>
                                                                                        ))}
                                                                                        {card.card_assignments.length > 3 && (
                                                                                            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white border-2 border-white">
                                                                                                +{card.card_assignments.length - 3}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                        {provided.placeholder}

                                                        {/* Add Card Button */}
                                                        <button className="w-full p-3 text-left text-gray-600 hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                                                            <div className="flex items-center space-x-2">
                                                                <Plus className="h-4 w-4" />
                                                                <span className="text-sm">Add a card</span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                )}
                                            </Droppable>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}

                            {/* Add List Button */}
                            <div className="w-72 flex-shrink-0">
                                <button className="w-full h-full min-h-32 bg-gray-200 hover:bg-gray-300 rounded-lg border-2 border-dashed border-gray-400 hover:border-gray-500 transition-colors flex items-center justify-center">
                                    <div className="text-center">
                                        <Plus className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                                        <span className="text-sm text-gray-600">Add another list</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    )
}
