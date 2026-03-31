"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, AlertCircle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { APIKeyTable } from "@/components/api-keys/APIKeyTable";
import { CreateAPIKeyDialog } from "@/components/api-keys/CreateAPIKeyDialog";
import { useAPIKeys } from "@/hooks/useAPIKeys";

export default function APIKeysPage() {
	const t = useTranslations("apiKeys");
	const tn = useTranslations("nav");
	const [dialogOpen, setDialogOpen] = useState(false);
	const { data: keys, isLoading, isError } = useAPIKeys();

	return (
		<>
			<TopBar breadcrumbs={[{ label: tn("apiKeys") }]} />
			<main className="mx-auto max-w-[1200px] p-6">
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-2xl font-semibold text-slate-50">{t("title")}</h1>
					<Button onClick={() => setDialogOpen(true)}>
						<Plus className="h-4 w-4" />
						{t("createTitle")}
					</Button>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center py-20">
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
					</div>
				) : isError ? (
					<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
						<AlertCircle className="mb-4 h-12 w-12 text-red-500" />
						<p className="text-sm text-slate-400">{t("errorLoad")}</p>
					</div>
				) : (
					<APIKeyTable keys={keys || []} />
				)}

				<CreateAPIKeyDialog open={dialogOpen} onOpenChange={setDialogOpen} />
			</main>
		</>
	);
}
