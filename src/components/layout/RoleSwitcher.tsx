"use client";

import { ArrowLeftRight, Eye, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import { useViewMode } from "@/hooks/useViewMode";

export function RoleSwitcher() {
  const { viewMode, setViewMode } = useViewMode();
  const t = useTranslations("viewMode");

  const isProduct = viewMode === "product";

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">{t("currentView")}</p>
      <button
        type="button"
        onClick={() => setViewMode(isProduct ? "engineering" : "product")}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100"
      >
        {isProduct ? (
          <Eye className="h-4 w-4 text-purple-400" />
        ) : (
          <Wrench className="h-4 w-4 text-blue-400" />
        )}
        <span className="flex-1 text-left">
          {isProduct ? t("productView") : t("engineeringView")}
        </span>
        <ArrowLeftRight className="h-3.5 w-3.5 text-slate-500" />
      </button>
    </div>
  );
}
