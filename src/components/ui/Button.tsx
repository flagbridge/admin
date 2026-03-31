import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "outline" | "destructive" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
	size?: Size;
}

const variantStyles: Record<Variant, string> = {
	primary: "bg-blue-500 text-white hover:bg-blue-600",
	outline: "bg-transparent border border-slate-600 text-slate-200 hover:border-slate-500 hover:bg-slate-800",
	destructive: "bg-red-500 text-white hover:bg-red-600",
	ghost: "bg-transparent text-slate-300 hover:bg-slate-800",
};

const sizeStyles: Record<Size, string> = {
	sm: "px-3 py-1.5 text-sm",
	md: "px-5 py-2.5 text-sm",
	lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ variant = "primary", size = "md", className = "", disabled, ...props }, ref) => {
		return (
			<button
				ref={ref}
				className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
				disabled={disabled}
				{...props}
			/>
		);
	},
);

Button.displayName = "Button";
