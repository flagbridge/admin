"use client";

interface ToggleProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	label?: string;
}

export function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={label}
			disabled={disabled}
			onClick={() => onChange(!checked)}
			className={`relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${checked ? "bg-blue-500" : "bg-slate-700"}`}
		>
			<span
				className={`pointer-events-none block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-[20px]" : "translate-x-[2px]"}`}
			/>
		</button>
	);
}
