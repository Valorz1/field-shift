import { CircleAlert, CircleCheck, Eye, type LucideIcon } from "lucide-react";
import { cx } from "@/lib/cx";
import type { Status } from "@/lib/view-models";

const statuses: Record<Status, { label: string; icon: LucideIcon; tone: string }> = {
  fine: { label: "Fine", icon: CircleCheck, tone: "border-success bg-green-tint text-green-ink" },
  watch: { label: "Keep an eye on it", icon: Eye, tone: "border-warning bg-warning-tint text-warning-ink" },
  act: { label: "Act now", icon: CircleAlert, tone: "border-danger bg-danger-tint text-danger-ink" },
};

export function StatusTag({ status, className }: { status: Status; className?: string }) {
  const { label, icon: Icon, tone } = statuses[status];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-base font-semibold whitespace-nowrap",
        tone,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" strokeWidth={2} />
      {label}
    </span>
  );
}
