// /components/flows/flows-list.tsx
"use client";

import { useState, useEffect } from "react";
import {
  IconTable,
  IconPlus,
  IconUsers,
  IconCalendar,
} from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";

interface Flow {
  id: string;
  name: string;
  description: string | null;
  space_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  settings: any;
  columns_count: number;
  cards_count: number;
}

interface FlowsListProps {
  spaceId: string;
  onSelectFlow: (flowId: string) => void;
}

export default function FlowsList({ spaceId, onSelectFlow }: FlowsListProps) {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFlows();
  }, [spaceId]);

  const loadFlows = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Get flows with counts
      const { data: flowsData, error: flowsError } = await supabase
        .from("flows")
        .select(
          `
          *,
          flow_columns(
            id,
            flow_cards(id)
          )
        `,
        )
        .eq("space_id", spaceId)
        .is("archived_at", null)
        .order("created_at", { ascending: false });

      if (flowsError) throw flowsError;

      // Transform data to include counts
      const transformedFlows: Flow[] = (flowsData || []).map((flow) => ({
        id: flow.id,
        name: flow.name,
        description: flow.description,
        space_id: flow.space_id,
        created_by: flow.created_by,
        created_at: flow.created_at,
        updated_at: flow.updated_at,
        archived_at: flow.archived_at,
        settings: flow.settings,
        columns_count: flow.flow_columns?.length || 0,
        cards_count:
          flow.flow_columns?.reduce(
            (total: number, col: any) => total + (col.flow_cards?.length || 0),
            0,
          ) || 0,
      }));

      setFlows(transformedFlows);
    } catch (error: any) {
      console.error("Failed to load flows:", error);
      setError("Failed to load flows");
    } finally {
      setLoading(false);
    }
  };

  const createFlow = async () => {
    const name = prompt("Enter flow name:");
    if (!name) return;

    const description = prompt("Enter flow description (optional):");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be logged in to create a flow");
        return;
      }

      const { data: newFlow, error } = await supabase
        .from("flows")
        .insert({
          name,
          description: description || null,
          space_id: spaceId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

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
          flow_id: newFlow.id,
        });
      }

      // Refresh the list
      loadFlows();
    } catch (error: any) {
      console.error("Failed to create flow:", error);
      alert("Failed to create flow");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-neutral-500">
            <div className="w-4 h-4 border-2 border-neutral-300 border-t-kafuffle-primary rounded-full animate-spin"></div>
            Loading flows...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-kafuffle-primary mb-4">{error}</p>
            <button
              onClick={loadFlows}
              className="px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Flows
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage your team's workflows and tasks
          </p>
        </div>
        <button
          onClick={createFlow}
          className="flex items-center gap-2 px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity"
        >
          <IconPlus size={16} />
          Create Flow
        </button>
      </div>

      {flows.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconTable size={32} className="text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            No flows yet
          </h3>
          <p className="text-neutral-500 dark:text-neutral-500 mb-4">
            Create your first flow to start organizing tasks
          </p>
          <button
            onClick={createFlow}
            className="px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-80 transition-opacity"
          >
            Create Flow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flows.map((flow) => (
            <div
              key={flow.id}
              onClick={() => onSelectFlow(flow.id)}
              className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg hover:border-kafuffle-primary/50 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-kafuffle-primary to-kafuffle-primary/70 rounded-lg flex items-center justify-center">
                    <IconTable size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-kafuffle-primary transition-colors">
                      {flow.name}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {new Date(flow.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {flow.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                  {flow.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <div className="flex items-center gap-1">
                    <IconTable size={14} />
                    <span>{flow.columns_count} columns</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconCalendar size={14} />
                    <span>{flow.cards_count} cards</span>
                  </div>
                </div>
                <div className="text-xs text-neutral-400 group-hover:text-kafuffle-primary transition-colors">
                  Open →
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
