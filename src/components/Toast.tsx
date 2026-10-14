"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

export interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: number) => void;
}

function ToastItem({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-white text-sm font-medium min-w-[240px] max-w-[320px] ${
        toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle className="w-5 h-5 shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 shrink-0" />
      )}
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        aria-label="Cerrar notificación"
        onClick={() => onDismiss(toast.id)}
        className="opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-[70] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

// Hook para usar toasts facilmente
let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (message: string, type: ToastType = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
  };

  return { toasts, dismissToast, toast };
}
