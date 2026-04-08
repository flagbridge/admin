"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full">
      <Sidebar userEmail={user?.email} onSignOut={handleSignOut} />
      <div className="flex-1 ml-60">{children}</div>
    </div>
  );
}
