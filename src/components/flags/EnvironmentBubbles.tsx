"use client";

import type { EnvSummary } from "@/lib/types";
import { Tooltip } from "@/components/ui/Tooltip";

interface EnvironmentBubblesProps {
  environments: Record<string, EnvSummary>;
  selectedEnv: string;
}

function abbreviate(slug: string): string {
  if (slug.length <= 4) return slug;
  return slug.slice(0, 3);
}

function TooltipContent({ slug, summary }: { slug: string; summary: EnvSummary }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            summary.enabled ? "bg-emerald-400" : "bg-slate-500"
          }`}
        />
        <span className="font-medium">{slug}</span>
      </div>
      <div className="text-slate-400">
        {summary.enabled ? "Enabled" : "Disabled"}
        {summary.rule_count > 0 && (
          <> &middot; {summary.rule_count} targeting {summary.rule_count === 1 ? "rule" : "rules"}</>
        )}
      </div>
    </div>
  );
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
        <Tooltip
          key={slug}
          content={<TooltipContent slug={slug} summary={summary} />}
        >
          <div
            className={`flex flex-col items-center gap-0.5 ${
              slug === selectedEnv ? "opacity-100" : "opacity-60 hover:opacity-80"
            }`}
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
        </Tooltip>
      ))}
    </div>
  );
}
