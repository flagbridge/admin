"use client";

import { AlertCircle, ScrollText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AuditLogTable } from "@/components/audit/AuditLogTable";
import { TopBar } from "@/components/layout/TopBar";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useProjects } from "@/hooks/useProjects";

export default function AuditLogPage() {
  const t = useTranslations("audit");
  const tn = useTranslations("nav");
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const projectId = selectedProjectId || projects?.[0]?.id || "";
  const { data, isLoading, isError } = useAuditLog(projectId);

  return (
    <>
      <TopBar breadcrumbs={[{ label: tn("auditLog") }]} />
      <main className="mx-auto max-w-[1200px] p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScrollText className="h-5 w-5 text-slate-400" />
            <h1 className="text-lg font-semibold text-slate-50">
              {t("title")}
            </h1>
          </div>

          {!projectsLoading && projects && projects.length > 1 && (
            <select
              value={projectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {isLoading || projectsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <p className="text-sm text-slate-400">{t("errorLoad")}</p>
          </div>
        ) : (
          <AuditLogTable entries={data?.entries ?? []} />
        )}
      </main>
    </>
  );
}
