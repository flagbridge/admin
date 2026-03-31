"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Flag, FlagState, TargetingRule, RuleCondition } from "@/lib/types";

interface FlagDetail extends Flag {
	states: Record<string, FlagState>;
	rules: Record<string, TargetingRule[]>;
}

export function useFlag(projectSlug: string, flagKey: string) {
	return useQuery({
		queryKey: ["flag", projectSlug, flagKey],
		queryFn: () =>
			api<FlagDetail>(
				`/v1/projects/${projectSlug}/flags/${flagKey}`,
			),
		enabled: !!projectSlug && !!flagKey,
	});
}

export function useToggleFlagState(projectSlug: string, flagKey: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: ({
			envSlug,
			enabled,
		}: {
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
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["flag", projectSlug, flagKey] });
		},
	});
}

export function useCreateRule(projectSlug: string, flagKey: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (data: {
			environment_slug: string;
			conditions: RuleCondition[];
			result_value: string | number | boolean;
		}) =>
			api<TargetingRule>(
				`/v1/projects/${projectSlug}/flags/${flagKey}/rules`,
				{
					method: "POST",
					body: JSON.stringify(data),
				},
			),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["flag", projectSlug, flagKey] });
		},
	});
}

export function useDeleteRule(projectSlug: string, flagKey: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (ruleId: string) =>
			api<void>(
				`/v1/projects/${projectSlug}/flags/${flagKey}/rules/${ruleId}`,
				{ method: "DELETE" },
			),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["flag", projectSlug, flagKey] });
		},
	});
}
