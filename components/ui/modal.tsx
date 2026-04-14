"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Modal({
  open,
  title,
  description,
  onClose,
  headerActions,
  panelClassName,
  children
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  headerActions?: React.ReactNode;
  panelClassName?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/72 p-2 backdrop-blur-[20px] sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[20px] bg-[#f5f5f7] shadow-soft sm:max-h-[90vh] ${panelClassName ?? ""}`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[rgba(29,29,31,0.08)] bg-[#f5f5f7] px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-[24px] font-semibold leading-[1.14] tracking-[-0.02em] text-[#1d1d1f] sm:text-[28px]">{title}</h2>
            {description ? <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.01em] text-[rgba(29,29,31,0.56)]">{description}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            <Button variant="ghost" size="sm" className="h-11 w-11 bg-[rgba(255,255,255,0.72)] px-0" onClick={onClose} aria-label="Close modal">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
