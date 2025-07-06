// /components/modals/new-space-modal.tsx
"use client";

import { useState } from "react";
import {
  IconX,
  IconUsers,
  IconLock,
  IconGlobe,
  IconPlus,
} from "@tabler/icons-react";
// Remove this import: import { createSpace } from "@/app/actions/message-actions";

interface NewSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpaceCreated: () => void;
}

export default function NewSpaceModal({
  isOpen,
  onClose,
  onSpaceCreated,
}: NewSpaceModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Space name is required");
      return;
    }

    if (creating) {
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/spaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create space");
        console.error("Create space error:", result);
        return;
      }

      if (result.success) {
        // Reset form
        setFormData({ name: "", description: "", isPublic: false });
        onSpaceCreated();
        onClose();
      } else {
        setError(result.error || "Failed to create space");
      }
    } catch (error: any) {
      console.error("Failed to create space:", error);
      setError("Network error occurred");
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setFormData({ name: "", description: "", isPublic: false });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Create New Space
          </h2>
          <button
            onClick={handleClose}
            disabled={creating}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Space Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Space Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter space name"
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent"
              disabled={creating}
              maxLength={50}
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              {formData.name.length}/50 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="What's this space for? (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-kafuffle-primary focus:border-transparent resize-none"
              disabled={creating}
              maxLength={200}
            />
            <p className="text-xs text-neutral-500 mt-1">
              {formData.description.length}/200 characters
            </p>
          </div>

          {/* Privacy Setting */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Privacy
            </label>
            <div className="space-y-3">
              <div
                onClick={() =>
                  !creating &&
                  setFormData((prev) => ({ ...prev, isPublic: false }))
                }
                className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  !formData.isPublic
                    ? "border-kafuffle-primary bg-kafuffle-primary/5"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                } ${creating ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      !formData.isPublic
                        ? "border-kafuffle-primary bg-kafuffle-primary"
                        : "border-neutral-300 dark:border-neutral-600"
                    }`}
                  >
                    {!formData.isPublic && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IconLock
                      size={16}
                      className="text-neutral-600 dark:text-neutral-400"
                    />
                    <span className="font-medium text-neutral-900 dark:text-white">
                      Private
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Only invited members can join this space
                  </p>
                </div>
              </div>

              <div
                onClick={() =>
                  !creating &&
                  setFormData((prev) => ({ ...prev, isPublic: true }))
                }
                className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.isPublic
                    ? "border-kafuffle-primary bg-kafuffle-primary/5"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                } ${creating ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      formData.isPublic
                        ? "border-kafuffle-primary bg-kafuffle-primary"
                        : "border-neutral-300 dark:border-neutral-600"
                    }`}
                  >
                    {formData.isPublic && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <IconGlobe
                      size={16}
                      className="text-neutral-600 dark:text-neutral-400"
                    />
                    <span className="font-medium text-neutral-900 dark:text-white">
                      Public
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Anyone can discover and join this space
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={creating}
              className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !formData.name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-kafuffle-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <IconPlus size={16} />
                  Create Space
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
