"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useCreateAPIKey } from "@/hooks/useAPIKeys";
import { useProjects } from "@/hooks/useProjects";
import { useToast } from "@/components/ui/Toast";

interface CreateAPIKeyDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateAPIKeyDialog({ open, onOpenChange }: CreateAPIKeyDialogProps) {
	const t = useTranslations("apiKeys");
	const tc = useTranslations("common");
	const { toast } = useToast();
	const createKey = useCreateAPIKey();
	const { data: projects } = useProjects();

	const [name, setName] = useState("");
	const [scope, setScope] = useState<"evaluation" | "management" | "full">("evaluation");
	const [projectId, setProjectId] = useState("");
	const [createdKey, setCreatedKey] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		try {
			const result = await createKey.mutateAsync({
				name,
				scope,
				project_id: projectId,
			});
			setCreatedKey(result.key);
		} catch {
			toast("Failed to create API key", "error");
		}
	}

	function handleClose() {
		setName("");
		setScope("evaluation");
		setProjectId("");
		setCreatedKey(null);
		setCopied(false);
		onOpenChange(false);
	}

	async function handleCopy() {
		if (!createdKey) return;
		await navigator.clipboard.writeText(createdKey);
		setCopied(true);
		toast(tc("copied"), "success");
		setTimeout(() => setCopied(false), 2000);
	}

	if (createdKey) {
		return (
			<Dialog open={open} onOpenChange={handleClose} title={t("yourKey")}>
				<div className="space-y-4">
					<div className="flex items-start gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2">
						<AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
						<p className="text-sm text-orange-300">{t("keyWarning")}</p>
					</div>

					<div className="flex items-center gap-2">
						<code className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm font-mono text-slate-200 break-all">
							{createdKey}
						</code>
						<Button size="sm" variant="outline" onClick={handleCopy}>
							{copied ? (
								<Check className="h-4 w-4 text-green-400" />
							) : (
								<Copy className="h-4 w-4" />
							)}
						</Button>
					</div>

					<div className="flex justify-end pt-2">
						<Button variant="outline" onClick={handleClose}>
							Done
						</Button>
					</div>
				</div>
			</Dialog>
		);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={handleClose}
			title={t("createTitle")}
			description={t("createDescription")}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					id="key-name"
					label={t("name")}
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Production SDK"
					required
					autoFocus
				/>
				<Select
					id="key-scope"
					label={t("scope")}
					value={scope}
					onChange={(e) => setScope(e.target.value as typeof scope)}
					options={[
						{ value: "evaluation", label: t("scopeEvaluation") },
						{ value: "management", label: t("scopeManagement") },
						{ value: "full", label: t("scopeFull") },
					]}
				/>
				{projects && projects.length > 0 && (
					<Select
						id="key-project"
						label={t("project")}
						value={projectId}
						onChange={(e) => setProjectId(e.target.value)}
						options={[
							{ value: "", label: "—" },
							...projects.map((p) => ({ value: p.id, label: p.name })),
						]}
					/>
				)}
				<div className="flex justify-end gap-3 pt-2">
					<Button type="button" variant="outline" onClick={handleClose}>
						{tc("cancel")}
					</Button>
					<Button type="submit" disabled={createKey.isPending}>
						{createKey.isPending ? tc("loading") : tc("create")}
					</Button>
				</div>
			</form>
		</Dialog>
	);
}
