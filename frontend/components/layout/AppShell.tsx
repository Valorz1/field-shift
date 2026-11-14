"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { clearSession } from "../../lib/session-store";

type IconName = "grid" | "chart" | "droplet" | "sprout" | "layers" | "calendar" | "settings" | "chevron" | "menu" | "bell" | "map" | "sun" | "cloud" | "leaf" | "close" | "more" | "arrow" | "check";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<IconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    chart: <><path d="M4 19V5"/><path d="M4 19h17"/><path d="m7 15 4-4 3 2 5-7"/></>,
    droplet: <path d="M12 22a7 7 0 0 0 7-7c0-4-7-13-7-13S5 11 5 15a7 7 0 0 0 7 7Z"/>,
    sprout: <><path d="M12 21v-9"/><path d="M12 13C5 13 3 9 3 4c5 0 9 2 9 9Z"/><path d="M12 16c0-6 3-9 9-9 0 5-3 9-9 9Z"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.1.9-1.1 1.9-1.4-.5a8 8 0 0 1-1.5.9l-.2 1.5h-2.2l-.3-1.5a8 8 0 0 1-1.5-.9l-1.4.5-1.1-1.9 1.1-.9a7 7 0 0 1 0-1.8l-1.1-.9 1.1-1.9 1.4.5a8 8 0 0 1 1.5-.9l.3-1.5h2.2l.2 1.5a8 8 0 0 1 1.5.9l1.4-.5 1.1 1.9-1.1.9a7 7 0 0 1 0 1.8Z"/></>,
    chevron: <path d="m7 10 5 5 5-5"/>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    cloud: <path d="M20 16.2A4.8 4.8 0 0 0 17 7a6 6 0 0 0-11.6 1.7A4.5 4.5 0 0 0 6 17h12"/>,
    leaf: <><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-8 8-16Z"/><path d="M4 21c3-5 7-8 12-11"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const navItems: { label: string; href: string; icon: IconName; group?: string }[] = [
  { label: "Overview", href: "/dashboard", icon: "grid", group: "YOUR FIELD" },
  { label: "Climate", href: "/climate", icon: "chart" },
  { label: "Soil intelligence", href: "/soil", icon: "droplet" },
  { label: "Strategies", href: "/strategies", icon: "sprout", group: "YOUR OPTIONS" },
  { label: "Compare", href: "/compare", icon: "layers" },
  { label: "Farm session", href: "/session", icon: "calendar", group: "SESSION" },
  { label: "Settings", href: "/settings", icon: "settings" }
];

function pageTitle(path: string) {
  if (path === "/dashboard" || path === "/") return "Overview";
  const found = navItems.find((item) => item.href === path);
  return found?.label ?? "Field Shift";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [farm, setFarm] = useState("Your pinned field");
  const [showFarm, setShowFarm] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [showDates, setShowDates] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const title = useMemo(() => pageTitle(pathname), [pathname]);

  function endSession() {
    clearSession();
    setFarm("Your pinned field");
    setSessionEnded(true);
    setShowSession(false);
  }

  return (
    <div className="app-frame">
      <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""} ${mobileMenu ? "sidebar-mobile-open" : ""}`}>
        <div className="brand-row">
          <Link href="/dashboard" className="brand-mark" aria-label="Field Shift home"><Icon name="leaf" size={21}/></Link>
          {!collapsed && <Link href="/dashboard" className="brand-name">field<span>shift</span></Link>}
          <button className="sidebar-collapse icon-button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}><Icon name="menu"/></button>
          <button className="mobile-close icon-button" onClick={() => setMobileMenu(false)} aria-label="Close menu"><Icon name="close"/></button>
        </div>
        <div className="sidebar-section">
          {!collapsed && <p className="nav-eyebrow">YOUR FIELD</p>}
          {navItems.map((item, index) => (
            <div key={item.href}>
              {item.group && index > 0 && !collapsed && <p className="nav-eyebrow nav-eyebrow-spaced">{item.group}</p>}
              <Link href={item.href} onClick={() => setMobileMenu(false)} className={`nav-link ${pathname === item.href ? "nav-link-active" : ""}`} title={collapsed ? item.label : undefined}>
                <Icon name={item.icon}/><span>{item.label}</span>{pathname === item.href && <span className="active-rail"/>}
              </Link>
            </div>
          ))}
        </div>
        {!collapsed && <div className="sidebar-bottom"><div className="session-note"><span className="session-dot"/><div><strong>Guest session</strong><small>Nothing is saved</small></div></div><p className="sidebar-footnote">Climate insight for the land you know.</p></div>}
      </aside>

      {mobileMenu && <button className="mobile-scrim" onClick={() => setMobileMenu(false)} aria-label="Close navigation"/>}

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Open navigation"><Icon name="menu"/></button>
            <span className="topbar-page-title">{title}</span>
            <div className="topbar-divider"/>
            <div className="dropdown-wrap">
              <button className="topbar-select" onClick={() => setShowFarm(!showFarm)} aria-expanded={showFarm}><Icon name="map" size={16}/><span>{farm}</span><Icon name="chevron" size={15}/></button>
              {showFarm && <div className="dropdown-menu farm-menu">{["Norfolk", "Western Nevada", "Your pinned field"].map((name) => <button key={name} onClick={() => {setFarm(name);setShowFarm(false);}}>{name}{farm === name && <Icon name="check" size={15}/>}</button>)}</div>}
            </div>
          </div>
          <div className="topbar-actions">
            <div className="dropdown-wrap">
              <button className="topbar-date" onClick={() => setShowDates(!showDates)} aria-expanded={showDates}><Icon name="calendar" size={16}/><span>2001–2025</span><Icon name="chevron" size={14}/></button>
              {showDates && <div className="dropdown-menu date-menu"><strong>Climate comparison</strong><p>Recent conditions: 2021–2025</p><p>Historical baseline: 2001–2020</p><p>Recent view: last 30 days</p></div>}
            </div>
            <div className="dropdown-wrap">
              <button className="icon-button alert-button" onClick={() => setShowAlerts(!showAlerts)} aria-label="Climate alerts" aria-expanded={showAlerts}><Icon name="bell"/><span className="alert-indicator"/></button>
              {showAlerts && <div className="dropdown-menu alert-menu"><strong>Field watch</strong><p>Climate indicators will appear here when field data is available.</p></div>}
            </div>
            <div className="dropdown-wrap">
              <button className="session-trigger" onClick={() => setShowSession(!showSession)} aria-expanded={showSession}><span className="guest-avatar">G</span><span className="session-trigger-label">Guest session</span><Icon name="chevron" size={14}/></button>
              {showSession && <div className="dropdown-menu session-menu"><strong>Temporary session</strong><p>Your selections stay in this browser session only.</p><button className="danger-menu-action" onClick={endSession}>End session and clear data</button></div>}
            </div>
          </div>
        </header>
        {sessionEnded && <div className="session-cleared" role="status">Session data cleared. You can start again by choosing a field.</div>}
        <main className="page-content">{children}</main>
        <footer className="app-footer"><span>Field Shift</span><span>Climate context for better farm decisions</span></footer>
      </div>
      <nav className="mobile-tabbar" aria-label="Primary navigation">
        <Link href="/dashboard" className={pathname === "/dashboard" ? "mobile-tab-active" : ""}><Icon name="grid"/><span>Overview</span></Link>
        <Link href="/climate" className={pathname === "/climate" ? "mobile-tab-active" : ""}><Icon name="chart"/><span>Climate</span></Link>
        <Link href="/strategies" className={pathname === "/strategies" ? "mobile-tab-active" : ""}><Icon name="sprout"/><span>Plans</span></Link>
        <button onClick={() => setMobileMenu(true)}><Icon name="more"/><span>More</span></button>
      </nav>
    </div>
  );
}
