"use client";

import { RefreshCw, WifiOff } from "lucide-react";

interface ApiErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ApiErrorState({ message, onRetry }: ApiErrorStateProps) {
  return (
    <section
      role="alert"
      className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/70 p-8 text-center"
    >
      <WifiOff className="mb-3 h-8 w-8 text-rose-500" aria-hidden="true" />
      <h2 className="text-base font-semibold text-slate-900">No se pudo cargar HomePad</h2>
      <p className="mt-1 max-w-md text-sm text-slate-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-95"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Reintentar
      </button>
    </section>
  );
}