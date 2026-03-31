import { type SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	error?: string;
	options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ label, error, options, className = "", id, ...props }, ref) => {
		return (
			<div className="flex flex-col gap-1.5">
				{label && (
					<label htmlFor={id} className="text-sm font-medium text-slate-300">
						{label}
					</label>
				)}
				<select
					ref={ref}
					id={id}
					className={`w-full rounded-lg border bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${error ? "border-red-500" : "border-slate-700"} ${className}`}
					{...props}
				>
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
				{error && <p className="text-xs text-red-400">{error}</p>}
			</div>
		);
	},
);

Select.displayName = "Select";
