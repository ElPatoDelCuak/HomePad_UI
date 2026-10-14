"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      titleId="confirm-modal-title"
      onClose={onCancel}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-left">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              variant === "danger" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-sm text-slate-500">{message}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 active:scale-95 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm active:scale-95 transition-all ${
              variant === "danger"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
