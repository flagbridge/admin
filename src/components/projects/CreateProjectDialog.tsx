"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useCreateProject } from "@/hooks/useProjects";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const t = useTranslations("projects");
  const tc = useTranslations("common");
  const { toast } = useToast();
  const createProject = useCreateProject();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await createProject.mutateAsync({ name, slug });
      toast("Project created", "success");
      setName("");
      setSlug("");
      setSlugTouched(false);
      onOpenChange(false);
    } catch {
      toast("Failed to create project", "error");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("createTitle")}
      description={t("createDescription")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="project-name"
          label={t("name")}
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="My App"
          required
          autoFocus
        />
        <Input
          id="project-slug"
          label={t("slug")}
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          placeholder="my-app"
          required
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {tc("cancel")}
          </Button>
          <Button type="submit" disabled={createProject.isPending}>
            {createProject.isPending ? tc("loading") : tc("create")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
