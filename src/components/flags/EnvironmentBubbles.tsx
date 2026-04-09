"use client";

import type { EnvSummary } from "@/lib/types";

interface EnvironmentBubblesProps {
  environments: Record<string, EnvSummary>;
  selectedEnv: string;
}

function abbreviate(slug: string): string {
  if (slug.length <= 4) return slug;
  return slug.slice(0, 3);
}

export function EnvironmentBubbles({
  environments,
  selectedEnv,
}: EnvironmentBubblesProps) {
  const entries = Object.entries(environments);

  if (!entries.length) return null;

  return (
    <div className="flex items-center gap-3">
      {entries.map(([slug, summary]) => (
        <div
          key={slug}
          className={`flex flex-col items-center gap-0.5 ${
            slug === selectedEnv ? "opacity-100" : "opacity-60 hover:opacity-80"
          }`}
          title={`${slug}: ${summary.enabled ? "enabled" : "disabled"}, ${summary.rule_count} rule${summary.rule_count !== 1 ? "s" : ""}`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                summary.enabled ? "bg-emerald-400" : "bg-slate-500"
              }`}
            />
            <span className="text-xs font-medium text-slate-400">
              {abbreviate(slug)}
            </span>
          </div>
          {summary.rule_count > 0 && (
            <span className="text-[10px] text-slate-500">
              {summary.rule_count} {summary.rule_count === 1 ? "rule" : "rules"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
