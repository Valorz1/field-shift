import { House, Layers, type LucideIcon, SlidersHorizontal, Sprout, Thermometer } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  // Pages about one farm keep the farm that is open (?site=...) when you move between them.
  keepsFarm: boolean;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", shortLabel: "Home", icon: House, keepsFarm: true },
  { href: "/climate", label: "Climate", shortLabel: "Climate", icon: Thermometer, keepsFarm: true },
  { href: "/soil", label: "Soil", shortLabel: "Soil", icon: Layers, keepsFarm: true },
  { href: "/strategies", label: "Crop plans", shortLabel: "Plans", icon: Sprout, keepsFarm: true },
  { href: "/session", label: "Session and AI", shortLabel: "Session", icon: SlidersHorizontal, keepsFarm: false },
];

export const navKey = (item: NavItem) => item.href;

export const isActivePath = (pathname: string, item: NavItem) =>
  pathname === item.href || pathname.startsWith(`${item.href}/`);
