"use client";

import { Check, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useCreateFlag } from "@/hooks/useFlags";
import { useEnvironments } from "@/hooks/useEnvironments";
import { api } from "@/lib/api";
import type { ProductCard } from "@/lib/types";

interface FlagCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectSlug: string;
}

function toKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const TOTAL_STEPS = 5;

export function FlagCreationWizard({
  open,
  onOpenChange,
  projectSlug,
}: FlagCreationWizardProps) {
  const t = useTranslations("flagWizard");
  const tc = useTranslations("common");
  const { toast } = useToast();

  const createFlag = useCreateFlag(projectSlug);
  const { data: environments } = useEnvironments(projectSlug);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [selectedEnv, setSelectedEnv] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const generatedKey = toKey(name);

  const stepLabels = [
    t("stepName"),
    t("stepDescription"),
    t("stepProductCard"),
    t("stepEnvironment"),
    t("stepReview"),
  ];

  function canProceed(): boolean {
    if (step === 0) return name.trim().length > 0;
    return true;
  }

  function reset() {
    setStep(0);
    setName("");
    setDescription("");
    setHypothesis("");
    setSelectedEnv("");
    setIsCreating(false);
  }

  async function handleCreate() {
    setIsCreating(true);
    try {
      await createFlag.mutateAsync({
        key: generatedKey,
        type: "boolean",
        description: description || undefined,
      });

      if (hypothesis) {
        try {
          await api<ProductCard>(
            `/v1/projects/${projectSlug}/flags/${generatedKey}/product-card`,
            {
              method: "PUT",
              body: JSON.stringify({ hypothesis, status: "planning" }),
            },
          );
        } catch {
          // Best-effort — flag is already created, card can be added later
        }
      }

      toast(t("created"), "success");
      reset();
      onOpenChange(false);
    } catch {
      toast(t("createError"), "error");
      setIsCreating(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
      title={t("title")}
    >
      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-6">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                i < step
                  ? "bg-green-500/20 text-green-400"
                  : i === step
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-slate-700 text-slate-500"
              }`}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            {i < TOTAL_STEPS - 1 && (
              <ChevronRight className="h-3 w-3 text-slate-600" />
            )}
          </div>
        ))}
      </div>

      <p className="text-sm font-medium text-slate-300 mb-4">
        {stepLabels[step]}
      </p>

      {/* Step 0: Name */}
      {step === 0 && (
        <div className="space-y-3">
          <Input
            id="wizard-name"
            label={t("nameLabel")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            autoFocus
          />
          <p className="text-xs text-slate-500">{t("nameHint")}</p>
          {name && (
            <p className="text-xs text-slate-400">
              {t("generatedKey")}:{" "}
              <code className="font-mono text-blue-400">{generatedKey}</code>
            </p>
          )}
        </div>
      )}

      {/* Step 1: Description */}
      {step === 1 && (
        <div>
          <label
            htmlFor="wizard-desc"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            {t("descriptionLabel")}
          </label>
          <textarea
            id="wizard-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            rows={3}
            autoFocus
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Step 2: Product Card (hypothesis) */}
      {step === 2 && (
        <div>
          <label
            htmlFor="wizard-hypothesis"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            {t("stepProductCard")}
          </label>
          <textarea
            id="wizard-hypothesis"
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            placeholder="We believe that enabling this feature will..."
            rows={3}
            autoFocus
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Step 3: Environment */}
      {step === 3 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-400 mb-3">
            {t("environmentLabel")}
          </p>
          {environments?.map((env) => (
            <button
              key={env.slug}
              type="button"
              onClick={() => setSelectedEnv(env.slug)}
              className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm transition-all ${
                selectedEnv === env.slug
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600"
              }`}
            >
              <div
                className={`h-3 w-3 rounded-full ${
                  selectedEnv === env.slug ? "bg-blue-500" : "bg-slate-600"
                }`}
              />
              {env.name}
            </button>
          ))}
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">{t("reviewName")}</span>
            <span className="text-slate-100">{name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">{t("reviewKey")}</span>
            <code className="font-mono text-blue-400">{generatedKey}</code>
          </div>
          {description && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{t("reviewDescription")}</span>
              <span className="text-slate-100 text-right max-w-[60%]">
                {description}
              </span>
            </div>
          )}
          {hypothesis && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{t("reviewHypothesis")}</span>
              <span className="text-slate-100 text-right max-w-[60%]">
                {hypothesis}
              </span>
            </div>
          )}
          {selectedEnv && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{t("reviewEnvironment")}</span>
              <span className="text-slate-100">{selectedEnv}</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))}
          disabled={isCreating}
        >
          {step === 0 ? tc("cancel") : t("back")}
        </Button>

        {step < TOTAL_STEPS - 1 ? (
          <Button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            {t("next")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isCreating || !generatedKey}
          >
            {isCreating ? tc("loading") : t("createFlag")}
          </Button>
        )}
      </div>
    </Dialog>
  );
}
