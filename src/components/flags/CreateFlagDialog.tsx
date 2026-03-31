"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useCreateFlag } from "@/hooks/useFlags";
import { useToast } from "@/components/ui/Toast";

interface CreateFlagDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectSlug: string;
}

export function CreateFlagDialog({
	open,
	onOpenChange,
	projectSlug,
}: CreateFlagDialogProps) {
	const t = useTranslations("flags");
	const tc = useTranslations("common");
	const { toast } = useToast();
	const createFlag = useCreateFlag(projectSlug);
	const [key, setKey] = useState("");
	const [type, setType] = useState<"boolean" | "string" | "number">("boolean");
	const [description, setDescription] = useState("");

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		try {
			await createFlag.mutateAsync({ key, type, description: description || undefined });
			toast("Flag created", "success");
			setKey("");
			setType("boolean");
			setDescription("");
			onOpenChange(false);
		} catch {
			toast("Failed to create flag", "error");
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
					id="flag-key"
					label={t("key")}
					value={key}
					onChange={(e) => setKey(e.target.value)}
					placeholder="enable-new-checkout"
					required
					autoFocus
				/>
				<Select
					id="flag-type"
					label={t("type")}
					value={type}
					onChange={(e) => setType(e.target.value as typeof type)}
					options={[
						{ value: "boolean", label: t("typeBoolLabel") },
						{ value: "string", label: t("typeStringLabel") },
						{ value: "number", label: t("typeNumberLabel") },
					]}
				/>
				<Input
					id="flag-description"
					label={t("description")}
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Controls the new checkout flow"
				/>
				<div className="flex justify-end gap-3 pt-2">
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						{tc("cancel")}
					</Button>
					<Button type="submit" disabled={createFlag.isPending}>
						{createFlag.isPending ? tc("loading") : tc("create")}
					</Button>
				</div>
			</form>
		</Dialog>
	);
}
