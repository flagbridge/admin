"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { APIKey, APIKeyCreateResponse } from "@/lib/types";

export function useAPIKeys() {
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: () => api<APIKey[]>("/v1/api-keys"),
  });
}

export function useCreateAPIKey() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      scope: "evaluation" | "management" | "full";
      project_id: string;
    }) =>
      api<APIKeyCreateResponse>("/v1/api-keys", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}

export function useDeleteAPIKey() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/v1/api-keys/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}
