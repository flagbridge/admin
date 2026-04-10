"use client";

import { AlertCircle, Settings, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useEnvironments } from "@/hooks/useEnvironments";
import { useDeleteProject, useProjects, useUpdateProject } from "@/hooks/useProjects";

export default function ProjectSettingsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const t = useTranslations("settings");
  const tn = useTranslations("nav");
  const tc = useTranslations("common");
  const { toast } = useToast();

  const { data: projects, isLoading, isError } = useProjects();
  const project = projects?.find((p) => p.slug === slug);
  const { data: environments } = useEnvironments(slug);
  const updateProject = useUpdateProject(slug);
  const deleteProject = useDeleteProject();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
    }
  }, [project]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProject.mutateAsync({ name, description });
      toast(t("updated"), "success");
    } catch {
      toast(t("updateError"), "error");
    }
  }

  async function handleDelete() {
    try {
      await deleteProject.mutateAsync(slug);
      toast(t("deleted"), "success");
      router.push("/");
    } catch {
      toast(t("deleteError"), "error");
    }
  }

  if (isLoading) {
    return (
      <>
        <TopBar
          breadcrumbs={[
            { label: tn("projects"), href: "/" },
            { label: slug, href: `/projects/${slug}` },
            { label: t("title") },
          ]}
        />
        <main className="mx-auto max-w-[1200px] p-6">
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
          </div>
        </main>
      </>
    );
  }

  if (isError || !project) {
    return (
      <>
        <TopBar
          breadcrumbs={[
            { label: tn("projects"), href: "/" },
            { label: slug },
          ]}
        />
        <main className="mx-auto max-w-[1200px] p-6">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <p className="text-sm text-slate-400">{t("errorLoad")}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: tn("projects"), href: "/" },
          { label: project.name, href: `/projects/${slug}` },
          { label: t("title") },
        ]}
      />
      <main className="mx-auto max-w-[800px] p-6">
        <div className="mb-6 flex items-center gap-3">
          <Settings className="h-6 w-6 text-slate-400" />
          <h1 className="text-2xl font-semibold text-slate-50">{t("title")}</h1>
        </div>

        {/* General settings */}
        <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="mb-4 text-lg font-medium text-slate-200">
            {t("general")}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              id="project-name"
              label={t("name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="project-slug"
                className="text-sm font-medium text-slate-300"
              >
                {t("slug")}
              </label>
              <input
                id="project-slug"
                value={slug}
                disabled
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500">{t("slugHint")}</p>
            </div>
            <Input
              id="project-description"
              label={t("description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={updateProject.isPending}>
                {updateProject.isPending ? tc("loading") : tc("save")}
              </Button>
            </div>
          </form>
        </section>

        {/* Environments */}
        <section className="mt-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="mb-4 text-lg font-medium text-slate-200">
            {t("environments")}
          </h2>
          {environments?.length ? (
            <div className="space-y-2">
              {environments.map((env) => (
                <div
                  key={env.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {env.name}
                    </p>
                    <p className="text-xs text-slate-500">{env.slug}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t("noEnvironments")}</p>
          )}
        </section>

        {/* Danger zone */}
        <section className="mt-6 rounded-xl border border-red-900/50 bg-red-950/20 p-6">
          <h2 className="mb-2 text-lg font-medium text-red-400">
            {t("dangerZone")}
          </h2>
          <p className="mb-4 text-sm text-slate-400">
            {t("dangerDescription")}
          </p>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            {t("deleteProject")}
          </Button>
        </section>

        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={t("deleteTitle")}
          description={t("deleteConfirm", { name: project.name })}
          onConfirm={handleDelete}
          loading={deleteProject.isPending}
        />
      </main>
    </>
  );
}
