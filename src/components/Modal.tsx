"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  titleId: string;
  onClose: () => void;
  children: React.ReactNode;
  variant?: "center" | "sheet";
  size?: "sm" | "md";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
};

export function Modal({
  isOpen,
  title,
  titleId,
  onClose,
  children,
  variant = "center",
  size = "sm",
}: ModalProps) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const closeTimerRef = useRef<number | null>(null);
  const requestCloseRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => {
        setIsRendered(true);
        setIsClosing(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    requestCloseRef.current = () => {
      if (isClosing) return;
      setIsClosing(true);
      onCloseRef.current();
      closeTimerRef.current = window.setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 220);
    };
  }, [isClosing]);

  useEffect(() => {
    if (!isRendered) return;

    previousActiveElement.current = document.activeElement as HTMLElement | null;
    const scrollY = window.scrollY;
    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusFirstElement = () => {
      const firstElement = panelRef.current?.querySelector<HTMLElement>(
        `${focusableSelector}, [autofocus]`,
      );
      firstElement?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(focusFirstElement);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      Object.assign(document.body.style, previousBodyStyles);
      window.scrollTo(0, scrollY);
      previousActiveElement.current?.focus();
    };
  }, [isRendered]);

  if (!isRendered) return null;

  const isSheet = variant === "sheet";

  return (
    <div
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestCloseRef.current();
      }}
      className={`modal-overlay fixed inset-0 z-[60] flex justify-center bg-black/40 p-0 backdrop-blur-sm ${
        isClosing ? "modal-overlay-exit" : "modal-overlay-enter"
      } ${
        isSheet ? "items-end sm:items-center sm:p-4" : "items-center p-4"
      }`}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`modal-panel flex max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full flex-col overflow-hidden bg-white shadow-xl ${sizeClasses[size]} ${
          isClosing ? "modal-panel-exit" : isSheet ? "modal-sheet-enter" : "modal-dialog-enter"
        } ${
          isSheet ? "rounded-t-3xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl" : "rounded-3xl"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between px-6 pb-3 pt-5">
          <h2 id={titleId} className="text-lg font-bold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Cerrar ventana"
            onClick={() => requestCloseRef.current()}
            className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}