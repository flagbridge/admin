"use client";

import { AlertCircle, Calendar } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FlagToggle } from "@/components/flags/FlagToggle";
import { TargetingRules } from "@/components/flags/TargetingRules";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useEnvironments } from "@/hooks/useEnvironments";
import {
  useFlag,
  useFlagRules,
  useSetRules,
  useToggleFlagState,
} from "@/hooks/useFlag";
import type { RuleCondition } from "@/lib/types";

const typeBadgeVariant = {
  boolean: "blue" as const,
  string: "warning" as const,
  number: "success" as const,
};

export default function FlagDetailPage() {
  const params = useParams<{ slug: string; key: string }>();
  const { slug, key: flagKey } = params;
  const t = useTranslations("flags");
  const tn = useTranslations("nav");
  const { toast } = useToast();

  const { data: flag, isLoading, isError } = useFlag(slug, flagKey);
  const { data: environments } = useEnvironments(slug);
  const [activeEnv, setActiveEnv] = useState<string>("");
  const selectedEnv = activeEnv || environments?.[0]?.slug || "";

  const toggleState = useToggleFlagState(slug, flagKey);
  const { data: rules } = useFlagRules(slug, flagKey, selectedEnv);
  const setRules = useSetRules(slug, flagKey);

  const currentState = flag?.states?.[selectedEnv];
  const currentRules = rules || flag?.rules?.[selectedEnv] || [];

  if (isLoading) {
    return (
      <>
        <TopBar breadcrumbs={[{ label: tn("projects"), href: "/" }]} />
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
        </div>
      </>
    );
  }

  if (isError || !flag) {
    return (
      <>
        <TopBar
          breadcrumbs={[
            { label: tn("projects"), href: "/" },
            { label: slug, href: `/projects/${slug}` },
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <p className="text-sm text-slate-400">{t("errorLoad")}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: tn("projects"), href: "/" },
          { label: slug, href: `/projects/${slug}` },
          { label: flagKey },
        ]}
      />
      <main className="mx-auto max-w-[1200px] p-6">
        {/* Flag header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold font-mono text-slate-50">
              {flag.key}
            </h1>
            <Badge variant={typeBadgeVariant[flag.type]}>{flag.type}</Badge>
          </div>
          {flag.description && (
            <p className="text-sm text-slate-400 mb-2">{flag.description}</p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            {t("createdAt")}: {new Date(flag.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Environment tabs */}
        {environments && environments.length > 0 && (
          <div className="mb-6 flex gap-1 rounded-lg border border-slate-700 bg-slate-800 p-1 w-fit">
            {environments.map((env) => (
              <button
                key={env.slug}
                type="button"
                onClick={() => setActiveEnv(env.slug)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedEnv === env.slug
                    ? "bg-slate-700 text-slate-50"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {env.name}
              </button>
            ))}
          </div>
        )}

        {/* Toggle */}
        <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">
              {t("enabled")}
            </span>
            <FlagToggle
              enabled={currentState?.enabled ?? false}
              onChange={(enabled) => {
                toggleState.mutate(
                  { envSlug: selectedEnv, enabled },
                  {
                    onError: () => toast(t("toggleError"), "error"),
                  },
                );
              }}
              disabled={toggleState.isPending}
            />
          </div>
        </div>

        {/* Targeting rules */}
        <TargetingRules
          rules={currentRules}
          onAddRule={(conditions: RuleCondition[], resultValue: string) => {
            const newRule = {
              name: "",
              priority: currentRules.length,
              conditions,
              value: resultValue,
              enabled: true,
            };
            const existingInputs = currentRules.map((r) => ({
              name: r.name,
              priority: r.priority,
              conditions: r.conditions,
              value: r.value,
              enabled: r.enabled,
            }));
            setRules.mutate(
              {
                envSlug: selectedEnv,
                rules: [...existingInputs, newRule],
              },
              {
                onSuccess: () => toast(t("ruleAdded"), "success"),
                onError: () => toast(t("ruleAddError"), "error"),
              },
            );
          }}
          onDeleteRule={(ruleId: string) => {
            const remaining = currentRules
              .filter((r) => r.id !== ruleId)
              .map((r, i) => ({
                name: r.name,
                priority: i,
                conditions: r.conditions,
                value: r.value,
                enabled: r.enabled,
              }));
            setRules.mutate(
              {
                envSlug: selectedEnv,
                rules: remaining,
              },
              {
                onSuccess: () => toast(t("ruleDeleted"), "success"),
                onError: () => toast(t("ruleDeleteError"), "error"),
              },
            );
          }}
          isPending={setRules.isPending}
        />
      </main>
    </>
  );
}
