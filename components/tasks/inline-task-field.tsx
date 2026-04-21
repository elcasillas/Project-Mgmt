"use client";

import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

type MenuPosition = {
  left: number;
  top: number;
  minWidth: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function InlineTaskField<TValue extends string>({
  label,
  value,
  options,
  editable,
  onSave
}: {
  label: string;
  value: TValue;
  options: TValue[];
  editable: boolean;
  onSave: (nextValue: TValue) => Promise<void>;
}) {
  const listboxId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(() => Math.max(0, options.indexOf(value)));
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setHighlightedIndex(Math.max(0, options.indexOf(value)));
  }, [isOpen, options, value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    optionRefs.current[highlightedIndex]?.focus();
  }, [highlightedIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function updatePosition() {
      const button = buttonRef.current;
      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();
      const viewportPadding = 8;
      const menuWidth = Math.max(rect.width, 180);
      const menuHeight = options.length * 36 + 12;
      const hasRoomBelow = rect.bottom + menuHeight + viewportPadding <= window.innerHeight;
      const top = hasRoomBelow ? rect.bottom + 6 : Math.max(viewportPadding, rect.top - menuHeight - 6);

      setPosition({
        left: clamp(rect.left, viewportPadding, Math.max(viewportPadding, window.innerWidth - menuWidth - viewportPadding)),
        top,
        minWidth: rect.width
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, options.length]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  async function selectValue(nextValue: TValue) {
    if (isSaving || nextValue === value) {
      setIsOpen(false);
      buttonRef.current?.focus();
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setIsOpen(false);
      await onSave(nextValue);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : `Unable to update ${label.toLowerCase()}.`;
      setError(message);
    } finally {
      setIsSaving(false);
      buttonRef.current?.focus();
    }
  }

  if (!editable) {
    return <Badge value={value} />;
  }

  return (
    <div className="relative inline-flex flex-col items-start gap-1">
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          "group inline-flex max-w-full items-center gap-1.5 rounded-full outline-none transition focus:ring-2 focus:ring-[#00ADB1]/35",
          isSaving ? "cursor-wait opacity-70" : "hover:brightness-[0.98]"
        )}
        aria-label={`Change task ${label.toLowerCase()}: ${value}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        disabled={isSaving}
        onClick={() => {
          setError(null);
          setIsOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setError(null);
            setIsOpen(true);
          }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setError(null);
            setIsOpen(true);
          }
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
      >
        <Badge value={value} />
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition group-hover:bg-slate-100 group-hover:text-slate-600">
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </button>
      {error ? (
        <span className="absolute left-0 top-full z-20 mt-1 w-max max-w-[220px] rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 shadow-sm">
          {error}
        </span>
      ) : null}
      {isMounted && isOpen && position
        ? createPortal(
            <div
              ref={menuRef}
              id={listboxId}
              role="listbox"
              aria-label={`Task ${label.toLowerCase()}`}
              className="fixed z-50 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_42px_rgba(15,23,42,0.18)] outline-none"
              style={{ left: position.left, top: position.top, minWidth: position.minWidth }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setHighlightedIndex((current) => (current + 1) % options.length);
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setHighlightedIndex((current) => (current - 1 + options.length) % options.length);
                }
                if (event.key === "Home") {
                  event.preventDefault();
                  setHighlightedIndex(0);
                }
                if (event.key === "End") {
                  event.preventDefault();
                  setHighlightedIndex(options.length - 1);
                }
                if (event.key === "Enter") {
                  event.preventDefault();
                  void selectValue(options[highlightedIndex]);
                }
              }}
            >
              {options.map((option, index) => {
                const selected = option === value;

                return (
                  <button
                    key={option}
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    tabIndex={index === highlightedIndex ? 0 : -1}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-sm font-medium outline-none transition",
                      index === highlightedIndex ? "bg-slate-100 text-slate-950" : "text-slate-700 hover:bg-slate-50"
                    )}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => void selectValue(option)}
                  >
                    <Badge value={option} className="px-2.5 py-0.5 text-[11px]" />
                    <Check className={cn("h-4 w-4 text-[#00ADB1]", selected ? "opacity-100" : "opacity-0")} />
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
