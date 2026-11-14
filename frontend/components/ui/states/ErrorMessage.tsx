import { CloudOff } from "lucide-react";
import { Button } from "../Button";

type ErrorMessageProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorMessage({
  message = "Could not reach NASA POWER. Check your connection, then try again.",
  onRetry,
}: ErrorMessageProps) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-inner bg-danger-tint p-4 text-danger-ink">
      <CloudOff aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.6} />
      <p className="flex-1">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
