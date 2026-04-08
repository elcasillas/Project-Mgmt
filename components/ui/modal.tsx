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
  children
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 p-4 backdrop-blur-[20px]">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[12px] bg-[#f5f5f7] p-6 shadow-soft">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[28px] font-semibold leading-[1.14] tracking-[-0.02em] text-[#1d1d1f]">{title}</h2>
            {description ? <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.01em] text-[rgba(29,29,31,0.56)]">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" className="bg-[rgba(255,255,255,0.72)]" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
