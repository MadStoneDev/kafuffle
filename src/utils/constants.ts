// utils/constants.ts
export const APP_CONFIG = {
  APP_NAME: "Kafuffle",
  MAX_MESSAGE_LENGTH: 2000,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  TYPING_TIMEOUT: 3000, // 3 seconds
  PRESENCE_INTERVAL: 30000, // 30 seconds
  MESSAGE_BATCH_SIZE: 50,
} as const;

export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  DASHBOARD: "/dashboard",
  WORKSPACE: (id: string) => `/workspace/${id}`,
  PROJECT: (workspaceId: string, projectId: string) =>
    `/workspace/${workspaceId}/project/${projectId}`,
  CHANNEL: (workspaceId: string, projectId: string, channelId: string) =>
    `/workspace/${workspaceId}/project/${projectId}/channel/${channelId}`,
} as const;

export const UI_CONFIG = {
  SIDEBAR_WIDTH: "240px",
  HEADER_HEIGHT: "48px",
  MESSAGE_GROUP_TIMEOUT: 300000, // 5 minutes
  ANIMATION_DURATION: "200ms",
} as const;
