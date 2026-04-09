"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AuditEntry } from "@/lib/types";

export interface AuditFilters {
  action?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogResult {
  entries: AuditEntry[];
  total: number;
}

export function useAuditLog(projectId: string, filters: AuditFilters = {}) {
  return useQuery({
    queryKey: ["audit-log", projectId, filters],
    queryFn: async (): Promise<AuditLogResult> => {
      const params = new URLSearchParams({ project_id: projectId });
      if (filters.action) params.set("action", filters.action);
      if (filters.entityType) params.set("entity_type", filters.entityType);
      if (filters.limit) params.set("limit", String(filters.limit));
      if (filters.offset) params.set("offset", String(filters.offset));

      // api() unwraps .data automatically, so we get AuditEntry[] directly
      const entries = await api<AuditEntry[]>(
        `/v1/audit-log?${params.toString()}`,
      );
      return { entries, total: entries.length };
    },
    enabled: !!projectId,
  });
}
