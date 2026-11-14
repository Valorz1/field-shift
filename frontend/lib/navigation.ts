import {
  ClipboardList,
  Columns3,
  House,
  Layers,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Sprout,
  Thermometer,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  // Pages inside the app keep the farm that is open (?site=...) when you move between them.
  keepsFarm: boolean;
  // Pages that show NASA numbers for one field. The top bar shows the period and the alerts on these.
  aboutField?: boolean;
};

export type NavGroup = { title: string; items: NavItem[] };

// One list for the sidebar, the phone menu and the top bar, so they can never disagree.
export const navGroups: NavGroup[] = [
  {
    title: "Farm",
    items: [
      { href: "/", label: "Overview", shortLabel: "Start", icon: House, keepsFarm: false },
      { href: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard, keepsFarm: true, aboutField: true },
      { href: "/climate", label: "Climate", shortLabel: "Climate", icon: Thermometer, keepsFarm: true, aboutField: true },
      { href: "/soil", label: "Soil Intelligence", shortLabel: "Soil", icon: Layers, keepsFarm: true, aboutField: true },
    ],
  },
  {
    title: "Plan",
    items: [
      { href: "/strategies", label: "Strategies", shortLabel: "Plans", icon: Sprout, keepsFarm: true, aboutField: true },
      { href: "/compare", label: "Compare", shortLabel: "Compare", icon: Columns3, keepsFarm: true, aboutField: true },
    ],
  },
  {
    title: "Session",
    items: [
      { href: "/session", label: "Farm session", shortLabel: "Session", icon: ClipboardList, keepsFarm: true },
      { href: "/settings", label: "Settings", shortLabel: "Settings", icon: Settings, keepsFarm: true },
    ],
  },
];

export const navItems: NavItem[] = navGroups.flatMap((group) => group.items);

// The 4 pages a farmer opens most, for the bar at the bottom of a phone.
export const tabItems: NavItem[] = ["/dashboard", "/climate", "/soil", "/strategies"].map(
  (href) => navItems.find((item) => item.href === href)!,
);

export const navKey = (item: NavItem) => item.href;

export const isActivePath = (pathname: string, item: NavItem) =>
  item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

export const currentItem = (pathname: string) => navItems.find((item) => isActivePath(pathname, item));

// A link to another app page that keeps the example farm that is open. A pinned field lives in the
// session, not in the address, so it needs nothing added.
export const farmHref = (href: string, place: { id: string }) =>
  place.id.startsWith("pin:") ? href : `${href}?site=${place.id}`;
