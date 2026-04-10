"use client";

import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Globe,
  MoreVertical,
  Plus,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  useCreateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useWebhookLogs,
  useWebhooks,
} from "@/hooks/useWebhooks";
import type { WebhookCreateResponse } from "@/lib/types";

const WEBHOOK_EVENTS = [
  "flag.created",
  "flag.updated",
  "flag.deleted",
  "flag.toggled",
  "flag.rollout_changed",
  "project.created",
  "project.deleted",
  "environment.created",
  "api_key.created",
];

export default function WebhooksPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const t = useTranslations("webhooks");
  const tn = useTranslations("nav");
  const tc = useTranslations("common");
  const { toast } = useToast();

  const { data: webhooks, isLoading, isError } = useWebhooks(slug);
  const createWebhook = useCreateWebhook(slug);
  const deleteWebhook = useDeleteWebhook(slug);
  const testWebhook = useTestWebhook(slug);

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [logsId, setLogsId] = useState<string | null>(null);
  const [secretResult, setSecretResult] = useState<WebhookCreateResponse | null>(null);

  // Create form state
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  function toggleEvent(event: string) {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await createWebhook.mutateAsync({
        url: newUrl,
        events: selectedEvents,
      });
      setSecretResult(result);
      setNewUrl("");
      setSelectedEvents([]);
      setCreateOpen(false);
      toast(t("created"), "success");
    } catch {
      toast(t("createError"), "error");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteWebhook.mutateAsync(deleteId);
      toast(t("deleted"), "success");
      setDeleteId(null);
    } catch {
      toast(t("deleteError"), "error");
    }
  }

  async function handleTest(webhookId: string) {
    try {
      await testWebhook.mutateAsync(webhookId);
      toast(t("testSent"), "success");
    } catch {
      toast(t("testError"), "error");
    }
  }

  return (
    <>
      <TopBar
        breadcrumbs={[
          { label: tn("projects"), href: "/" },
          { label: slug, href: `/projects/${slug}` },
          { label: t("title") },
        ]}
      />
      <main className="mx-auto max-w-[1200px] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-50">{t("title")}</h1>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("createTitle")}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <p className="text-sm text-slate-400">{t("errorLoad")}</p>
          </div>
        ) : !webhooks?.length ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-20 text-center">
            <Globe className="mb-4 h-12 w-12 text-slate-600" />
            <h2 className="text-lg font-medium text-slate-300">
              {t("noWebhooks")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t("noWebhooksDescription")}
            </p>
            <Button className="mt-6" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("createTitle")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="rounded-xl border border-slate-700 bg-slate-800/50 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="truncate text-sm font-medium text-slate-200">
                        {wh.url}
                      </code>
                      <Badge variant={wh.enabled ? "success" : "default"}>
                        {wh.enabled ? t("active") : t("inactive")}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {wh.events.map((ev) => (
                        <span
                          key={ev}
                          className="rounded-md bg-slate-700/50 px-2 py-0.5 text-xs text-slate-400"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {t("createdAt")}: {new Date(wh.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTest(wh.id)}
                      disabled={testWebhook.isPending}
                    >
                      <Send className="h-3.5 w-3.5" />
                      {t("test")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLogsId(logsId === wh.id ? null : wh.id)}
                    >
                      {t("logs")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(wh.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>

                {logsId === wh.id && (
                  <DeliveryLogs projectSlug={slug} webhookId={wh.id} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create dialog */}
        <Dialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          title={t("createTitle")}
          description={t("createDescription")}
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              id="webhook-url"
              label={t("url")}
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={t("urlPlaceholder")}
              required
              autoFocus
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                {t("selectEvents")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {WEBHOOK_EVENTS.map((ev) => (
                  <label
                    key={ev}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 hover:border-slate-600"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(ev)}
                      onChange={() => toggleEvent(ev)}
                      className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                    />
                    {ev}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                {tc("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createWebhook.isPending || !selectedEvents.length}
              >
                {createWebhook.isPending ? tc("loading") : tc("create")}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* Secret reveal dialog */}
        <Dialog
          open={!!secretResult}
          onOpenChange={() => setSecretResult(null)}
          title={t("yourSecret")}
          description={t("secretWarning")}
        >
          {secretResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 p-3">
                <code className="flex-1 break-all text-sm text-emerald-400">
                  {secretResult.secret}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(secretResult.secret);
                    toast(tc("copied"), "success");
                  }}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setSecretResult(null)}>
                  {tc("save")}
                </Button>
              </div>
            </div>
          )}
        </Dialog>

        {/* Delete confirmation */}
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={() => setDeleteId(null)}
          title={t("deleteTitle")}
          description={t("deleteConfirm")}
          onConfirm={handleDelete}
          loading={deleteWebhook.isPending}
        />
      </main>
    </>
  );
}

function DeliveryLogs({
  projectSlug,
  webhookId,
}: {
  projectSlug: string;
  webhookId: string;
}) {
  const t = useTranslations("webhooks");
  const { data: logs, isLoading } = useWebhookLogs(projectSlug, webhookId);

  return (
    <div className="mt-4 border-t border-slate-700 pt-4">
      <h3 className="mb-3 text-sm font-medium text-slate-300">{t("logs")}</h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
        </div>
      ) : !logs?.length ? (
        <p className="text-sm text-slate-500">{t("noLogs")}</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2">
                {log.success ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                )}
                <span className="text-slate-300">{log.event_type}</span>
                <span className="text-slate-500">
                  {log.status_code > 0 ? `HTTP ${log.status_code}` : "Connection error"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <span>
                  {t("attempts")}: {log.attempts}
                </span>
                <span>
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
