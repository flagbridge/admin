"use client";

import { Toggle } from "@/components/ui/Toggle";

interface FlagToggleProps {
	enabled: boolean;
	onChange: (enabled: boolean) => void;
	disabled?: boolean;
}

export function FlagToggle({ enabled, onChange, disabled }: FlagToggleProps) {
	return (
		<div className="flex items-center gap-3">
			<Toggle checked={enabled} onChange={onChange} disabled={disabled} />
			<span className={`text-sm font-medium ${enabled ? "text-green-400" : "text-slate-500"}`}>
				{enabled ? "ON" : "OFF"}
			</span>
		</div>
	);
}
