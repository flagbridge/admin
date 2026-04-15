"use client";

import { KeyRound, LayoutDashboard, ScrollText } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { useViewMode } from "@/hooks/useViewMode";
import { Link, usePathname } from "@/i18n/navigation";

const allNavItems = [
  { href: "/", icon: LayoutDashboard, labelKey: "dashboard" as const, views: ["product", "engineering"] as const },
  { href: "/api-keys", icon: KeyRound, labelKey: "apiKeys" as const, views: ["engineering"] as const },
  { href: "/audit", icon: ScrollText, labelKey: "auditLog" as const, views: ["product", "engineering"] as const },
];

interface SidebarProps {
  userEmail?: string;
  onSignOut: () => void;
}

export function Sidebar({ userEmail, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const tr = useTranslations("roles");
  const { viewMode, userRole } = useViewMode();

  const navItems = allNavItems.filter((item) =>
    item.views.includes(viewMode),
  );

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-30 flex w-60 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex items-center gap-3 px-5 py-4">
        <Image
          src="/logo.svg"
          alt="FlagBridge"
          width={24}
          height={24}
          className="rounded"
        />
        <div className="h-5 w-px bg-slate-700" />
        <span className="text-sm font-medium text-slate-50">FlagBridge</span>
      </div>

      <div className="h-px bg-slate-800" />

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-slate-800 text-slate-50 border-l-[3px] border-blue-500 -ml-px"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-4 py-3 space-y-3">
        <RoleSwitcher />
        {userEmail && (
          <div>
            <p className="truncate text-sm text-slate-300">{userEmail}</p>
            <Badge
              variant={viewMode === "product" ? "warning" : "blue"}
              className="mt-1"
            >
              {tr(userRole)}
            </Badge>
          </div>
        )}
        <button
          type="button"
          onClick={onSignOut}
          className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          {tc("signOut")}
        </button>
      </div>
    </aside>
  );
}
