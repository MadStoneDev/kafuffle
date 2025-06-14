// components/modals/create-project-modal.tsx
import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { DatabaseService } from "@/lib/database";
import type { User, Workspace } from "@/types";

interface CreateProjectModalProps {
  currentUser: User;
  workspaces: Workspace[];
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  currentUser,
  workspaces,
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id || "");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || creating) return;

    setCreating(true);
    setError("");

    try {
      const { success, error: createError } =
        await DatabaseService.createProject({
          name: name.trim(),
          description: description.trim() || undefined,
          workspace_id: workspaceId,
          owner_id: currentUser.id,
        });

      if (success) {
        setName("");
        setDescription("");
        onProjectCreated();
        onClose();
      } else {
        setError(createError?.message || "Failed to create project");
      }
    } catch (error) {
      setError("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Create Project</h2>
            <button
              onClick={handleClose}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this project about?"
                rows={3}
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary resize-none"
              />
            </div>

            {workspaces.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Workspace
                </label>
                <select
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-kafuffle-primary"
                >
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || creating}
                className="flex items-center px-4 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// components/modals/CreateChannelModal.tsx
interface CreateChannelModalProps {
  sectionId: string;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated: () => void;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  sectionId,
  projectId,
  isOpen,
  onClose,
  onChannelCreated,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"text" | "voice">("text");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || creating) return;

    setCreating(true);
    setError("");

    try {
      const { success, error: createError } =
        await DatabaseService.createChannel({
          name: name.trim().toLowerCase().replace(/\s+/g, "-"),
          type,
          project_id: projectId,
          section_id: sectionId,
          description: description.trim() || undefined,
        });

      if (success) {
        setName("");
        setDescription("");
        onChannelCreated();
        onClose();
      } else {
        setError(createError?.message || "Failed to create channel");
      }
    } catch (error) {
      setError("Failed to create channel");
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Create Channel</h2>
            <button
              onClick={handleClose}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                Channel Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType("text")}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    type === "text"
                      ? "border-kafuffle-primary bg-kafuffle-primary/10"
                      : "border-neutral-600 hover:border-neutral-500"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">#</div>
                    <div className="text-sm font-medium text-white">Text</div>
                    <div className="text-xs text-neutral-400">
                      Send messages
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setType("voice")}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    type === "voice"
                      ? "border-kafuffle-primary bg-kafuffle-primary/10"
                      : "border-neutral-600 hover:border-neutral-500"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🎙️</div>
                    <div className="text-sm font-medium text-white">Voice</div>
                    <div className="text-xs text-neutral-400">Voice chat</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Channel Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="channel-name"
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary"
                autoFocus
              />
              <p className="text-xs text-neutral-400 mt-1">
                Lowercase, no spaces. Use dashes instead.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this channel for?"
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || creating}
                className="flex items-center px-4 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Channel
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
