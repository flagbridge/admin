"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FlagDetail, FlagState, RuleCondition, TargetingRule } from "@/lib/types";

export function useFlag(projectSlug: string, flagKey: string) {
  return useQuery({
    queryKey: ["flag", projectSlug, flagKey],
    queryFn: () =>
      api<FlagDetail>(`/v1/projects/${projectSlug}/flags/${flagKey}`),
    enabled: !!projectSlug && !!flagKey,
  });
}

export function useToggleFlagState(projectSlug: string, flagKey: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ envSlug, enabled }: { envSlug: string; enabled: boolean }) =>
      api<FlagState>(
        `/v1/projects/${projectSlug}/flags/${flagKey}/states/${envSlug}`,
        {
          method: "PUT",
          body: JSON.stringify({ enabled }),
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["flag", projectSlug, flagKey] });
    },
  });
}

export function useFlagRules(
  projectSlug: string,
  flagKey: string,
  envSlug: string,
) {
  return useQuery({
    queryKey: ["flag-rules", projectSlug, flagKey, envSlug],
    queryFn: () =>
      api<TargetingRule[]>(
        `/v1/projects/${projectSlug}/flags/${flagKey}/rules/${envSlug}`,
      ),
    enabled: !!projectSlug && !!flagKey && !!envSlug,
  });
}

interface RuleInput {
  name: string;
  priority: number;
  conditions: RuleCondition[];
  value: unknown;
  enabled: boolean;
}

export function useSetRules(projectSlug: string, flagKey: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ envSlug, rules }: { envSlug: string; rules: RuleInput[] }) =>
      api<TargetingRule[]>(
        `/v1/projects/${projectSlug}/flags/${flagKey}/rules/${envSlug}`,
        {
          method: "PUT",
          body: JSON.stringify({ rules }),
        },
      ),
    onSuccess: (_data, { envSlug }) => {
      qc.invalidateQueries({
        queryKey: ["flag-rules", projectSlug, flagKey, envSlug],
      });
      qc.invalidateQueries({ queryKey: ["flag", projectSlug, flagKey] });
    },
  });
}
