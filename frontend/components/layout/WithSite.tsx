"use client";

import { type ReactNode, Suspense } from "react";
import { ErrorMessage } from "@/components/ui/states/ErrorMessage";
import { LoadingSkeleton } from "@/components/ui/states/LoadingSkeleton";
import { type ClimateSite, isPin } from "@/lib/data/climate";
import { useClimateSite } from "@/lib/use-climate-site";

type Props = { render: (site: ClimateSite) => ReactNode; showStates?: boolean };

const loading = <LoadingSkeleton label="Loading NASA climate data" lines={6} />;

function SelectedSite({ render, showStates }: Props) {
  const { place, site, error, retry } = useClimateSite();
  if (site) return render(site);
  if (!showStates) return null;
  if (error) return <ErrorMessage message={error} onRetry={retry} />;
  return (
    <div className="space-y-3">
      {isPin(place) && (
        <p className="text-base text-ink">Getting NASA data for your field. The first time can take up to a minute.</p>
      )}
      {loading}
    </div>
  );
}

// showStates: the page shows the loading and error states; the sidebar and top bar stay empty until data arrives.
export function WithSite(props: Props) {
  return (
    <Suspense fallback={props.showStates ? loading : null}>
      <SelectedSite {...props} />
    </Suspense>
  );
}
