"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Environment } from "@/lib/types";

export function useEnvironments(projectSlug: string) {
	return useQuery({
		queryKey: ["environments", projectSlug],
		queryFn: () =>
			api<Environment[]>(`/v1/projects/${projectSlug}/environments`),
		enabled: !!projectSlug,
	});
}

export function useCreateEnvironment(projectSlug: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (data: { name: string; slug: string }) =>
			api<Environment>(`/v1/projects/${projectSlug}/environments`, {
				method: "POST",
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["environments", projectSlug] });
		},
	});
}
