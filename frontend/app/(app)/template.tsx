import type { ReactNode } from "react";

// A template is rebuilt on every move between pages, so each page fades in (see .fs-page in globals.css).
export default function AppTemplate({ children }: { children: ReactNode }) {
  return <div className="fs-page">{children}</div>;
}
