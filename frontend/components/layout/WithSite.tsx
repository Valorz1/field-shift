"use client";

import { useSearchParams } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { type ClimateSite, getSite } from "@/lib/data/climate";

type Render = (site: ClimateSite) => ReactNode;

function SelectedSite({ render }: { render: Render }) {
  return render(getSite(useSearchParams().get("site")));
}

export function WithSite({ render }: { render: Render }) {
  return (
    <Suspense fallback={render(getSite())}>
      <SelectedSite render={render} />
    </Suspense>
  );
}
