import "./globals.css";
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "Rotara: crop plans from NASA data",
  description: "Rotara turns NASA Earth observations into 3 crop rotation plans for your field. You decide.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
