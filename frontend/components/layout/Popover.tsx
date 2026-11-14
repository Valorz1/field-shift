"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { cx } from "@/lib/cx";

type Props = {
  // The spoken name of the button.
  label: string;
  // What the button shows.
  button: ReactNode;
  // Padding and width of the button. Left out, it gets the usual side padding.
  buttonClass?: string;
  // Which edge of the button the panel lines up with, on tablets and desktops.
  align?: "start" | "end";
  panelClass?: string;
  children: ReactNode;
};

export const barButton =
  "fs-press inline-flex h-11 items-center gap-2 rounded-control text-sm font-medium text-ink transition-colors hover:bg-white aria-expanded:bg-white md:h-10";

// A button that opens a small panel under the top bar. Closes on Escape, on a click outside,
// when focus leaves it, and when a link or a [data-close] control inside it is used.
// On phones the panel spans the screen; on wider screens it hangs from its button.
export function Popover({ label, button, buttonClass, align = "start", panelClass, children }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className="sm:relative"
      onBlur={(event) => {
        if (event.relatedTarget && !root.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={cx(barButton, buttonClass ?? "px-2.5")}
      >
        {button}
      </button>
      <div
        id={panelId}
        inert={!open}
        data-open={open}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a, [data-close]")) setOpen(false);
        }}
        className={cx(
          "fs-pop absolute top-full right-3 left-3 z-30 mt-2 rounded-card border border-line bg-white p-2 text-ink shadow-[0_16px_40px_-18px_rgb(23_63_50/0.35)] sm:w-80",
          align === "start" ? "sm:right-auto sm:left-0" : "sm:right-0 sm:left-auto",
          panelClass,
        )}
      >
        {children}
      </div>
    </div>
  );
}
