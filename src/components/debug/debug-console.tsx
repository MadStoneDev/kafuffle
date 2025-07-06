// /components/debug/debug-console.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface DebugConsoleProps {
  spaceId?: string | null;
  zoneId?: string | null;
  context?: string; // "spaces-list" | "space-view" | etc
}

export default function DebugConsole({
  spaceId,
  zoneId,
  context = "unknown",
}: DebugConsoleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  };

  // Auto-run diagnostics when space/zone changes
  useEffect(() => {
    if (spaceId && isOpen) {
      runDiagnostics();
    }
  }, [spaceId, zoneId, isOpen]);

  const runDiagnostics = async () => {
    if (isRunning) return;

    setIsRunning(true);
    addLog(`🔍 Starting diagnostics in context: ${context}`);

    const supabase = createClient();

    try {
      // Test 1: Authentication
      addLog("1️⃣ Testing authentication...");
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        addLog(`❌ Auth failed: ${authError.message}`);
        return;
      }

      if (!user) {
        addLog(`❌ No authenticated user`);
        return;
      }

      addLog(`✅ Authenticated as: ${user.email}`);

      // Test 2: Spaces access
      addLog("2️⃣ Testing spaces access...");
      const { data: spaces, error: spacesError } = await supabase
        .from("spaces")
        .select("id, name, created_by")
        .limit(10);

      if (spacesError) {
        addLog(`❌ Spaces query failed: ${spacesError.message}`);
        addLog(`   Code: ${spacesError.code}, Details: ${spacesError.details}`);
      } else {
        addLog(`✅ Can query spaces table (${spaces?.length || 0} results)`);
      }

      // Test 3: Space membership
      addLog("3️⃣ Testing space membership...");
      const { data: memberships, error: memberError } = await supabase
        .from("space_members")
        .select("space_id, spaces!inner(id, name)")
        .eq("user_id", user.id);

      if (memberError) {
        addLog(`❌ Membership query failed: ${memberError.message}`);
        addLog(`   Code: ${memberError.code}, Details: ${memberError.details}`);
      } else {
        addLog(`✅ User is member of ${memberships?.length || 0} spaces`);
        memberships?.forEach((m: any) => {
          addLog(`   - ${m.spaces?.name || "Unnamed"} (${m.space_id})`);
        });
      }

      // Test 4: Specific space (if provided)
      if (spaceId) {
        addLog(`4️⃣ Testing specific space: ${spaceId}`);

        // Test space access
        const { data: space, error: spaceError } = await supabase
          .from("spaces")
          .select("*")
          .eq("id", spaceId)
          .single();

        if (spaceError) {
          addLog(`❌ Space query failed: ${spaceError.message}`);
          addLog(`   Code: ${spaceError.code}, Details: ${spaceError.details}`);
        } else {
          addLog(`✅ Space found: ${space?.name || "Unnamed"}`);
        }

        // Test zones for this space
        const { data: zones, error: zonesError } = await supabase
          .from("zones")
          .select("id, name, position, message_count, archived_at")
          .eq("space_id", spaceId);

        if (zonesError) {
          addLog(`❌ Zones query failed: ${zonesError.message}`);
          addLog(`   Code: ${zonesError.code}, Details: ${zonesError.details}`);
        } else {
          const activeZones = zones?.filter((z) => !z.archived_at) || [];
          addLog(
            `✅ Found ${zones?.length || 0} zones (${activeZones.length} active)`,
          );
          activeZones.forEach((zone) => {
            addLog(
              `   - ${zone.name} (pos: ${zone.position}, msgs: ${zone.message_count || 0})`,
            );
          });
        }

        // Test permissions
        try {
          const { data: hasPermission, error: permError } = await supabase.rpc(
            "user_has_permission",
            {
              p_user_id: user.id,
              p_space_id: spaceId,
              p_permission: "view_space",
            },
          );

          if (permError) {
            addLog(`❌ Permission check failed: ${permError.message}`);
          } else {
            addLog(
              `✅ View permission: ${hasPermission ? "Granted" : "Denied"}`,
            );
          }
        } catch (error: any) {
          addLog(`❌ Permission function error: ${error.message}`);
        }
      }

      // Test 5: Complex query (like space-view does)
      if (spaceId) {
        addLog("5️⃣ Testing complex space query...");
        const { data: complexData, error: complexError } = await supabase
          .from("spaces")
          .select(
            `
            *,
            space_members(user_id),
            zones(
              id,
              name,
              description,
              position,
              last_message_at,
              message_count,
              created_at,
              updated_at,
              archived_at,
              created_by,
              settings
            )
          `,
          )
          .eq("id", spaceId)
          .single();

        if (complexError) {
          addLog(`❌ Complex query failed: ${complexError.message}`);
          addLog(
            `   Code: ${complexError.code}, Details: ${complexError.details}`,
          );

          // Try to identify the specific issue
          if (complexError.message.includes("zones")) {
            addLog(`   🔍 Issue seems related to zones relation`);
          }
          if (complexError.message.includes("space_members")) {
            addLog(`   🔍 Issue seems related to space_members relation`);
          }
        } else {
          addLog(`✅ Complex query successful`);
          addLog(`   - Space: ${complexData?.name}`);
          addLog(`   - Members: ${complexData?.space_members?.length || 0}`);
          addLog(`   - Zones: ${complexData?.zones?.length || 0}`);
        }
      }

      addLog("🎉 Diagnostics completed!");
    } catch (error: any) {
      addLog(`💥 Unexpected error: ${error.message}`);
      addLog(`   Stack: ${error.stack?.split("\n")[0] || "No stack trace"}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testNavigation = () => {
    addLog(`🧭 Navigation test:`);
    addLog(`   - Context: ${context}`);
    addLog(`   - Space ID: ${spaceId || "None"}`);
    addLog(`   - Zone ID: ${zoneId || "None"}`);
    addLog(`   - URL: ${window.location.href}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className={`px-3 py-2 rounded-lg text-sm font-mono font-bold transition-all ${
            spaceId
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          DEBUG
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[480px] h-[400px] bg-black/95 text-green-400 font-mono text-xs border border-green-500 rounded-lg z-50 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-green-500 bg-black/80">
        <span className="text-green-300 font-bold">Debug Console</span>
        <div className="flex gap-1">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              isRunning
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isRunning ? "Running..." : "Diagnose"}
          </button>
          <button
            onClick={testNavigation}
            className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
          >
            Nav
          </button>
          <button
            onClick={clearLogs}
            className="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="p-2 text-xs border-b border-green-500/50 bg-black/60">
        <div className="grid grid-cols-2 gap-2">
          <div>
            Context: <span className="text-yellow-400">{context}</span>
          </div>
          <div>
            Space: <span className="text-blue-400">{spaceId || "None"}</span>
          </div>
          <div>
            Zone: <span className="text-purple-400">{zoneId || "None"}</span>
          </div>
          <div>
            Logs: <span className="text-orange-400">{logs.length}</span>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-2 bg-black/40">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No logs yet. Click "Diagnose" to run tests.
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`text-xs leading-relaxed ${
                  log.includes("❌")
                    ? "text-red-400"
                    : log.includes("✅")
                      ? "text-green-400"
                      : log.includes("🔍")
                        ? "text-blue-400"
                        : log.includes("🎉")
                          ? "text-yellow-400"
                          : "text-gray-300"
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
