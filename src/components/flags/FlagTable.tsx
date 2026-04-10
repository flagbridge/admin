"use client";

import { Flag as FlagIcon, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { EnvironmentBubbles } from "@/components/flags/EnvironmentBubbles";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { Toggle } from "@/components/ui/Toggle";
import { type FlagWithEnvs, useDeleteFlag } from "@/hooks/useFlags";
import { Link } from "@/i18n/navigation";
import type { Flag } from "@/lib/types";

interface FlagTableProps {
  flags: FlagWithEnvs[];
  projectSlug: string;
  selectedEnv: string;
  onToggle: (flagKey: string, enabled: boolean) => void;
  togglePending?: boolean;
}

const typeBadgeVariant = {
  boolean: "blue" as const,
  string: "warning" as const,
  number: "success" as const,
};

export function FlagTable({
  flags,
  projectSlug,
  selectedEnv,
  onToggle,
  togglePending,
}: FlagTableProps) {
  const t = useTranslations("flags");
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<Flag | null>(null);
  const deleteFlag = useDeleteFlag(projectSlug);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteFlag.mutate(deleteTarget.key, {
      onSuccess: () => toast(t("deleted"), "success"),
      onError: () => toast(t("deleteError"), "error"),
    });
  };

  if (!flags.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
        <FlagIcon className="mb-4 h-12 w-12 text-slate-600" />
        <h2 className="text-lg font-medium text-slate-300">{t("noFlags")}</h2>
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
                {t("key")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-400">
                {t("type")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-400">
                {t("environments")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-400">
                {t("enabled")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-400">
                {t("updatedAt")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-400">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {flags.map((flag) => (
              <tr
                key={flag.id}
                className="hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/projects/${projectSlug}/flags/${flag.key}`}
                    className="font-mono text-sm text-blue-400 hover:text-blue-300"
                  >
                    {flag.key}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={typeBadgeVariant[flag.type]}>
                    {flag.type}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <EnvironmentBubbles
                    environments={flag.environments ?? {}}
                    selectedEnv={selectedEnv}
                  />
                </td>
                <td className="px-4 py-3">
                  <Toggle
                    checked={flag.environments?.[selectedEnv]?.enabled ?? false}
                    onChange={(checked) => onToggle(flag.key, checked)}
                    disabled={togglePending}
                  />
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(flag.updated_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-400"
                    onClick={() => setDeleteTarget(flag)}
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
        title={t("editTitle")}
        description={
          deleteTarget ? t("deleteConfirm", { key: deleteTarget.key }) : ""
        }
        onConfirm={handleDelete}
        loading={deleteFlag.isPending}
      />
    </>
  );
}
