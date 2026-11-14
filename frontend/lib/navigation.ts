import { House, Layers, type LucideIcon, SlidersHorizontal, SlidersVertical, Sprout, Thermometer } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", shortLabel: "Home", icon: House },
  { href: "/climate", label: "Climate Intelligence", shortLabel: "Climate", icon: Thermometer },
  { href: "/soil", label: "Soil Monitoring", shortLabel: "Soil", icon: Layers },
  { href: "/strategies", label: "Crop Strategies", shortLabel: "Strategies", icon: Sprout },
  { href: "/compare", label: "Compare Strategies", icon: SlidersVertical },
  { href: "/session", label: "Session Configuration", shortLabel: "Session", icon: SlidersHorizontal },
];

export const isActivePath = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);
