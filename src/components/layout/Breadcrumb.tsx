"use client";

import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export interface BreadcrumbItem {
	label: string;
	href?: string;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
	return (
		<nav className="flex items-center gap-1.5 text-sm">
			{items.map((item, i) => (
				<span key={item.label} className="flex items-center gap-1.5">
					{i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-500" />}
					{item.href ? (
						<Link href={item.href} className="text-slate-400 hover:text-slate-200 transition-colors">
							{item.label}
						</Link>
					) : (
						<span className="text-slate-50">{item.label}</span>
					)}
				</span>
			))}
		</nav>
	);
}
