"use client";

import { Calendar, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import { ToggleContextModal } from "@/components/flags/ToggleContextModal";
import { useProductCard } from "@/hooks/useProductCard";
import { Link } from "@/i18n/navigation";
import type { FlagWithEnvs } from "@/hooks/useFlags";

interface FlagCardProps {
  flag: FlagWithEnvs;
  projectSlug: string;
  selectedEnv: string;
  onToggle: (flagKey: string, enabled: boolean) => void;
  togglePending?: boolean;
}

const statusColors: Record<string, string> = {
  planning: "bg-slate-500/20 text-slate-400",
  active: "bg-green-500/20 text-green-400",
  rolled_out: "bg-blue-500/20 text-blue-400",
  archived: "bg-orange-500/20 text-orange-400",
};

export function FlagCard({
  flag,
  projectSlug,
  selectedEnv,
  onToggle,
  togglePending,
}: FlagCardProps) {
  const t = useTranslations("flags");
  const tpc = useTranslations("productCard");
  const { data: card } = useProductCard(projectSlug, flag.key);
  const [showToggleModal, setShowToggleModal] = useState(false);

  const isEnabled = flag.environments?.[selectedEnv]?.enabled ?? false;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5 transition-colors hover:border-slate-600">
      <div className="flex items-start justify-between mb-3">
        <Link
          href={`/projects/${projectSlug}/flags/${flag.key}`}
          className="group"
        >
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
            {flag.name || flag.key}
          </h3>
          <p className="text-xs font-mono text-slate-500 mt-0.5">{flag.key}</p>
        </Link>
        <Toggle
          checked={isEnabled}
          onChange={() => setShowToggleModal(true)}
          disabled={togglePending}
        />
      </div>

      <ToggleContextModal
        open={showToggleModal}
        onOpenChange={setShowToggleModal}
        flagKey={flag.key}
        envName={selectedEnv}
        currentlyEnabled={isEnabled}
        productCard={card}
        onConfirm={() => onToggle(flag.key, !isEnabled)}
        isPending={togglePending ?? false}
      />

      {flag.description && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">
          {flag.description}
        </p>
      )}

      {card ? (
        <div className="space-y-2 mb-3">
          {card.hypothesis && (
            <div className="flex items-start gap-2">
              <FileText className="h-3.5 w-3.5 text-slate-500 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-300 line-clamp-2">
                {card.hypothesis}
              </p>
            </div>
          )}
          {card.status && (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[card.status] || statusColors.planning}`}
            >
              {tpc(card.status === "rolled_out" ? "rolledOut" : card.status)}
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-600 italic mb-3">
          {tpc("noCard")}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(flag.updated_at).toLocaleDateString()}
        </div>
        <Badge variant={isEnabled ? "success" : "default"} className="text-xs">
          {isEnabled ? t("enabled") : "Off"}
        </Badge>
      </div>
    </div>
  );
}
