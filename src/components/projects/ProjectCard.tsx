import { Calendar } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group rounded-xl border border-slate-700 bg-slate-800 p-5 transition-colors hover:border-slate-600"
    >
      <h3 className="text-base font-semibold text-slate-50 group-hover:text-blue-400 transition-colors">
        {project.name}
      </h3>
      <p className="mt-1 text-sm text-slate-500 font-mono">{project.slug}</p>
      {project.description && (
        <p className="mt-2 text-sm text-slate-400">{project.description}</p>
      )}

      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
        <Calendar className="h-3.5 w-3.5" />
        {new Date(project.created_at).toLocaleDateString()}
      </div>
    </Link>
  );
}
