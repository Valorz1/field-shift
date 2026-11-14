import { Info, Settings, Sparkles } from "lucide-react";
import { Page, PageSection } from "@/components/layout/Page";
import { PageIntro } from "@/components/layout/PageIntro";
import { AiLevelSelector } from "@/components/session/AiLevelSelector";
import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <Page>
      <PageIntro icon={Settings} title="Settings" lead="You decide how much the AI helps. The plans themselves never come from the AI." />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-6">
        <PageSection id="settings-ai" icon={Sparkles} title="AI help">
          <Card>
            <AiLevelSelector />
          </Card>
        </PageSection>
        <PageSection id="settings-about" icon={Info} title="Good to know">
          <Card>
            <ul className="list-disc space-y-1.5 pl-5 text-base text-ink marker:text-sage">
              <li>Your choice is sent with each question you ask the assistant on the dashboard.</li>
              <li>The assistant is Gemma 4, running on this computer. It explains the plans; it does not make them.</li>
              <li>Settings last for this session only. A new session starts at level 2.</li>
              <li>Animations follow your device. If it is set to reduce motion, the app keeps still.</li>
            </ul>
          </Card>
        </PageSection>
      </div>
    </Page>
  );
}
