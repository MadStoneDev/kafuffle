import React, { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, MoreHorizontal, Calendar, User, Tag } from "lucide-react";
import type {
  KanbanBoard,
  KanbanList,
  KanbanCard,
  EnhancedUser,
} from "@/types";

interface KanbanBoardProps {
  board: KanbanBoard;
  onCardMove: (
    cardId: string,
    fromListId: string,
    toListId: string,
    newPosition: number,
  ) => void;
  onCardCreate: (listId: string, card: Partial<KanbanCard>) => void;
  onCardUpdate: (cardId: string, updates: Partial<KanbanCard>) => void;
  onCardDelete: (cardId: string) => void;
  onListCreate: (name: string) => void;
  onListUpdate: (listId: string, updates: Partial<KanbanList>) => void;
  onListDelete: (listId: string) => void;
  users: EnhancedUser[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  onCardMove,
  onCardCreate,
  onCardUpdate,
  onCardDelete,
  onListCreate,
  onListUpdate,
  onListDelete,
  users,
}) => {
  const [newCardContent, setNewCardContent] = useState<{
    [listId: string]: string;
  }>({});
  const [isAddingCard, setIsAddingCard] = useState<{
    [listId: string]: boolean;
  }>({});
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);

  const handleDragEnd = useCallback(
    (result: any) => {
      const { destination, source, draggableId } = result;

      if (!destination) return;
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;

      onCardMove(
        draggableId,
        source.droppableId,
        destination.droppableId,
        destination.index,
      );
    },
    [onCardMove],
  );

  const handleAddCard = useCallback(
    (listId: string) => {
      const content = newCardContent[listId]?.trim();
      if (!content) return;

      onCardCreate(listId, {
        title: content,
        position: board.lists.find((l) => l.id === listId)?.cards.length || 0,
        assignees: [],
        labels: [],
      });

      setNewCardContent({ ...newCardContent, [listId]: "" });
      setIsAddingCard({ ...isAddingCard, [listId]: false });
    },
    [newCardContent, board.lists, onCardCreate, isAddingCard],
  );

  const getCardPriorityColor = (dueDate?: string) => {
    if (!dueDate) return "border-neutral-600";

    const due = new Date(dueDate);
    const now = new Date();
    const daysDiff = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff < 0) return "border-red-500"; // Overdue
    if (daysDiff <= 1) return "border-orange-500"; // Due soon
    if (daysDiff <= 3) return "border-yellow-500"; // Due this week
    return "border-neutral-600"; // Normal
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900">
      {/* Board header */}
      <div className="p-4 border-b border-neutral-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">{board.name}</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onListCreate("New List")}
              className="flex items-center px-3 py-1.5 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded text-white text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add List
            </button>
            <button className="p-2 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Board content */}
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 p-4 min-h-full">
            {board.lists.map((list) => (
              <div key={list.id} className="flex-shrink-0 w-72">
                {/* List header */}
                <div className="bg-neutral-800 rounded-t-lg p-3 border-b border-neutral-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white">{list.name}</h3>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-neutral-400 bg-neutral-700 px-2 py-1 rounded">
                        {list.cards.length}
                      </span>
                      <button className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cards container */}
                <Droppable droppableId={list.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-neutral-800 rounded-b-lg p-3 space-y-3 min-h-[200px] ${
                        snapshot.isDraggingOver ? "bg-neutral-700" : ""
                      }`}
                    >
                      {list.cards.map((card, index) => (
                        <Draggable
                          key={card.id}
                          draggableId={card.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-neutral-900 border-2 rounded-lg p-3 cursor-pointer hover:border-kafuffle-primary/50 transition-colors ${getCardPriorityColor(
                                card.due_date,
                              )} ${snapshot.isDragging ? "opacity-50" : ""}`}
                              onClick={() => setSelectedCard(card)}
                            >
                              {/* Card title */}
                              <h4 className="text-sm font-medium text-white mb-2">
                                {card.title}
                              </h4>

                              {/* Card description */}
                              {card.description && (
                                <p className="text-xs text-neutral-400 mb-3 line-clamp-2">
                                  {card.description}
                                </p>
                              )}

                              {/* Labels */}
                              {card.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {card.labels.map((label) => (
                                    <span
                                      key={label.id}
                                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                                      style={{
                                        backgroundColor: `${label.color}20`,
                                        color: label.color,
                                      }}
                                    >
                                      {label.name}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Card footer */}
                              <div className="flex items-center justify-between">
                                {/* Assignees */}
                                <div className="flex -space-x-1">
                                  {card.assignees.slice(0, 3).map((user) => (
                                    <div
                                      key={user.id}
                                      className="w-6 h-6 rounded-full bg-kafuffle-primary flex items-center justify-center text-white text-xs border-2 border-neutral-900"
                                      title={user.username}
                                    >
                                      {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                  ))}
                                  {card.assignees.length > 3 && (
                                    <div className="w-6 h-6 rounded-full bg-neutral-600 flex items-center justify-center text-white text-xs border-2 border-neutral-900">
                                      +{card.assignees.length - 3}
                                    </div>
                                  )}
                                </div>

                                {/* Due date */}
                                {card.due_date && (
                                  <div className="flex items-center text-xs text-neutral-400">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(
                                      card.due_date,
                                    ).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Add card button/form */}
                      {isAddingCard[list.id] ? (
                        <div className="bg-neutral-700 rounded-lg p-3">
                          <textarea
                            value={newCardContent[list.id] || ""}
                            onChange={(e) =>
                              setNewCardContent({
                                ...newCardContent,
                                [list.id]: e.target.value,
                              })
                            }
                            placeholder="Enter card title..."
                            className="w-full bg-transparent text-white placeholder-neutral-400 resize-none focus:outline-none text-sm"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => handleAddCard(list.id)}
                              className="px-3 py-1 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded text-white text-sm"
                            >
                              Add Card
                            </button>
                            <button
                              onClick={() =>
                                setIsAddingCard({
                                  ...isAddingCard,
                                  [list.id]: false,
                                })
                              }
                              className="px-3 py-1 hover:bg-neutral-600 rounded text-neutral-400 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setIsAddingCard({
                              ...isAddingCard,
                              [list.id]: true,
                            })
                          }
                          className="w-full p-2 border-2 border-dashed border-neutral-600 hover:border-neutral-500 rounded-lg text-neutral-400 hover:text-white transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4 mx-auto" />
                          Add a card
                        </button>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}

            {/* Add list button */}
            <div className="flex-shrink-0 w-72">
              <button className="w-full h-12 border-2 border-dashed border-neutral-600 hover:border-neutral-500 rounded-lg text-neutral-400 hover:text-white transition-colors flex items-center justify-center">
                <Plus className="w-5 h-5 mr-2" />
                Add another list
              </button>
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Card details modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {selectedCard.title}
                </h2>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              {selectedCard.description && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-neutral-300 mb-2">
                    Description
                  </h3>
                  <p className="text-neutral-400">{selectedCard.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-300 mb-2">
                    Assignees
                  </h3>
                  <div className="space-y-2">
                    {selectedCard.assignees.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2"
                      >
                        <div className="w-6 h-6 rounded-full bg-kafuffle-primary flex items-center justify-center text-white text-xs">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-neutral-300 text-sm">
                          {user.username}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-neutral-300 mb-2">
                    Due Date
                  </h3>
                  {selectedCard.due_date && (
                    <div className="flex items-center text-neutral-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(selectedCard.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
