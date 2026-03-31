"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, FolderOpen, AlertCircle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { useProjects } from "@/hooks/useProjects";

export default function DashboardPage() {
	const t = useTranslations("dashboard");
	const tn = useTranslations("nav");
	const [dialogOpen, setDialogOpen] = useState(false);
	const { data: projects, isLoading, isError } = useProjects();

	return (
		<>
			<TopBar breadcrumbs={[{ label: tn("dashboard") }]} />
			<main className="mx-auto max-w-[1200px] p-6">
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-2xl font-semibold text-slate-50">
						{t("title")}
					</h1>
					<Button onClick={() => setDialogOpen(true)}>
						<Plus className="h-4 w-4" />
						{t("createProject")}
					</Button>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center py-20 text-slate-400">
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
					</div>
				) : isError ? (
					<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
						<AlertCircle className="mb-4 h-12 w-12 text-red-500" />
						<p className="text-sm text-slate-400">{t("errorLoad")}</p>
					</div>
				) : !projects?.length ? (
					<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
						<FolderOpen className="mb-4 h-12 w-12 text-slate-600" />
						<h2 className="text-lg font-medium text-slate-300">
							{t("emptyTitle")}
						</h2>
						<p className="mt-1 text-sm text-slate-500">
							{t("emptyDescription")}
						</p>
						<Button className="mt-6" onClick={() => setDialogOpen(true)}>
							<Plus className="h-4 w-4" />
							{t("createProject")}
						</Button>
					</div>
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{projects.map((project) => (
							<ProjectCard
								key={project.id}
								project={project}
								flagCountLabel={t("flagCount", { count: project.flag_count })}
							/>
						))}
					</div>
				)}

				<CreateProjectDialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}
				/>
			</main>
		</>
	);
}
