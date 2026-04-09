"use client";

import { Calendar, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useDeleteProject, useUpdateProject } from "@/hooks/useProjects";
import { Link, useRouter } from "@/i18n/navigation";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations("projects");
  const tc = useTranslations("common");
  const router = useRouter();
  const { toast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editDesc, setEditDesc] = useState(project.description ?? "");

  const updateProject = useUpdateProject(project.slug);
  const deleteProject = useDeleteProject();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject.mutate(
      { name: editName, description: editDesc || undefined },
      {
        onSuccess: () => {
          toast(t("updated"));
          setEditOpen(false);
        },
        onError: () => toast(t("updateError")),
      },
    );
  };

  const handleDelete = () => {
    deleteProject.mutate(project.slug, {
      onSuccess: () => {
        toast(t("deleted"));
        router.push("/");
      },
      onError: () => toast(t("deleteError")),
    });
  };

  return (
    <>
      <div className="group relative rounded-xl border border-slate-700 bg-slate-800 p-5 transition-colors hover:border-slate-600">
        <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-400 hover:text-red-400"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Link href={`/projects/${project.slug}`}>
          <h3 className="text-base font-semibold text-slate-50 group-hover:text-blue-400 transition-colors">
            {project.name}
          </h3>
          <p className="mt-1 text-sm text-slate-500 font-mono">
            {project.slug}
          </p>
          {project.description && (
            <p className="mt-2 text-sm text-slate-400">{project.description}</p>
          )}
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(project.created_at).toLocaleDateString()}
          </div>
        </Link>
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title={t("editTitle")}
        description={t("editDescription")}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label={t("name")}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />
          <Input
            label={t("description")}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setEditOpen(false)}
            >
              {tc("cancel")}
            </Button>
            <Button size="sm" type="submit" disabled={updateProject.isPending}>
              {tc("save")}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("editTitle")}
        description={t("deleteConfirm", { name: project.name })}
        onConfirm={handleDelete}
        loading={deleteProject.isPending}
      />
    </>
  );
}
