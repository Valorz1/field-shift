import { KpiCard } from "@/components/dashboard/KpiCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { StrategyCard } from "@/components/strategies/StrategyCard";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { demoFarm, demoKpis, demoStrategies } from "@/lib/sample-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Good day"
        lead="Here is your farm's environmental overview and latest agricultural intelligence."
      >
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-caption">
          <li>
            {demoFarm.locationLabel} · {demoFarm.coordinates}
          </li>
          <li>History analysed: {demoFarm.historyRange}</li>
          <li className="inline-flex items-center gap-1.5 font-medium text-warning-ink">
            <span aria-hidden="true" className="size-2 rounded-full bg-earth" />
            Showing sample data, not live NASA measurements
          </li>
        </ul>
      </PageHeader>

      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Farm conditions, {demoFarm.period}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {demoKpis.map((kpi) => (
            <KpiCard key={kpi.kind} kpi={kpi} />
          ))}
        </div>
      </section>

      <section aria-labelledby="strategies-heading" className="space-y-4">
        <h2 id="strategies-heading" className="font-display text-lg font-bold text-forest">
          Your Crop Rotation Strategies
        </h2>
        <div className="grid gap-4 xl:grid-cols-3">
          {demoStrategies.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </div>
        <Disclaimer />
      </section>
    </div>
  );
}
