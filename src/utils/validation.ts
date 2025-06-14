// utils/validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): boolean => {
  // Username should be 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const validateProjectName = (name: string): boolean => {
  // Project name should be 1-50 characters, not just whitespace
  return name.trim().length >= 1 && name.trim().length <= 50;
};

export const validateChannelName = (name: string): boolean => {
  // Channel name should be 1-30 characters, lowercase, alphanumeric and hyphens
  const channelRegex = /^[a-z0-9-]{1,30}$/;
  return channelRegex.test(name);
};
