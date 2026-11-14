import { Lock, SlidersHorizontal } from "lucide-react";
import { PageIntro } from "@/components/layout/PageIntro";
import { AiLevelSelector } from "@/components/session/AiLevelSelector";
import { DataSourceStatus } from "@/components/session/DataSourceStatus";
import { EndSessionButton } from "@/components/session/EndSessionButton";
import { Card } from "@/components/ui/Card";

export default function SessionPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        icon={SlidersHorizontal}
        title="Session and AI"
        lead="You decide how much the AI helps. Nothing about your farm is saved."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <AiLevelSelector />
        </Card>
        <Card className="space-y-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest">
            <Lock aria-hidden="true" className="size-5" strokeWidth={1.6} />
            Your privacy
          </h2>
          <ul className="list-disc space-y-1.5 pl-5 text-base text-ink marker:text-sage">
            <li>No account and no database. Your pin and crop are kept in this browser tab only.</li>
            <li>Your pin is sent to NASA POWER for the climate data, and to the map provider to draw the map.</li>
            <li>Free to use. No hidden fees.</li>
          </ul>
          <EndSessionButton variant="secondary" className="w-full" />
        </Card>
      </div>
      <Card className="space-y-4">
        <h2 className="font-display text-lg font-bold text-forest">Where the numbers come from</h2>
        <DataSourceStatus />
      </Card>
    </div>
  );
}
