"use client";

import { Copy, KeyRound, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useDeleteAPIKey } from "@/hooks/useAPIKeys";
import type { APIKey } from "@/lib/types";

interface APIKeyTableProps {
  keys: APIKey[];
}

const scopeVariant = {
  evaluation: "blue" as const,
  management: "warning" as const,
  full: "error" as const,
};

export function APIKeyTable({ keys }: APIKeyTableProps) {
  const t = useTranslations("apiKeys");
  const [deleteTarget, setDeleteTarget] = useState<APIKey | null>(null);
  const deleteKey = useDeleteAPIKey();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteKey.mutate(deleteTarget.id, {
      onSuccess: () => toast(t("deleted"), "success"),
      onError: () => toast(t("deleteError"), "error"),
    });
  };

  if (!keys.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
        <KeyRound className="mb-4 h-12 w-12 text-slate-600" />
        <h2 className="text-lg font-medium text-slate-300">{t("noKeys")}</h2>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/50">
              <th className="px-4 py-3 font-medium text-slate-400">
                {t("name")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-400">
                {t("keyPrefix")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-400">
                {t("scope")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-400">
                {t("createdAt")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-400">
                {t("lastUsed")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-400">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {keys.map((key) => (
              <tr
                key={key.id}
                className="hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-4 py-3 text-slate-200">{key.name}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(key.key_prefix);
                      toast(t("copied") ?? "Copied!", "success");
                    }}
                    className="group flex items-center gap-1.5 font-mono text-sm text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {key.key_prefix}...
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={scopeVariant[key.scope]}>{key.scope}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(key.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {key.last_used_at
                    ? new Date(key.last_used_at).toLocaleDateString()
                    : t("never")}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-400"
                    onClick={() => setDeleteTarget(key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("deleteTitle")}
        description={
          deleteTarget ? t("deleteConfirm", { name: deleteTarget.name }) : ""
        }
        onConfirm={handleDelete}
        loading={deleteKey.isPending}
      />
    </>
  );
}
