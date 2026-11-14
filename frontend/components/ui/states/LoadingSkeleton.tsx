export function LoadingSkeleton({ label, lines = 3 }: { label: string; lines?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-4 rounded-full bg-neutral-tint motion-safe:animate-pulse last:w-2/3"
        />
      ))}
    </div>
  );
}
