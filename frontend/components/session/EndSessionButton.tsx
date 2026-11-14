"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { clearSession } from "@/lib/session-store";

export function EndSessionButton({ className, variant = "on-dark" }: { className?: string; variant?: "on-dark" | "secondary" }) {
  const router = useRouter();

  const endSession = () => {
    clearSession();
    router.replace("/");
  };

  return (
    <Button variant={variant} className={className} onClick={endSession}>
      End session and clear data
    </Button>
  );
}
