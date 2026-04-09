"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { EnvSummary, Flag, FlagState } from "@/lib/types";

export interface FlagWithEnvs extends Flag {
  environments: Record<string, EnvSummary>;
}

export function useFlags(projectSlug: string) {
  return useQuery({
    queryKey: ["flags", projectSlug],
    queryFn: () => api<FlagWithEnvs[]>(`/v1/projects/${projectSlug}/flags`),
    enabled: !!projectSlug,
  });
}

export function useCreateFlag(projectSlug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      key: string;
      type: "boolean" | "string" | "number";
      description?: string;
    }) =>
      api<Flag>(`/v1/projects/${projectSlug}/flags`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["flags", projectSlug] });
    },
  });
}

export function useUpdateFlag(projectSlug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      flagKey,
      data,
    }: {
      flagKey: string;
      data: { description?: string };
    }) =>
      api<Flag>(`/v1/projects/${projectSlug}/flags/${flagKey}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, { flagKey }) => {
      qc.invalidateQueries({ queryKey: ["flags", projectSlug] });
      qc.invalidateQueries({ queryKey: ["flag", projectSlug, flagKey] });
    },
  });
}

export function useDeleteFlag(projectSlug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (flagKey: string) =>
      api<void>(`/v1/projects/${projectSlug}/flags/${flagKey}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["flags", projectSlug] });
    },
  });
}

export function useToggleFlag(projectSlug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      flagKey,
      envSlug,
      enabled,
    }: {
      flagKey: string;
      envSlug: string;
      enabled: boolean;
    }) =>
      api<FlagState>(
        `/v1/projects/${projectSlug}/flags/${flagKey}/states/${envSlug}`,
        {
          method: "PUT",
          body: JSON.stringify({ enabled }),
        },
      ),
    onMutate: async ({ flagKey, envSlug, enabled }) => {
      await qc.cancelQueries({
        queryKey: ["flags", projectSlug],
      });
      const prev = qc.getQueryData<FlagWithEnvs[]>(["flags", projectSlug]);
      if (prev) {
        qc.setQueryData(
          ["flags", projectSlug],
          prev.map((f) =>
            f.key === flagKey
              ? {
                  ...f,
                  environments: {
                    ...f.environments,
                    [envSlug]: {
                      ...f.environments[envSlug],
                      enabled,
                    },
                  },
                }
              : f,
          ),
        );
      }
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        qc.setQueryData(["flags", projectSlug], context.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["flags", projectSlug] });
    },
  });
}
