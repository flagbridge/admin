"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import type { Flag, FlagState } from "@/lib/types";

interface FlagWithState extends Flag {
	state?: FlagState;
}

interface FlagTableProps {
	flags: FlagWithState[];
	projectSlug: string;
	onToggle: (flagKey: string, enabled: boolean) => void;
	togglePending?: boolean;
}

const typeBadgeVariant = {
	boolean: "blue" as const,
	string: "warning" as const,
	number: "success" as const,
};

export function FlagTable({ flags, projectSlug, onToggle, togglePending }: FlagTableProps) {
	const t = useTranslations("flags");

	if (!flags.length) {
		return (
			<p className="py-12 text-center text-sm text-slate-500">
				{t("noFlags")}
			</p>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-slate-700">
			<table className="w-full text-left text-sm">
				<thead>
					<tr className="border-b border-slate-700 bg-slate-800/50">
						<th className="px-4 py-3 font-medium text-slate-400">{t("key")}</th>
						<th className="px-4 py-3 font-medium text-slate-400">{t("type")}</th>
						<th className="px-4 py-3 font-medium text-slate-400">{t("enabled")}</th>
						<th className="px-4 py-3 font-medium text-slate-400">{t("updatedAt")}</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-slate-700/50">
					{flags.map((flag) => (
						<tr key={flag.id} className="hover:bg-slate-800/30 transition-colors">
							<td className="px-4 py-3">
								<Link
									href={`/projects/${projectSlug}/flags/${flag.key}`}
									className="font-mono text-sm text-blue-400 hover:text-blue-300"
								>
									{flag.key}
								</Link>
							</td>
							<td className="px-4 py-3">
								<Badge variant={typeBadgeVariant[flag.type]}>
									{flag.type}
								</Badge>
							</td>
							<td className="px-4 py-3">
								<Toggle
									checked={flag.state?.enabled ?? false}
									onChange={(checked) => onToggle(flag.key, checked)}
									disabled={togglePending}
								/>
							</td>
							<td className="px-4 py-3 text-slate-400">
								{new Date(flag.updated_at).toLocaleDateString()}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
