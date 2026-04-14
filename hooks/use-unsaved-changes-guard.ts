"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

function serializeForm(form: HTMLFormElement) {
  const formData = new FormData(form);
  const values: string[] = [];

  for (const [key, value] of formData.entries()) {
    values.push(`${key}:${value instanceof File ? `${value.name}:${value.size}:${value.type}` : String(value)}`);
  }

  return values.join("|");
}

export function useUnsavedChangesGuard({
  formRef,
  open,
  onDiscard,
  resetKey
}: {
  formRef: React.RefObject<HTMLFormElement | null>;
  open: boolean;
  onDiscard: () => void;
  resetKey?: string | number;
}) {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const initialSnapshotRef = useRef("");
  const pendingActionRef = useRef<(() => void) | null>(null);
  const bypassDirtyGuardRef = useRef(false);
  const bypassPopRef = useRef(false);
  const popGuardActiveRef = useRef(false);

  const markClean = useCallback(() => {
    if (formRef.current) {
      initialSnapshotRef.current = serializeForm(formRef.current);
    }
    setIsDirty(false);
    setConfirmOpen(false);
    pendingActionRef.current = null;
  }, [formRef]);

  const markCleanUntilNextChange = useCallback(() => {
    markClean();
    bypassDirtyGuardRef.current = true;
  }, [markClean]);

  const requestLeave = useCallback(
    (action: () => void) => {
      if (!open || !isDirty || bypassDirtyGuardRef.current) {
        action();
        return;
      }

      pendingActionRef.current = action;
      setConfirmOpen(true);
    },
    [isDirty, open]
  );

  useEffect(() => {
    if (!open || !formRef.current) {
      setIsDirty(false);
      return;
    }

    const form = formRef.current;
    const frame = window.requestAnimationFrame(() => {
      initialSnapshotRef.current = serializeForm(form);
      setIsDirty(false);
    });

    const updateDirtyState = () => {
      const nextIsDirty = serializeForm(form) !== initialSnapshotRef.current;
      if (nextIsDirty) {
        bypassDirtyGuardRef.current = false;
      }
      setIsDirty(nextIsDirty);
    };

    form.addEventListener("input", updateDirtyState);
    form.addEventListener("change", updateDirtyState);

    return () => {
      window.cancelAnimationFrame(frame);
      form.removeEventListener("input", updateDirtyState);
      form.removeEventListener("change", updateDirtyState);
    };
  }, [formRef, open, resetKey]);

  useEffect(() => {
    if (!open || !isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, open]);

  useEffect(() => {
    if (!open || !isDirty) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const destination = new URL(href, window.location.href);
      if (destination.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      requestLeave(() => {
        markClean();
        router.push((destination.pathname + destination.search + destination.hash) as Route);
      });
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [isDirty, markClean, open, requestLeave, router]);

  useEffect(() => {
    if (!open || !isDirty || popGuardActiveRef.current) {
      return;
    }

    popGuardActiveRef.current = true;
    window.history.pushState({ unsavedChangesGuard: true }, "", window.location.href);

    const handlePopState = () => {
      if (bypassPopRef.current) {
        bypassPopRef.current = false;
        return;
      }

      window.history.pushState({ unsavedChangesGuard: true }, "", window.location.href);
      requestLeave(() => {
        markClean();
        bypassPopRef.current = true;
        popGuardActiveRef.current = false;
        window.history.go(-2);
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      popGuardActiveRef.current = false;
    };
  }, [isDirty, markClean, open, requestLeave]);

  return {
    isDirty,
    confirmOpen,
    requestClose: () => requestLeave(onDiscard),
    confirmLeave: () => {
      const action = pendingActionRef.current;
      markClean();
      action?.();
    },
    stay: () => {
      pendingActionRef.current = null;
      setConfirmOpen(false);
    },
    markClean,
    markCleanUntilNextChange
  };
}
