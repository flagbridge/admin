"use client";

import { FileText, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { useProductCard, useUpsertProductCard } from "@/hooks/useProductCard";
import type { ProductCardInput, ProductCardStatus } from "@/lib/types";

interface ProductCardTabProps {
  projectSlug: string;
  flagKey: string;
}

const statusOptions: { value: ProductCardStatus; labelKey: string }[] = [
  { value: "planning", labelKey: "planning" },
  { value: "active", labelKey: "active" },
  { value: "rolled_out", labelKey: "rolledOut" },
  { value: "archived", labelKey: "archived" },
];

export function ProductCardTab({ projectSlug, flagKey }: ProductCardTabProps) {
  const t = useTranslations("productCard");
  const tc = useTranslations("common");
  const { toast } = useToast();

  const { data: card, isLoading } = useProductCard(projectSlug, flagKey);
  const upsert = useUpsertProductCard(projectSlug, flagKey);

  const [hypothesis, setHypothesis] = useState("");
  const [successMetrics, setSuccessMetrics] = useState("");
  const [goNoGo, setGoNoGo] = useState("");
  const [status, setStatus] = useState<ProductCardStatus>("planning");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (card && !initialized) {
      setHypothesis(card.hypothesis || "");
      setSuccessMetrics(card.success_metrics || "");
      setGoNoGo(card.go_no_go || "");
      setStatus(card.status || "planning");
      setInitialized(true);
    }
    if (card === null && !initialized) {
      setInitialized(true);
    }
  }, [card, initialized]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const data: ProductCardInput = {
      hypothesis,
      success_metrics: successMetrics,
      go_no_go: goNoGo,
      status,
    };
    try {
      await upsert.mutateAsync(data);
      toast(t("saved"), "success");
    } catch {
      toast(t("saveError"), "error");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
      </div>
    );
  }

  if (!card && initialized) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 py-12 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-slate-600" />
        <p className="text-sm font-medium text-slate-300">{t("noCard")}</p>
        <p className="mt-1 text-xs text-slate-500">{t("noCardDescription")}</p>
        <Button
          className="mt-4"
          onClick={() => {
            upsert.mutate(
              { hypothesis: "", success_metrics: "", go_no_go: "", status: "planning" },
              {
                onSuccess: () => {
                  setInitialized(false);
                  toast(t("saved"), "success");
                },
                onError: () => toast(t("saveError"), "error"),
              },
            );
          }}
        >
          <FileText className="h-4 w-4" />
          {t("addCard")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div>
        <label
          htmlFor="pc-hypothesis"
          className="mb-1.5 block text-sm font-medium text-slate-300"
        >
          {t("hypothesis")}
        </label>
        <textarea
          id="pc-hypothesis"
          value={hypothesis}
          onChange={(e) => setHypothesis(e.target.value)}
          placeholder={t("hypothesisPlaceholder")}
          rows={3}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="pc-metrics"
          className="mb-1.5 block text-sm font-medium text-slate-300"
        >
          {t("successMetrics")}
        </label>
        <textarea
          id="pc-metrics"
          value={successMetrics}
          onChange={(e) => setSuccessMetrics(e.target.value)}
          placeholder={t("successMetricsPlaceholder")}
          rows={3}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="pc-gonogo"
          className="mb-1.5 block text-sm font-medium text-slate-300"
        >
          {t("goNoGo")}
        </label>
        <textarea
          id="pc-gonogo"
          value={goNoGo}
          onChange={(e) => setGoNoGo(e.target.value)}
          placeholder={t("goNoGoPlaceholder")}
          rows={2}
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <Select
        id="pc-status"
        label={t("status")}
        value={status}
        onChange={(e) => setStatus(e.target.value as ProductCardStatus)}
        options={statusOptions.map((opt) => ({
          value: opt.value,
          label: t(opt.labelKey),
        }))}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={upsert.isPending}>
          <Save className="h-4 w-4" />
          {upsert.isPending ? tc("loading") : tc("save")}
        </Button>
      </div>
    </form>
  );
}
