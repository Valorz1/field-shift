import "./globals.css";
import type { ReactNode } from "react";

export const metadata = { title: "Field Shift", description: "Climate-aware farm planning workspace" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
