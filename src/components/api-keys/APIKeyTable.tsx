"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import type { APIKey } from "@/lib/types";

interface APIKeyTableProps {
	keys: APIKey[];
}

const scopeVariant = {
	evaluation: "blue" as const,
	management: "warning" as const,
	full: "error" as const,
};

export function APIKeyTable({ keys }: APIKeyTableProps) {
	const t = useTranslations("apiKeys");

	if (!keys.length) {
		return (
			<p className="py-12 text-center text-sm text-slate-500">
				No API keys yet.
			</p>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-slate-700">
			<table className="w-full text-left text-sm">
				<thead>
					<tr className="border-b border-slate-700 bg-slate-800/50">
						<th className="px-4 py-3 font-medium text-slate-400">{t("name")}</th>
						<th className="px-4 py-3 font-medium text-slate-400">{t("keyPrefix")}</th>
						<th className="px-4 py-3 font-medium text-slate-400">{t("scope")}</th>
						<th className="px-4 py-3 font-medium text-slate-400">{t("createdAt")}</th>
						<th className="px-4 py-3 font-medium text-slate-400">{t("lastUsed")}</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-slate-700/50">
					{keys.map((key) => (
						<tr key={key.id} className="hover:bg-slate-800/30 transition-colors">
							<td className="px-4 py-3 text-slate-200">{key.name}</td>
							<td className="px-4 py-3 font-mono text-sm text-slate-400">
								{key.key_prefix}...
							</td>
							<td className="px-4 py-3">
								<Badge variant={scopeVariant[key.scope]}>
									{key.scope}
								</Badge>
							</td>
							<td className="px-4 py-3 text-slate-400">
								{new Date(key.created_at).toLocaleDateString()}
							</td>
							<td className="px-4 py-3 text-slate-400">
								{key.last_used_at
									? new Date(key.last_used_at).toLocaleDateString()
									: t("never")}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
