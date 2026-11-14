"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { clearSession } from "@/lib/session-store";

// Clears everything kept in this tab and goes back to the start page.
export function useEndSession() {
  const router = useRouter();
  return () => {
    clearSession();
    router.replace("/");
  };
}

export function EndSessionButton({ className, variant = "on-dark" }: { className?: string; variant?: "on-dark" | "secondary" }) {
  const endSession = useEndSession();
  return (
    <Button variant={variant} className={className} onClick={endSession}>
      End session and clear data
    </Button>
  );
}
