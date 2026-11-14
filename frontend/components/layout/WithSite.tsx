"use client";

import { type ReactNode, Suspense } from "react";
import { ErrorMessage } from "@/components/ui/states/ErrorMessage";
import { LoadingSkeleton } from "@/components/ui/states/LoadingSkeleton";
import type { ClimateSite } from "@/lib/data/climate";
import { useClimateSite } from "@/lib/use-climate-site";

type Props = { render: (site: ClimateSite) => ReactNode; showStates?: boolean };

const loading = <LoadingSkeleton label="Loading NASA climate data" lines={6} />;

function SelectedSite({ render, showStates }: Props) {
  const { site, error, retry } = useClimateSite();
  if (site) return render(site);
  if (!showStates) return null;
  return error ? <ErrorMessage message={error} onRetry={retry} /> : loading;
}

// showStates: the page shows the loading and error states; the sidebar and top bar stay empty until data arrives.
export function WithSite(props: Props) {
  return (
    <Suspense fallback={props.showStates ? loading : null}>
      <SelectedSite {...props} />
    </Suspense>
  );
}
