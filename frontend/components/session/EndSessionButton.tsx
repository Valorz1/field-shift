"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { clearSession } from "@/lib/session-store";

export function EndSessionButton({ className }: { className?: string }) {
  const router = useRouter();

  const endSession = () => {
    clearSession();
    router.replace("/");
  };

  return (
    <Button variant="on-dark" className={className} onClick={endSession}>
      End session and clear data
    </Button>
  );
}
