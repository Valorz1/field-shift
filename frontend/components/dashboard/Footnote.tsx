import { statusRuleText } from "@/lib/climate-facts";
import type { ClimateSite } from "@/lib/data/climate";
import { formatCoordinates, formatYears } from "@/lib/format";

export function Footnote({ site }: { site: ClimateSite }) {
  const { annual, source, year } = site;
  return (
    <aside aria-labelledby="footnote-heading" className="space-y-2 border-t border-line pt-4 text-sm text-caption">
      <h3 id="footnote-heading" className="text-base font-semibold text-ink">
        About these numbers
      </h3>
      <ul className="space-y-1.5">
        <li>
          {site.name}, {site.region}: {formatCoordinates(site.latitude, site.longitude)}
          {site.elevationM !== undefined && `, ${site.elevationM} m above sea level`}.
        </li>
        <li>
          {year} average: temperature {annual.temperatureC.toFixed(1)} °C (usual{" "}
          {annual.baselineTemperatureC.toFixed(1)} °C), rain in a year {Math.round(annual.rainfallMm)} mm (usual{" "}
          {Math.round(annual.baselineRainfallMm)} mm).
        </li>
        {statusRuleText().map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
        <li>Grey cards have no data yet. Grey is not a status.</li>
        <li>
          Soil wetness is how wet the root zone was, from the NASA POWER MERRA-2 model, not from a satellite.
          {site.smap
            ? " The Soil page checks it against the NASA SMAP satellite."
            : site.id === "nevada"
              ? " NASA SMAP satellite readings here were not of recommended quality, so they are not used."
              : " NASA SMAP satellite soil data is only ready for the Norfolk example farm."}
        </li>
        <li>Source: NASA POWER monthly data, {formatYears(source.firstYear, source.lastYear)}.</li>
      </ul>
    </aside>
  );
}
