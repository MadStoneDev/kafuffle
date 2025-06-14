// hooks/useTyping.ts
import { useState, useEffect, useCallback } from "react";

interface UseTypingProps {
  onStartTyping: () => void;
  onStopTyping: () => void;
  timeout?: number;
}

export const useTyping = ({
  onStartTyping,
  onStopTyping,
  timeout = 3000,
}: UseTypingProps) => {
  const [isTyping, setIsTyping] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      onStartTyping();
    }

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(() => {
      setIsTyping(false);
      onStopTyping();
    }, timeout);

    setTimeoutId(newTimeoutId);
  }, [isTyping, timeoutId, onStartTyping, onStopTyping, timeout]);

  const stopTyping = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsTyping(false);
    onStopTyping();
  }, [timeoutId, onStopTyping]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return { isTyping, startTyping, stopTyping };
};
