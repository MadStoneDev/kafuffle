// hooks/use-auth.ts
import { useState, useEffect } from "react";
import { DatabaseService } from "@/lib/database";
import type { User } from "@/types";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await DatabaseService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadUser();
  };

  return { user, loading, error, refresh };
};
