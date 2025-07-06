// /components/flows/flow-view.tsx
"use client";

import { useState, useEffect } from "react";
import { IconPlus, IconDotsVertical } from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
import FlowCard from "@/components/flows/flow-card";

interface FlowColumn {
  id: string;
  name: string;
  color: string;
  position: number;
  cards: FlowCard[];
}

interface FlowCard {
  id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  labels: string[];
  position: number;
  column_id: string;
  assignee?: {
    username: string;
    display_name: string | null;
  };
}

interface FlowViewProps {
  spaceId: string;
  zoneId: string;
}

export default function FlowView({ spaceId, zoneId }: FlowViewProps) {
  const [columns, setColumns] = useState<FlowColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState<FlowCard | null>(null);

  useEffect(() => {
    loadFlow();
  }, [zoneId]);

  const loadFlow = async () => {
    try {
      const supabase = createClient();

      // First check if a flow exists for this zone
      const { data: flow, error: flowError } = await supabase
        .from("flows")
        .select("id")
        .eq("space_id", spaceId)
        .eq("name", `Zone ${zoneId} Flow`) // We'll use zone ID to link flows
        .single();

      let flowId = flow?.id;

      if (!flow) {
        // Create a default flow for this zone
        const { data: newFlow, error: createError } = await supabase
          .from("flows")
          .insert({
            name: `Zone ${zoneId} Flow`,
            space_id: spaceId,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (createError) throw createError;
        flowId = newFlow.id;

        // Create default columns
        const defaultColumns = [
          { name: "To Do", color: "#ef4444", position: 0 },
          { name: "In Progress", color: "#f59e0b", position: 1 },
          { name: "Review", color: "#3b82f6", position: 2 },
          { name: "Done", color: "#10b981", position: 3 },
        ];

        for (const col of defaultColumns) {
          await supabase.from("flow_columns").insert({
            ...col,
            flow_id: flowId,
          });
        }
      }

      // Load columns and cards
      const { data: columnsData, error: columnsError } = await supabase
        .from("flow_columns")
        .select(
          `
          *,
          cards:flow_cards(
            *,
            assignee:profiles!assignee_id(username, display_name)
          )
        `,
        )
        .eq("flow_id", flowId)
        .order("position");

      if (columnsError) throw columnsError;

      const transformedColumns: FlowColumn[] = (columnsData || []).map(
        (col) => ({
          id: col.id,
          name: col.name,
          color: col.color || "#6b7280",
          position: col.position || 0,
          cards: (col.cards || [])
            .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
            .map((card: any) => ({
              id: card.id,
              title: card.title,
              description: card.description,
              assignee_id: card.assignee_id,
              due_date: card.due_date,
              labels: card.labels || [],
              position: card.position || 0,
              column_id: card.column_id,
              assignee: card.assignee,
            })),
        }),
      );

      setColumns(transformedColumns);
    } catch (error) {
      console.error("Failed to load flow:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (card: FlowCard) => {
    setDraggedCard(card);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (columnId: string) => {
    if (!draggedCard) return;

    try {
      const supabase = createClient();

      // Update card's column
      const { error } = await supabase
        .from("flow_cards")
        .update({ column_id: columnId })
        .eq("id", draggedCard.id);

      if (error) throw error;

      // Update local state
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          cards:
            col.id === columnId
              ? [
                  ...col.cards.filter((c) => c.id !== draggedCard.id),
                  { ...draggedCard, column_id: columnId },
                ]
              : col.cards.filter((c) => c.id !== draggedCard.id),
        })),
      );

      setDraggedCard(null);
    } catch (error) {
      console.error("Failed to move card:", error);
    }
  };

  const createCard = async (columnId: string, title: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("flow_cards")
        .insert({
          title,
          column_id: columnId,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          position: columns.find((c) => c.id === columnId)?.cards.length || 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, cards: [...col.cards, data] } : col,
        ),
      );
    } catch (error) {
      console.error("Failed to create card:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-neutral-500">
          <div className="w-4 h-4 border-2 border-neutral-300 border-t-kafuffle-primary rounded-full animate-spin"></div>
          Loading flow...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-x-auto">
      <div className="flex gap-6 min-w-max">
        {columns.map((column) => (
          <div
            key={column.id}
            className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 w-80 flex-shrink-0"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {column.name}
                </h3>
                <span className="text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-full">
                  {column.cards.length}
                </span>
              </div>
              <button className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded">
                <IconDotsVertical size={16} />
              </button>
            </div>

            <div className="space-y-3 mb-3">
              {column.cards.map((card) => (
                <FlowCard
                  key={card.id}
                  card={card}
                  onDragStart={() => handleDragStart(card)}
                />
              ))}
            </div>

            <button
              onClick={() => {
                const title = prompt("Enter card title:");
                if (title) createCard(column.id, title);
              }}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-500 dark:text-neutral-400 hover:border-kafuffle-primary hover:text-kafuffle-primary transition-colors"
            >
              <IconPlus size={16} />
              Add Card
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
