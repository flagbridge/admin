"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import {
  Code2,
  Compass,
  Palette,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useViewMode } from "@/hooks/useViewMode";
import type { ProjectRole } from "@/lib/types";

interface RoleOption {
  role: ProjectRole;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    role: "product",
    icon: Compass,
    titleKey: "pmTitle",
    descKey: "pmDescription",
    color: "border-purple-500 bg-purple-500/10 text-purple-400",
  },
  {
    role: "viewer",
    icon: Palette,
    titleKey: "designerTitle",
    descKey: "designerDescription",
    color: "border-pink-500 bg-pink-500/10 text-pink-400",
  },
  {
    role: "engineer",
    icon: Code2,
    titleKey: "engineerTitle",
    descKey: "engineerDescription",
    color: "border-blue-500 bg-blue-500/10 text-blue-400",
  },
  {
    role: "admin",
    icon: Users,
    titleKey: "leadTitle",
    descKey: "leadDescription",
    color: "border-green-500 bg-green-500/10 text-green-400",
  },
];

export function OnboardingWizard() {
  const t = useTranslations("onboarding");
  const { hasCompletedOnboarding, completeOnboarding } = useViewMode();
  const [selected, setSelected] = useState<ProjectRole | null>(null);

  if (hasCompletedOnboarding) return null;

  return (
    <RadixDialog.Root open={!hasCompletedOnboarding}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="text-center mb-8">
            <RadixDialog.Title className="text-2xl font-bold text-slate-50">
              {t("title")}
            </RadixDialog.Title>
            <RadixDialog.Description className="mt-2 text-slate-400">
              {t("subtitle")}
            </RadixDialog.Description>
            <p className="mt-1 text-xs text-slate-500">
              {t("roleDescription")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {roleOptions.map(({ role, icon: Icon, titleKey, descKey, color }) => {
              const isSelected = selected === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelected(role)}
                  className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? color
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${isSelected ? "" : "text-slate-400"}`}
                  />
                  <div>
                    <p
                      className={`text-sm font-semibold ${isSelected ? "" : "text-slate-200"}`}
                    >
                      {t(titleKey)}
                    </p>
                    <p
                      className={`mt-0.5 text-xs ${isSelected ? "opacity-80" : "text-slate-500"}`}
                    >
                      {t(descKey)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            className="w-full"
            disabled={!selected}
            onClick={() => {
              if (selected) completeOnboarding(selected);
            }}
          >
            {t("getStarted")}
          </Button>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
