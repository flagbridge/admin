"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ProjectRole, ViewMode } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

interface ViewModeContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  userRole: ProjectRole;
  hasCompletedOnboarding: boolean;
  completeOnboarding: (role: ProjectRole) => void;
}

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

const STORAGE_KEY_VIEW = "fb_view_mode";
const STORAGE_KEY_ONBOARDING = "fb_onboarding_done";
const STORAGE_KEY_ROLE = "fb_selected_role";

function getDefaultViewMode(role: ProjectRole): ViewMode {
  return role === "product" || role === "viewer" ? "product" : "engineering";
}

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const serverRole = (user?.role as ProjectRole) || "engineer";

  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return getDefaultViewMode(serverRole);
    const stored = localStorage.getItem(STORAGE_KEY_VIEW);
    if (stored === "product" || stored === "engineering") return stored;
    return getDefaultViewMode(serverRole);
  });

  const [selectedRole, setSelectedRole] = useState<ProjectRole>(() => {
    if (typeof window === "undefined") return serverRole;
    const stored = localStorage.getItem(STORAGE_KEY_ROLE);
    if (stored) return stored as ProjectRole;
    return serverRole;
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY_ONBOARDING) === "true";
  });

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(STORAGE_KEY_VIEW, mode);
  }, []);

  const completeOnboarding = useCallback(
    (role: ProjectRole) => {
      setSelectedRole(role);
      localStorage.setItem(STORAGE_KEY_ROLE, role);
      setHasCompletedOnboarding(true);
      localStorage.setItem(STORAGE_KEY_ONBOARDING, "true");
      setViewMode(getDefaultViewMode(role));
    },
    [setViewMode],
  );

  useEffect(() => {
    if (user?.role && !localStorage.getItem(STORAGE_KEY_ROLE)) {
      setSelectedRole(user.role as ProjectRole);
    }
  }, [user?.role]);

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        setViewMode,
        userRole: selectedRole,
        hasCompletedOnboarding,
        completeOnboarding,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return ctx;
}
