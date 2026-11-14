import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SectionTitle } from "./SectionTitle";

// The page layout system. Every app page is:
//   <Page>
//     <PageIntro … />            title and one-line description
//     <PageSection … />          one block of content, with its own heading
//   </Page>
// The shell sets the width and the side padding; Page sets the space between blocks.
export function Page({ children }: { children: ReactNode }) {
  return <div className="space-y-8">{children}</div>;
}

type SectionProps = { id: string; icon: LucideIcon; title: string; description?: string; children: ReactNode };

export function PageSection({ id, icon, title, description, children }: SectionProps) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <div className="space-y-1">
        <SectionTitle id={id} icon={icon}>
          {title}
        </SectionTitle>
        {description && <p className="max-w-3xl text-base text-caption">{description}</p>}
      </div>
      {children}
    </section>
  );
}
