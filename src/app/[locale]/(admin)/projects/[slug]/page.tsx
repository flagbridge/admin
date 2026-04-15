"use client";

import { AlertCircle, Globe, Plus, Server, Settings } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CreateFlagDialog } from "@/components/flags/CreateFlagDialog";
import { FlagCard } from "@/components/flags/FlagCard";
import { FlagCreationWizard } from "@/components/flags/FlagCreationWizard";
import { FlagTable } from "@/components/flags/FlagTable";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Link } from "@/i18n/navigation";
import { useCreateEnvironment, useEnvironments } from "@/hooks/useEnvironments";
import { useFlags, useToggleFlag } from "@/hooks/useFlags";
import { useViewMode } from "@/hooks/useViewMode";

export default function ProjectPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const t = useTranslations("flags");
  const tp = useTranslations("projects");
  const tn = useTranslations("nav");
  const tc = useTranslations("common");
  const { toast } = useToast();
  const { viewMode } = useViewMode();

  const isProductView = viewMode === "product";

  const {
    data: environments,
    isLoading: envsLoading,
    isError: envsError,
  } = useEnvironments(slug);
  const [activeEnv, setActiveEnv] = useState<string>("");
  const selectedEnv = activeEnv || environments?.[0]?.slug || "";

  const {
    data: flags,
    isLoading: flagsLoading,
    isError: flagsError,
  } = useFlags(slug);
  const toggleFlag = useToggleFlag(slug);

  const [createFlagOpen, setCreateFlagOpen] = useState(false);
  const [createEnvOpen, setCreateEnvOpen] = useState(false);
  const [envName, setEnvName] = useState("");
  const createEnv = useCreateEnvironment(slug);

  async function handleCreateEnv(e: React.FormEvent) {
    e.preventDefault();
    try {
      const envSlug = envName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      await createEnv.mutateAsync({ name: envName, slug: envSlug });
      toast(tp("envCreated"), "success");
      setEnvName("");
      setCreateEnvOpen(false);
      setActiveEnv(envSlug);
    } catch {
      toast(tp("envCreateError"), "error");
    }
  }

  const isLoading = envsLoading || flagsLoading;
  const isError = envsError || flagsError;

  return (
    <>
      <TopBar
        breadcrumbs={[{ label: tn("projects"), href: "/" }, { label: slug }]}
        actions={
          !isProductView ? (
            <div className="flex items-center gap-1">
              <Link
                href={`/projects/${slug}/webhooks`}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <Globe className="h-4 w-4" />
                Webhooks
              </Link>
              <Link
                href={`/projects/${slug}/settings`}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <Settings className="h-4 w-4" />
                {tn("settings")}
              </Link>
            </div>
          ) : undefined
        }
      />
      <main className="mx-auto max-w-[1200px] p-6">
        {!envsLoading && isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <p className="text-sm text-slate-400">{tp("errorLoad")}</p>
          </div>
        ) : !envsLoading && !environments?.length ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
            <Server className="mb-4 h-12 w-12 text-slate-600" />
            <p className="text-sm text-slate-500">{t("noEnvironments")}</p>
            <Button className="mt-6" onClick={() => setCreateEnvOpen(true)}>
              <Plus className="h-4 w-4" />
              {tp("createEnvironment")}
            </Button>
          </div>
        ) : (
          <>
            {/* Environment tabs */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex gap-1 rounded-lg border border-slate-700 bg-slate-800 p-1">
                {environments?.map((env) => (
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
                {!isProductView && (
                  <button
                    type="button"
                    onClick={() => setCreateEnvOpen(true)}
                    className="rounded-md px-2 py-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                    title={tp("createEnvironment")}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button onClick={() => setCreateFlagOpen(true)}>
                <Plus className="h-4 w-4" />
                {t("createTitle")}
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
              </div>
            ) : isProductView ? (
              /* Product View: flag cards with context */
              !flags?.length ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
                  <p className="text-sm text-slate-400">{t("noFlags")}</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {flags.map((flag) => (
                    <FlagCard
                      key={flag.id}
                      flag={flag}
                      projectSlug={slug}
                      selectedEnv={selectedEnv}
                      onToggle={(flagKey, enabled) =>
                        toggleFlag.mutate({
                          flagKey,
                          envSlug: selectedEnv,
                          enabled,
                        })
                      }
                      togglePending={toggleFlag.isPending}
                    />
                  ))}
                </div>
              )
            ) : (
              /* Engineering View: flag table */
              <FlagTable
                flags={flags || []}
                projectSlug={slug}
                selectedEnv={selectedEnv}
                onToggle={(flagKey, enabled) =>
                  toggleFlag.mutate({
                    flagKey,
                    envSlug: selectedEnv,
                    enabled,
                  })
                }
                togglePending={toggleFlag.isPending}
              />
            )}
          </>
        )}

        {isProductView ? (
          <FlagCreationWizard
            open={createFlagOpen}
            onOpenChange={setCreateFlagOpen}
            projectSlug={slug}
          />
        ) : (
          <CreateFlagDialog
            open={createFlagOpen}
            onOpenChange={setCreateFlagOpen}
            projectSlug={slug}
          />
        )}

        <Dialog
          open={createEnvOpen}
          onOpenChange={setCreateEnvOpen}
          title={tp("createEnvironment")}
        >
          <form onSubmit={handleCreateEnv} className="space-y-4">
            <Input
              id="env-name"
              label={tp("envName")}
              value={envName}
              onChange={(e) => setEnvName(e.target.value)}
              placeholder="staging"
              required
              autoFocus
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateEnvOpen(false)}
              >
                {tc("cancel")}
              </Button>
              <Button type="submit" disabled={createEnv.isPending}>
                {createEnv.isPending ? tc("loading") : tc("create")}
              </Button>
            </div>
          </form>
        </Dialog>
      </main>
    </>
  );
}
