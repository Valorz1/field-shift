import { CalendarX } from "lucide-react";

export function EmptyState({ message = "No data for these dates. Try a wider date range." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-inner border border-dashed border-sage p-6 text-center text-caption">
      <CalendarX aria-hidden="true" className="size-5" strokeWidth={1.6} />
      <p>{message}</p>
    </div>
  );
}
