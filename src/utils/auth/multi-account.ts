// /utils/auth/multi-account.ts
import { createClient } from "@/utils/supabase/client";

export interface StoredAccount {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  session_token: string;
  last_used: string;
}

const ACCOUNTS_KEY = "kafuffle_accounts";
const MAX_STORED_ACCOUNTS = 5;

export async function getStoredAccounts(): Promise<StoredAccount[]> {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    if (stored) {
      const accounts = JSON.parse(stored);
      return accounts.sort(
        (a: StoredAccount, b: StoredAccount) =>
          new Date(b.last_used).getTime() - new Date(a.last_used).getTime(),
      );
    }
  } catch (error) {
    console.warn("Failed to parse stored accounts:", error);
  }
  return [];
}

export async function storeCurrentAccount(): Promise<void> {
  const supabase = createClient();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!session || !user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, display_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    const accounts = await getStoredAccounts();
    const filteredAccounts = accounts.filter((acc) => acc.id !== user.id);

    const newAccount: StoredAccount = {
      id: user.id,
      email: user.email!,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      session_token: btoa(JSON.stringify(session)),
      last_used: new Date().toISOString(),
    };

    const updatedAccounts = [newAccount, ...filteredAccounts].slice(
      0,
      MAX_STORED_ACCOUNTS,
    );
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
  } catch (error) {
    console.error("Failed to store current account:", error);
  }
}

export async function switchToAccount(accountId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    const accounts = await getStoredAccounts();
    const account = accounts.find((acc) => acc.id === accountId);

    if (!account) return false;

    const session = JSON.parse(atob(account.session_token));
    const { error } = await supabase.auth.setSession(session);

    if (error) {
      console.error("Failed to restore session:", error);
      await removeStoredAccount(accountId);
      return false;
    }

    account.last_used = new Date().toISOString();
    const updatedAccounts = accounts.map((acc) =>
      acc.id === accountId ? account : acc,
    );

    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts));
    return true;
  } catch (error) {
    console.error("Failed to switch account:", error);
    return false;
  }
}

export async function removeStoredAccount(accountId: string): Promise<void> {
  try {
    const accounts = await getStoredAccounts();
    const filteredAccounts = accounts.filter((acc) => acc.id !== accountId);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(filteredAccounts));
  } catch (error) {
    console.error("Failed to remove stored account:", error);
  }
}

// Simplified hook
import { useState, useEffect } from "react";

export function useMultiAccount() {
  const [storedAccounts, setStoredAccounts] = useState<StoredAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadAccounts() {
      const accounts = await getStoredAccounts();
      setStoredAccounts(accounts);
    }
    loadAccounts();
  }, []);

  const switchAccount = async (accountId: string) => {
    setIsLoading(true);
    try {
      const success = await switchToAccount(accountId);
      if (success) {
        window.location.reload();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAccount = async (accountId: string) => {
    await removeStoredAccount(accountId);
    const accounts = await getStoredAccounts();
    setStoredAccounts(accounts);
  };

  const storeCurrentUser = async () => {
    await storeCurrentAccount();
    const accounts = await getStoredAccounts();
    setStoredAccounts(accounts);
  };

  return {
    storedAccounts,
    isLoading,
    switchAccount,
    removeAccount,
    storeCurrentUser,
  };
}
