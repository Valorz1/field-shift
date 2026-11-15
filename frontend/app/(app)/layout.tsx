import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

// Every page in this folder is drawn inside the same shell.
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
