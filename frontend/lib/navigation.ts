import { House, Layers, type LucideIcon, SlidersHorizontal, Sprout, Thermometer } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  // Sections of the dashboard keep the farm that is open (?site=...); other pages don't need it.
  section?: string;
};

// Everything a farmer needs is on the dashboard, so Climate, Soil and Plans jump to its sections.
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", shortLabel: "Home", icon: House },
  { href: "/dashboard", section: "climate", label: "Climate", shortLabel: "Climate", icon: Thermometer },
  { href: "/dashboard", section: "soil", label: "Soil", shortLabel: "Soil", icon: Layers },
  { href: "/dashboard", section: "plans", label: "Crop plans", shortLabel: "Plans", icon: Sprout },
  { href: "/session", label: "Session and AI", shortLabel: "Session", icon: SlidersHorizontal },
];

export const navKey = (item: NavItem) => `${item.href}#${item.section ?? ""}`;

// Only whole pages are marked as the current page; a jump to a section is not a page of its own.
export const isActivePath = (pathname: string, item: NavItem) =>
  !item.section && (pathname === item.href || pathname.startsWith(`${item.href}/`));
