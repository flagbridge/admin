import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "blue";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-slate-700 text-slate-300",
  success: "bg-green-500/15 text-green-400",
  warning: "bg-orange-500/15 text-orange-400",
  error: "bg-red-500/15 text-red-400",
  blue: "bg-blue-500/15 text-blue-400",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
