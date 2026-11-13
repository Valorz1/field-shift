// Shared shell for the app screens: sidebar + top bar go here.
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
