"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/types";

function getUserFromCookie(): User | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )fb_user=([^;]*)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getUserFromCookie());
    setIsLoading(false);
  }, []);

  return { user, isLoading };
}
