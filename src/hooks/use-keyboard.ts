// hooks/use-keyboard.ts
import { useEffect } from "react";

interface UseKeyboardProps {
  key: string;
  callback: () => void;
  deps?: React.DependencyList;
  disabled?: boolean;
}

export const useKeyboard = ({
  key,
  callback,
  deps = [],
  disabled = false,
}: UseKeyboardProps) => {
  useEffect(() => {
    if (disabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === key) {
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [key, disabled, ...deps]);
};
