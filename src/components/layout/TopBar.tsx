import { Breadcrumb, type BreadcrumbItem } from "./Breadcrumb";

interface TopBarProps {
  breadcrumbs: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function TopBar({ breadcrumbs, actions }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-800 bg-gray-900 px-6">
      <Breadcrumb items={breadcrumbs} />
      {actions && <div className="flex items-center">{actions}</div>}
    </header>
  );
}
