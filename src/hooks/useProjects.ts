"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => api<Project[]>("/v1/projects"),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; slug: string }) =>
      api<Project>("/v1/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject(slug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; description?: string }) =>
      api<Project>(`/v1/projects/${slug}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["project", slug] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) =>
      api<void>(`/v1/projects/${slug}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
