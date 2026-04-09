"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Flag, FlagState } from "@/lib/types";

interface FlagWithState extends Flag {
  state?: FlagState;
}

export function useFlags(projectSlug: string, envSlug?: string) {
  return useQuery({
    queryKey: ["flags", projectSlug, envSlug],
    queryFn: () => {
      const params = envSlug ? `?environment=${envSlug}` : "";
      return api<FlagWithState[]>(`/v1/projects/${projectSlug}/flags${params}`);
    },
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
        queryKey: ["flags", projectSlug, envSlug],
      });
      const prev = qc.getQueryData<FlagWithState[]>([
        "flags",
        projectSlug,
        envSlug,
      ]);
      if (prev) {
        qc.setQueryData(
          ["flags", projectSlug, envSlug],
          prev.map((f) =>
            f.key === flagKey
              ? { ...f, state: { ...f.state, enabled } as FlagState }
              : f,
          ),
        );
      }
      return { prev };
    },
    onError: (_err, { envSlug }, context) => {
      if (context?.prev) {
        qc.setQueryData(["flags", projectSlug, envSlug], context.prev);
      }
    },
    onSettled: (_data, _err, { envSlug }) => {
      qc.invalidateQueries({ queryKey: ["flags", projectSlug, envSlug] });
    },
  });
}
