import "./globals.css";
import type { Metadata } from "next";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/manrope/wght.css";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Rotara: crop plans from NASA data",
  description: "Rotara turns NASA Earth observations into 3 crop rotation plans for your field. You decide.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
