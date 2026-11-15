import "./globals.css";
import type { Metadata } from "next";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/manrope/wght.css";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Field Shift",
  description: "Turning Earth observations into smarter farming decisions.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
