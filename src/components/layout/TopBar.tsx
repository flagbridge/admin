import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";

interface TopBarProps {
	breadcrumbs: BreadcrumbItem[];
}

export function TopBar({ breadcrumbs }: TopBarProps) {
	return (
		<header className="sticky top-0 z-20 flex h-14 items-center border-b border-slate-800 bg-gray-900 px-6">
			<Breadcrumb items={breadcrumbs} />
		</header>
	);
}
