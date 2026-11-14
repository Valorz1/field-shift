import { ClipboardList, Database, Lock } from "lucide-react";
import { Page, PageSection } from "@/components/layout/Page";
import { PageIntro } from "@/components/layout/PageIntro";
import { DataSourceStatus } from "@/components/session/DataSourceStatus";
import { EndSessionButton } from "@/components/session/EndSessionButton";
import { SessionSummary } from "@/components/session/SessionSummary";
import { Card } from "@/components/ui/Card";

export default function SessionPage() {
  return (
    <Page>
      <PageIntro
        icon={ClipboardList}
        title="Farm session"
        lead="What Field Shift is holding for this visit. It stays in this browser tab and is gone when you finish."
      />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-6">
        <PageSection id="session-now" icon={ClipboardList} title="This session">
          <Card className="space-y-3">
            <SessionSummary />
          </Card>
        </PageSection>
        <PageSection id="session-privacy" icon={Lock} title="Your privacy">
          <Card className="space-y-4">
            <ul className="list-disc space-y-1.5 pl-5 text-base text-ink marker:text-sage">
              <li>No account and no database. Your pin and crop are kept in this browser tab only.</li>
              <li>Your pin is sent to NASA POWER for the climate data, and to the map provider to draw the map.</li>
              <li>Free to use. No hidden fees.</li>
            </ul>
            <EndSessionButton variant="secondary" className="w-full" />
          </Card>
        </PageSection>
      </div>
      <PageSection id="session-sources" icon={Database} title="Where the numbers come from">
        <Card>
          <DataSourceStatus />
        </Card>
      </PageSection>
    </Page>
  );
}
