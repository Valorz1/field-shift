import { cx } from "@/lib/cx";
import type { ConnectionStatus } from "@/lib/view-models";

const statuses: Record<ConnectionStatus, { label: string; dot: string; pill: string }> = {
  connected: { label: "Connected", dot: "bg-success", pill: "bg-green-tint text-green-ink" },
  available: { label: "Available", dot: "bg-water", pill: "bg-water-tint text-water-ink" },
  loading: { label: "Loading", dot: "bg-neutral motion-safe:animate-pulse", pill: "bg-neutral-tint text-neutral-ink" },
  unavailable: { label: "Unavailable", dot: "bg-danger", pill: "bg-danger-tint text-danger-ink" },
};

export function StatusPill({ status }: { status: ConnectionStatus }) {
  const { label, dot, pill } = statuses[status];
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", pill)}>
      <span aria-hidden="true" className={cx("size-2 rounded-full", dot)} />
      {label}
    </span>
  );
}
