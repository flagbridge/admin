"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export function useAuth() {
	const { data: user, isLoading } = useQuery({
		queryKey: ["auth", "me"],
		queryFn: () => api<User>("/v1/auth/me"),
		retry: false,
		staleTime: 5 * 60 * 1000,
	});

	return { user: user ?? null, isLoading };
}
