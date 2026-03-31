"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface DialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	children: ReactNode;
}

export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
	return (
		<RadixDialog.Root open={open} onOpenChange={onOpenChange}>
			<RadixDialog.Portal>
				<RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
					<div className="flex items-start justify-between mb-4">
						<div>
							<RadixDialog.Title className="text-lg font-semibold text-slate-100">
								{title}
							</RadixDialog.Title>
							{description && (
								<RadixDialog.Description className="mt-1 text-sm text-slate-400">
									{description}
								</RadixDialog.Description>
							)}
						</div>
						<RadixDialog.Close className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-slate-200">
							<X className="h-4 w-4" />
						</RadixDialog.Close>
					</div>
					{children}
				</RadixDialog.Content>
			</RadixDialog.Portal>
		</RadixDialog.Root>
	);
}
