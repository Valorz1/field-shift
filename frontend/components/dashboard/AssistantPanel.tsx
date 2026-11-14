"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { sendChat } from "@/lib/api";
import { type Place, isPin } from "@/lib/data/climate";
import { DEFAULT_AI_LEVEL, useSession } from "@/lib/session-store";
import type { ChatFarm } from "@/lib/types";

type Turn = { question: string; reply?: string; note?: string; error?: string };

const MAX_LENGTH = 500; // the backend rejects longer questions

// The conversation lives in this component only: it is gone when the farmer leaves the page.
export function AssistantPanel({ site, crop }: { site: Place; crop: string }) {
  const level = useSession().aiLevel ?? DEFAULT_AI_LEVEL;
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  // A pinned place needs the farmer's crop; the demo farms come with one.
  const needsCrop = isPin(site) && !crop;

  const ask = async (event: FormEvent) => {
    event.preventDefault();
    const message = question.trim();
    if (!message || busy || needsCrop) return;
    const farm: ChatFarm = isPin(site)
      ? { latitude: site.latitude, longitude: site.longitude, crop }
      : { demo: site.id, ...(crop && { crop }) };
    const answer = (turn: Partial<Turn>) =>
      setTurns((all) => all.map((old, index) => (index === all.length - 1 ? { ...old, ...turn } : old)));
    setQuestion("");
    setBusy(true);
    setTurns((all) => [...all, { question: message }]);
    try {
      const { reply, note } = await sendChat({ message, level, farm });
      answer({ reply, note });
    } catch (error) {
      answer({ error: error instanceof Error ? error.message : "Something went wrong. Try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="flex flex-col gap-4" aria-labelledby="assistant-heading">
      <p className="text-base text-caption">
        The AI helper explains the NASA figures and the 3 plans in a line or two. It does not make the plans. AI level{" "}
        {level}:{" "}
        <Link href="/session" className="underline underline-offset-2 hover:text-forest">
          change it on the Session page
        </Link>
        .
      </p>

      {turns.length > 0 && (
        <ol aria-live="polite" className="space-y-4">
          {turns.map((turn, index) => (
            <li key={index} className="space-y-2">
              <p className="font-semibold text-ink">
                <span className="sr-only">You asked: </span>
                {turn.question}
              </p>
              {turn.reply && (
                <div className="space-y-1 rounded-inner bg-page p-4">
                  <SourceBadge source="AI" />
                  <p className="text-ink">{turn.reply}</p>
                  {turn.note && <p className="text-sm text-caption">{turn.note}</p>}
                </div>
              )}
              {turn.error && (
                <p role="alert" className="rounded-inner bg-danger-tint p-4 text-danger-ink">
                  {turn.error}
                </p>
              )}
              {!turn.reply && !turn.error && (
                <p role="status" className="text-caption">
                  Thinking… the first answer can take a few seconds.
                </p>
              )}
            </li>
          ))}
        </ol>
      )}

      <form onSubmit={ask} className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-1 basis-64 flex-col gap-1 text-base font-semibold text-ink">
          Your question
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={MAX_LENGTH}
            required
            disabled={needsCrop}
            placeholder="Is my farm getting drier?"
            className="min-h-12 rounded-control border border-line bg-white px-3 text-base font-normal text-ink"
          />
        </label>
        <Button type="submit" disabled={busy || needsCrop}>
          {busy ? "Asking…" : "Ask"}
        </Button>
      </form>
      {needsCrop && <p className="text-base text-caption">Choose the crop you grow in the plans section first.</p>}
    </Card>
  );
}
