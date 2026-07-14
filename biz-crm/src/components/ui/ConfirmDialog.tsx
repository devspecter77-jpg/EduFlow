import { AlertTriangle } from "lucide-react";
import { Modal, ModalFooter } from "./Modal";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Ishonchingiz komilmi?",
  description = "Bu amalni bekor qilish mumkin emas.",
  confirmText = "Tasdiqlash",
  cancelText = "Bekor qilish",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const iconColor = {
    danger: "text-destructive",
    warning: "text-yellow-600",
    info: "text-blue-600",
  };

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div
          className={`rounded-full p-3 ${
            variant === "danger"
              ? "bg-destructive/10"
              : variant === "warning"
              ? "bg-yellow-100 dark:bg-yellow-900/20"
              : "bg-blue-100 dark:bg-blue-900/20"
          }`}
        >
          <AlertTriangle className={`h-6 w-6 ${iconColor[variant]}`} />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <ModalFooter className="mt-6">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
