"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import type { AuditEntry } from "@/lib/types";

interface AuditLogTableProps {
  entries: AuditEntry[];
}

const actionVariant: Record<string, "blue" | "success" | "warning" | "error"> =
  {
    created: "success",
    updated: "blue",
    deleted: "error",
    toggled: "warning",
  };

function actionBadge(action: string) {
  const variant = actionVariant[action] ?? "blue";
  return <Badge variant={variant}>{action}</Badge>;
}

function formatChanges(changes: Record<string, unknown> | null): string {
  if (!changes) return "";
  const entries = Object.entries(changes);
  if (!entries.length) return "";
  return entries.map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ");
}

export function AuditLogTable({ entries }: AuditLogTableProps) {
  const t = useTranslations("audit");

  if (!entries.length) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">
        {t("noEntries")}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-800/50">
            <th className="px-4 py-3 font-medium text-slate-400">
              {t("action")}
            </th>
            <th className="px-4 py-3 font-medium text-slate-400">
              {t("entityType")}
            </th>
            <th className="px-4 py-3 font-medium text-slate-400">
              {t("changes")}
            </th>
            <th className="px-4 py-3 font-medium text-slate-400">
              {t("timestamp")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="hover:bg-slate-800/30 transition-colors"
            >
              <td className="px-4 py-3">{actionBadge(entry.action)}</td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-slate-300">
                  {entry.entity_type}
                </span>
              </td>
              <td className="px-4 py-3 max-w-[300px] truncate text-slate-400 text-xs">
                {formatChanges(entry.changes)}
              </td>
              <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                {new Date(entry.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
