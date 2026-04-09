"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading,
}: ConfirmDialogProps) {
  const t = useTranslations("confirm");

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
          {t("cancel")}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
          disabled={loading}
        >
          {t("delete")}
        </Button>
      </div>
    </Dialog>
  );
}
