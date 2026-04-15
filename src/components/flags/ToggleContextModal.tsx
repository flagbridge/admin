"use client";

import { AlertTriangle, FileText, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { ProductCard } from "@/lib/types";

interface ToggleContextModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flagKey: string;
  envName: string;
  currentlyEnabled: boolean;
  productCard: ProductCard | null | undefined;
  onConfirm: () => void;
  isPending: boolean;
}

export function ToggleContextModal({
  open,
  onOpenChange,
  flagKey,
  envName,
  currentlyEnabled,
  productCard,
  onConfirm,
  isPending,
}: ToggleContextModalProps) {
  const t = useTranslations("toggleContext");
  const tc = useTranslations("common");

  const willEnable = !currentlyEnabled;
  const title = willEnable
    ? t("enableTitle", { key: flagKey })
    : t("disableTitle", { key: flagKey });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title}>
      <div className="space-y-4">
        {/* Environment impact warning */}
        <div className="flex items-start gap-3 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-sm text-orange-300">
            {t("impactWarning", { env: envName })}
          </p>
        </div>

        {/* Product Card context */}
        {productCard ? (
          <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
            {productCard.hypothesis && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-0.5">
                    {t("hypothesis")}
                  </p>
                  <p className="text-sm text-slate-200">
                    {productCard.hypothesis}
                  </p>
                </div>
              </div>
            )}
            {productCard.success_metrics && (
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-0.5">
                    {t("successMetrics")}
                  </p>
                  <p className="text-sm text-slate-200">
                    {productCard.success_metrics}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">{t("noContext")}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {tc("cancel")}
          </Button>
          <Button
            type="button"
            variant={willEnable ? "primary" : "destructive"}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={isPending}
          >
            {isPending ? tc("loading") : t("confirm")}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
