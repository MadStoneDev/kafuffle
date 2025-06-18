// /components/messages/message-with-display-name.tsx
import { useState } from "react";
import { getAvatarInitials } from "@/utils/general/space-utils";
import {
  useDisplayName,
  useDisplayNames,
  useUserProfile,
} from "@/hooks/use-display-name";

interface MessageWithDisplayNameProps {
  message: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  };
  currentSpaceId: string;
}

export default function MessageWithDisplayName({
  message,
  currentSpaceId,
}: MessageWithDisplayNameProps) {
  const [showProfile, setShowProfile] = useState(false);

  // Get the display name for this space context
  const { displayName, loading: nameLoading } = useDisplayName(
    message.sender_id,
    currentSpaceId,
  );

  // Get full profile info (for the modal/popup)
  const { profile: userProfile, loading: profileLoading } = useUserProfile(
    message.sender_id,
  );

  if (nameLoading) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded"></div>;
  }

  return (
    <div className="flex gap-3 p-4 hover:bg-gray-50">
      {/* Avatar */}
      <button
        onClick={() => setShowProfile(true)}
        className="w-10 h-10 rounded-full bg-kafuffle-primary text-white flex items-center justify-center font-semibold hover:opacity-80"
      >
        {userProfile?.avatar_url ? (
          <img
            src={userProfile.avatar_url}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getAvatarInitials(displayName)
        )}
      </button>

      {/* Message Content */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={() => setShowProfile(true)}
            className="font-semibold text-neutral-900 hover:underline"
          >
            {displayName}
          </button>
          <span className="text-xs text-neutral-500">
            {new Date(message.created_at).toLocaleTimeString()}
          </span>
        </div>
        <div className="text-neutral-800">{message.content}</div>
      </div>

      {/* User Profile Modal */}
      {showProfile && userProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">User Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Profile Info */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-kafuffle-primary text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3">
                {userProfile.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getAvatarInitials(userProfile.username)
                )}
              </div>

              {/* Core Identity */}
              <h3 className="text-lg font-semibold">@{userProfile.username}</h3>
              {userProfile.display_name && (
                <p className="text-gray-600">{userProfile.display_name}</p>
              )}
              {userProfile.bio && (
                <p className="text-sm text-gray-500 mt-2">{userProfile.bio}</p>
              )}
            </div>

            {/* Space-Specific Names (Privacy-Aware) */}
            {userProfile.space_display_names.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm text-gray-700">
                  Known as in shared spaces:
                </h4>
                <div className="space-y-1">
                  {userProfile.space_display_names.map((spaceDisplay) => (
                    <div
                      key={spaceDisplay.space_id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {spaceDisplay.space_name}
                      </span>
                      <span className="font-medium">
                        {spaceDisplay.display_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Context */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                Currently appears as:{" "}
                <span className="font-semibold">{displayName}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Example of using multiple display names efficiently
export function MessageList({
  messages,
  currentSpaceId,
}: {
  messages: Array<{
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
  }>;
  currentSpaceId: string;
}) {
  const senderIds = [...new Set(messages.map((m) => m.sender_id))];
  const { displayNames } = useDisplayNames(senderIds, currentSpaceId);

  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <div key={message.id} className="flex gap-3 p-2">
          <div className="w-8 h-8 rounded-full bg-kafuffle-primary text-white flex items-center justify-center text-sm font-semibold">
            {getAvatarInitials(displayNames[message.sender_id] || "?")}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {displayNames[message.sender_id] || "Loading..."}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(message.created_at).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-sm">{message.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
