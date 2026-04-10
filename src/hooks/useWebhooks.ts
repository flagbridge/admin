"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Webhook, WebhookCreateResponse, WebhookDeliveryLog } from "@/lib/types";

export function useWebhooks(projectSlug: string) {
  return useQuery({
    queryKey: ["webhooks", projectSlug],
    queryFn: () =>
      api<Webhook[]>(`/v1/projects/${projectSlug}/webhooks`),
    enabled: !!projectSlug,
  });
}

export function useCreateWebhook(projectSlug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { url: string; events: string[] }) =>
      api<WebhookCreateResponse>(`/v1/projects/${projectSlug}/webhooks`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhooks", projectSlug] });
    },
  });
}

export function useUpdateWebhook(projectSlug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      webhookId,
      data,
    }: {
      webhookId: string;
      data: { url?: string; events?: string[]; enabled?: boolean };
    }) =>
      api<Webhook>(
        `/v1/projects/${projectSlug}/webhooks/${webhookId}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhooks", projectSlug] });
    },
  });
}

export function useDeleteWebhook(projectSlug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (webhookId: string) =>
      api<void>(
        `/v1/projects/${projectSlug}/webhooks/${webhookId}`,
        { method: "DELETE" },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhooks", projectSlug] });
    },
  });
}

export function useTestWebhook(projectSlug: string) {
  return useMutation({
    mutationFn: (webhookId: string) =>
      api<{ status: string }>(
        `/v1/projects/${projectSlug}/webhooks/${webhookId}/test`,
        { method: "POST" },
      ),
  });
}

export function useWebhookLogs(projectSlug: string, webhookId: string) {
  return useQuery({
    queryKey: ["webhook-logs", webhookId],
    queryFn: () =>
      api<WebhookDeliveryLog[]>(
        `/v1/projects/${projectSlug}/webhooks/${webhookId}/logs`,
      ),
    enabled: !!webhookId,
  });
}
