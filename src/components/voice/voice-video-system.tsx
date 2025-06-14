import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Monitor,
  MonitorOff,
  Volume2,
  VolumeX,
  Settings,
  Users,
  MessageSquare,
  MoreHorizontal,
  Pin,
  Maximize,
  Minimize,
  Camera,
  Speaker,
  Headphones,
} from "lucide-react";
import type { EnhancedUser, EnhancedChannel } from "@/types";

interface VoiceConnection {
  user: EnhancedUser;
  peer_id: string;
  is_speaking: boolean;
  is_muted: boolean;
  is_video_enabled: boolean;
  is_screen_sharing: boolean;
  volume_level: number;
  connection_quality: "excellent" | "good" | "poor" | "disconnected";
  joined_at: string;
}

interface VoiceChannelState {
  channel: EnhancedChannel;
  connections: VoiceConnection[];
  local_user: {
    is_muted: boolean;
    is_video_enabled: boolean;
    is_screen_sharing: boolean;
    is_deafened: boolean;
    camera_device?: string;
    microphone_device?: string;
    speaker_device?: string;
  };
  is_connected: boolean;
  is_connecting: boolean;
  error?: string;
}

interface VoiceVideoSystemProps {
  channel: EnhancedChannel;
  currentUser: EnhancedUser;
  onLeave?: () => void;
  onError?: (error: string) => void;
}

export const VoiceVideoSystem: React.FC<VoiceVideoSystemProps> = ({
  channel,
  currentUser,
  onLeave,
  onError,
}) => {
  const [state, setState] = useState<VoiceChannelState>({
    channel,
    connections: [],
    local_user: {
      is_muted: false,
      is_video_enabled: false,
      is_screen_sharing: false,
      is_deafened: false,
    },
    is_connected: false,
    is_connecting: false,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [availableDevices, setAvailableDevices] = useState({
    cameras: [] as MediaDeviceInfo[],
    microphones: [] as MediaDeviceInfo[],
    speakers: [] as MediaDeviceInfo[],
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const socketRef = useRef<WebSocket | null>(null);

  // Initialize WebRTC and get user media
  useEffect(() => {
    initializeVoiceChat();
    loadAvailableDevices();

    return () => {
      cleanup();
    };
  }, [channel.id]);

  const initializeVoiceChat = async () => {
    setState((prev) => ({ ...prev, is_connecting: true }));

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false, // Start with audio only
      });

      localStreamRef.current = stream;

      // Connect to signaling server
      await connectToSignalingServer();

      setState((prev) => ({
        ...prev,
        is_connected: true,
        is_connecting: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initialize voice chat";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        is_connecting: false,
      }));
      onError?.(errorMessage);
    }
  };

  const connectToSignalingServer = async () => {
    return new Promise<void>((resolve, reject) => {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/voice/${channel.id}`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("Connected to signaling server");
        socket.send(
          JSON.stringify({
            type: "join_channel",
            user_id: currentUser.id,
            channel_id: channel.id,
          }),
        );
        resolve();
      };

      socket.onmessage = (event) => {
        handleSignalingMessage(JSON.parse(event.data));
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(new Error("Failed to connect to voice server"));
      };

      socket.onclose = () => {
        console.log("Disconnected from signaling server");
        setState((prev) => ({ ...prev, is_connected: false }));
      };

      socketRef.current = socket;
    });
  };

  const handleSignalingMessage = async (message: any) => {
    switch (message.type) {
      case "user_joined":
        await handleUserJoined(message.data);
        break;
      case "user_left":
        handleUserLeft(message.data.user_id);
        break;
      case "offer":
        await handleOffer(message.data);
        break;
      case "answer":
        await handleAnswer(message.data);
        break;
      case "ice_candidate":
        await handleIceCandidate(message.data);
        break;
      case "user_state_changed":
        handleUserStateChanged(message.data);
        break;
    }
  };

  const handleUserJoined = async (userData: any) => {
    const peerConnection = createPeerConnection(userData.user_id);

    // Add local stream to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socketRef.current?.send(
      JSON.stringify({
        type: "offer",
        data: {
          offer,
          target_user_id: userData.user_id,
        },
      }),
    );

    // Add to connections
    setState((prev) => ({
      ...prev,
      connections: [
        ...prev.connections,
        {
          user: userData.user,
          peer_id: userData.user_id,
          is_speaking: false,
          is_muted: false,
          is_video_enabled: false,
          is_screen_sharing: false,
          volume_level: 0,
          connection_quality: "good",
          joined_at: new Date().toISOString(),
        },
      ],
    }));
  };

  const handleUserLeft = (userId: string) => {
    // Clean up peer connection
    const peerConnection = peerConnectionsRef.current.get(userId);
    if (peerConnection) {
      peerConnection.close();
      peerConnectionsRef.current.delete(userId);
    }

    // Remove from connections
    setState((prev) => ({
      ...prev,
      connections: prev.connections.filter((conn) => conn.user.id !== userId),
    }));
  };

  const handleOffer = async (data: any) => {
    const peerConnection = createPeerConnection(data.from_user_id);

    await peerConnection.setRemoteDescription(data.offer);

    // Add local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    // Create and send answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socketRef.current?.send(
      JSON.stringify({
        type: "answer",
        data: {
          answer,
          target_user_id: data.from_user_id,
        },
      }),
    );
  };

  const handleAnswer = async (data: any) => {
    const peerConnection = peerConnectionsRef.current.get(data.from_user_id);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(data.answer);
    }
  };

  const handleIceCandidate = async (data: any) => {
    const peerConnection = peerConnectionsRef.current.get(data.from_user_id);
    if (peerConnection) {
      await peerConnection.addIceCandidate(data.candidate);
    }
  };

  const handleUserStateChanged = (data: any) => {
    setState((prev) => ({
      ...prev,
      connections: prev.connections.map((conn) =>
        conn.user.id === data.user_id ? { ...conn, ...data.state } : conn,
      ),
    }));
  };

  const createPeerConnection = (userId: string): RTCPeerConnection => {
    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Add TURN servers for production
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.send(
          JSON.stringify({
            type: "ice_candidate",
            data: {
              candidate: event.candidate,
              target_user_id: userId,
            },
          }),
        );
      }
    };

    peerConnection.ontrack = (event) => {
      // Handle remote stream
      const remoteStream = event.streams[0];
      // Add remote audio/video element
      handleRemoteStream(userId, remoteStream);
    };

    peerConnection.onconnectionstatechange = () => {
      const connectionState = peerConnection.connectionState;
      setState((prev) => ({
        ...prev,
        connections: prev.connections.map((conn) =>
          conn.user.id === userId
            ? {
                ...conn,
                connection_quality: getConnectionQuality(connectionState),
              }
            : conn,
        ),
      }));
    };

    peerConnectionsRef.current.set(userId, peerConnection);
    return peerConnection;
  };

  const handleRemoteStream = (userId: string, stream: MediaStream) => {
    // Create audio element for remote user
    const audioElement = document.createElement("audio");
    audioElement.srcObject = stream;
    audioElement.autoplay = true;
    audioElement.id = `remote-audio-${userId}`;
    document.body.appendChild(audioElement);

    // If video track exists, create video element
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      const videoElement = document.createElement("video");
      videoElement.srcObject = stream;
      videoElement.autoplay = true;
      videoElement.muted = true; // Remote video should be muted
      videoElement.id = `remote-video-${userId}`;
      videoElement.className = "w-full h-full object-cover";

      // You'll need to add this to your video grid component
    }
  };

  const getConnectionQuality = (
    state: RTCPeerConnectionState,
  ): VoiceConnection["connection_quality"] => {
    switch (state) {
      case "connected":
        return "excellent";
      case "connecting":
        return "good";
      case "disconnected":
        return "disconnected";
      case "failed":
        return "poor";
      default:
        return "good";
    }
  };

  const loadAvailableDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      setAvailableDevices({
        cameras: devices.filter((device) => device.kind === "videoinput"),
        microphones: devices.filter((device) => device.kind === "audioinput"),
        speakers: devices.filter((device) => device.kind === "audiooutput"),
      });
    } catch (error) {
      console.error("Failed to enumerate devices:", error);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = state.local_user.is_muted;

        setState((prev) => ({
          ...prev,
          local_user: {
            ...prev.local_user,
            is_muted: !prev.local_user.is_muted,
          },
        }));

        // Broadcast state change
        socketRef.current?.send(
          JSON.stringify({
            type: "state_change",
            data: {
              is_muted: !state.local_user.is_muted,
            },
          }),
        );
      }
    }
  };

  const toggleVideo = async () => {
    try {
      if (!state.local_user.is_video_enabled) {
        // Enable video
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
        });

        const videoTrack = videoStream.getVideoTracks()[0];

        // Add video track to existing stream
        if (localStreamRef.current) {
          localStreamRef.current.addTrack(videoTrack);

          // Add video track to all peer connections
          peerConnectionsRef.current.forEach((peerConnection) => {
            peerConnection.addTrack(videoTrack, localStreamRef.current!);
          });
        }

        // Display local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      } else {
        // Disable video
        if (localStreamRef.current) {
          const videoTracks = localStreamRef.current.getVideoTracks();
          videoTracks.forEach((track) => {
            track.stop();
            localStreamRef.current?.removeTrack(track);
          });
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }
      }

      setState((prev) => ({
        ...prev,
        local_user: {
          ...prev.local_user,
          is_video_enabled: !prev.local_user.is_video_enabled,
        },
      }));

      // Broadcast state change
      socketRef.current?.send(
        JSON.stringify({
          type: "state_change",
          data: {
            is_video_enabled: !state.local_user.is_video_enabled,
          },
        }),
      );
    } catch (error) {
      console.error("Failed to toggle video:", error);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!state.local_user.is_screen_sharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace video track in all peer connections
        peerConnectionsRef.current.forEach(async (peerConnection) => {
          const sender = peerConnection
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");

          if (sender) {
            await sender.replaceTrack(screenTrack);
          } else {
            peerConnection.addTrack(screenTrack, screenStream);
          }
        });

        // Handle screen share end
        screenTrack.onended = () => {
          setState((prev) => ({
            ...prev,
            local_user: {
              ...prev.local_user,
              is_screen_sharing: false,
            },
          }));
        };
      } else {
        // Stop screen sharing - restore camera
        if (state.local_user.is_video_enabled) {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          const videoTrack = videoStream.getVideoTracks()[0];

          peerConnectionsRef.current.forEach(async (peerConnection) => {
            const sender = peerConnection
              .getSenders()
              .find((s) => s.track && s.track.kind === "video");

            if (sender) {
              await sender.replaceTrack(videoTrack);
            }
          });
        }
      }

      setState((prev) => ({
        ...prev,
        local_user: {
          ...prev.local_user,
          is_screen_sharing: !prev.local_user.is_screen_sharing,
        },
      }));
    } catch (error) {
      console.error("Failed to toggle screen share:", error);
    }
  };

  const leaveChannel = () => {
    socketRef.current?.send(
      JSON.stringify({
        type: "leave_channel",
      }),
    );

    cleanup();
    onLeave?.();
  };

  const cleanup = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((peerConnection) => {
      peerConnection.close();
    });
    peerConnectionsRef.current.clear();

    // Close WebSocket
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Remove remote audio/video elements
    state.connections.forEach((connection) => {
      const audioElement = document.getElementById(
        `remote-audio-${connection.user.id}`,
      );
      const videoElement = document.getElementById(
        `remote-video-${connection.user.id}`,
      );

      if (audioElement) audioElement.remove();
      if (videoElement) videoElement.remove();
    });

    setState((prev) => ({
      ...prev,
      is_connected: false,
      connections: [],
    }));
  };

  const VoiceControls: React.FC = () => (
    <div className="flex items-center justify-center space-x-4 p-4 bg-neutral-900 border-t border-neutral-700">
      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className={`p-3 rounded-full transition-colors ${
          state.local_user.is_muted
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-neutral-700 hover:bg-neutral-600 text-white"
        }`}
        title={state.local_user.is_muted ? "Unmute" : "Mute"}
      >
        {state.local_user.is_muted ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Video Button */}
      <button
        onClick={toggleVideo}
        className={`p-3 rounded-full transition-colors ${
          !state.local_user.is_video_enabled
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-neutral-700 hover:bg-neutral-600 text-white"
        }`}
        title={
          state.local_user.is_video_enabled
            ? "Turn off camera"
            : "Turn on camera"
        }
      >
        {state.local_user.is_video_enabled ? (
          <Video className="w-5 h-5" />
        ) : (
          <VideoOff className="w-5 h-5" />
        )}
      </button>

      {/* Screen Share Button */}
      <button
        onClick={toggleScreenShare}
        className={`p-3 rounded-full transition-colors ${
          state.local_user.is_screen_sharing
            ? "bg-kafuffle-primary hover:bg-kafuffle-primary/80 text-white"
            : "bg-neutral-700 hover:bg-neutral-600 text-white"
        }`}
        title={
          state.local_user.is_screen_sharing ? "Stop sharing" : "Share screen"
        }
      >
        {state.local_user.is_screen_sharing ? (
          <MonitorOff className="w-5 h-5" />
        ) : (
          <Monitor className="w-5 h-5" />
        )}
      </button>

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-3 rounded-full bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
        title="Voice settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Participants Button */}
      <button
        onClick={() => setShowParticipants(!showParticipants)}
        className="p-3 rounded-full bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
        title="Show participants"
      >
        <Users className="w-5 h-5" />
        {state.connections.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-kafuffle-primary text-white text-xs rounded-full flex items-center justify-center">
            {state.connections.length + 1}
          </span>
        )}
      </button>

      {/* Leave Button */}
      <button
        onClick={leaveChannel}
        className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
        title="Leave channel"
      >
        <PhoneOff className="w-5 h-5" />
      </button>
    </div>
  );

  const ParticipantsList: React.FC = () => (
    <div className="w-64 bg-neutral-800 border-l border-neutral-700 p-4">
      <h3 className="font-medium text-white mb-4">
        Participants ({state.connections.length + 1})
      </h3>

      <div className="space-y-3">
        {/* Current user */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-kafuffle-primary flex items-center justify-center text-white text-sm">
              {currentUser.username?.charAt(0).toUpperCase()}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-neutral-800 ${
                state.local_user.is_muted ? "bg-red-500" : "bg-green-500"
              }`}
            />
          </div>
          <div className="flex-1">
            <div className="text-white text-sm font-medium">
              {currentUser.username} (You)
            </div>
            <div className="text-xs text-neutral-400">
              {state.local_user.is_muted ? "Muted" : "Speaking"}
            </div>
          </div>
        </div>

        {/* Other participants */}
        {state.connections.map((connection) => (
          <div key={connection.user.id} className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-kafuffle-primary flex items-center justify-center text-white text-sm">
                {connection.user.username?.charAt(0).toUpperCase()}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-neutral-800 ${
                  connection.is_muted
                    ? "bg-red-500"
                    : connection.is_speaking
                      ? "bg-green-500"
                      : "bg-neutral-500"
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-medium">
                {connection.user.username}
              </div>
              <div className="text-xs text-neutral-400">
                {connection.is_muted
                  ? "Muted"
                  : connection.is_speaking
                    ? "Speaking"
                    : "Connected"}
              </div>
            </div>
            <div
              className={`w-2 h-2 rounded-full ${
                connection.connection_quality === "excellent"
                  ? "bg-green-500"
                  : connection.connection_quality === "good"
                    ? "bg-yellow-500"
                    : connection.connection_quality === "poor"
                      ? "bg-red-500"
                      : "bg-neutral-500"
              }`}
              title={`Connection: ${connection.connection_quality}`}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const VideoGrid: React.FC = () => {
    const videoParticipants = state.connections.filter(
      (conn) => conn.is_video_enabled,
    );
    const showLocalVideo =
      state.local_user.is_video_enabled || state.local_user.is_screen_sharing;
    const totalVideos = videoParticipants.length + (showLocalVideo ? 1 : 0);

    if (totalVideos === 0) {
      return (
        <div className="flex-1 flex items-center justify-center bg-neutral-900">
          <div className="text-center">
            <Video className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">No video streams</p>
          </div>
        </div>
      );
    }

    const gridCols = Math.ceil(Math.sqrt(totalVideos));
    const gridRows = Math.ceil(totalVideos / gridCols);

    return (
      <div
        className="flex-1 p-4 grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`,
        }}
      >
        {/* Local video */}
        {showLocalVideo && (
          <div className="relative bg-neutral-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {currentUser.username} (You)
            </div>
            {state.local_user.is_screen_sharing && (
              <div className="absolute top-2 right-2 bg-kafuffle-primary text-white px-2 py-1 rounded text-xs">
                Sharing Screen
              </div>
            )}
          </div>
        )}

        {/* Remote videos */}
        {videoParticipants.map((connection) => (
          <div
            key={connection.user.id}
            className="relative bg-neutral-800 rounded-lg overflow-hidden"
          >
            <div
              id={`remote-video-container-${connection.user.id}`}
              className="w-full h-full"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {connection.user.username}
            </div>
            {connection.is_screen_sharing && (
              <div className="absolute top-2 right-2 bg-kafuffle-primary text-white px-2 py-1 rounded text-xs">
                Sharing Screen
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (state.error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <PhoneOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Connection Failed
          </h3>
          <p className="text-neutral-400 mb-4">{state.error}</p>
          <button
            onClick={initializeVoiceChat}
            className="px-4 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded-lg text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (state.is_connecting) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-kafuffle-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white">Connecting to voice channel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900">
      {/* Header */}
      <div className="p-4 border-b border-neutral-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            🎙️ {channel.name}
          </h2>
          <div className="flex items-center space-x-2 text-sm text-neutral-400">
            <Users className="w-4 h-4" />
            <span>{state.connections.length + 1} connected</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <VideoGrid />
        {showParticipants && <ParticipantsList />}
      </div>

      {/* Controls */}
      <VoiceControls />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Voice Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Microphone
                </label>
                <select
                  value={state.local_user.microphone_device || ""}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      local_user: {
                        ...prev.local_user,
                        microphone_device: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-kafuffle-primary"
                >
                  {availableDevices.microphones.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label ||
                        `Microphone ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Camera
                </label>
                <select
                  value={state.local_user.camera_device || ""}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      local_user: {
                        ...prev.local_user,
                        camera_device: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-kafuffle-primary"
                >
                  {availableDevices.cameras.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Speaker
                </label>
                <select
                  value={state.local_user.speaker_device || ""}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      local_user: {
                        ...prev.local_user,
                        speaker_device: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:outline-none focus:border-kafuffle-primary"
                >
                  {availableDevices.speakers.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-kafuffle-primary hover:bg-kafuffle-primary/80 rounded text-white transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Voice channel indicator component for sidebar
export const VoiceChannelIndicator: React.FC<{
  channel: EnhancedChannel;
  participants: EnhancedUser[];
  onJoin: () => void;
}> = ({ channel, participants, onJoin }) => (
  <div
    onClick={onJoin}
    className="flex items-center justify-between p-2 hover:bg-neutral-700 rounded cursor-pointer group"
  >
    <div className="flex items-center space-x-2">
      <Volume2 className="w-4 h-4 text-neutral-400" />
      <span className="text-neutral-300 group-hover:text-white transition-colors">
        {channel.name}
      </span>
    </div>

    {participants.length > 0 && (
      <div className="flex items-center space-x-1">
        <div className="flex -space-x-1">
          {participants.slice(0, 3).map((user) => (
            <div
              key={user.id}
              className="w-5 h-5 rounded-full bg-kafuffle-primary flex items-center justify-center text-white text-xs border border-neutral-800"
              title={user.username}
            >
              {user.username?.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
        {participants.length > 3 && (
          <span className="text-xs text-neutral-500">
            +{participants.length - 3}
          </span>
        )}
      </div>
    )}
  </div>
);
