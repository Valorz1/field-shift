"use client";

import { cx } from "@/lib/cx";
import { type AiLevel, DEFAULT_AI_LEVEL, updateSession, useSession } from "@/lib/session-store";

export const AI_LEVELS: { level: AiLevel; name: string; text: string }[] = [
  { level: 1, name: "Advice only", text: "Short answers about your field. No plans." },
  { level: 2, name: "Compare the plans", text: "Helps you weigh up the 3 plans. You choose." },
  { level: 3, name: "Seasonal planning", text: "Helps you think through the seasons of a plan." },
];

// The farmer decides how much the AI does. The chat sends this level with every question.
export function AiLevelSelector() {
  const current = useSession().aiLevel ?? DEFAULT_AI_LEVEL;
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-base font-semibold text-ink">How much should the AI help?</legend>
      {AI_LEVELS.map(({ level, name, text }) => (
        <label
          key={level}
          className={cx(
            "flex min-h-14 cursor-pointer items-start gap-3 rounded-inner border p-3",
            level === current ? "border-primary bg-green-tint" : "border-line bg-white hover:border-sage",
          )}
        >
          <input
            type="radio"
            name="ai-level"
            value={level}
            checked={level === current}
            onChange={() => updateSession({ aiLevel: level })}
            className="mt-1 size-5 accent-primary"
          />
          <span>
            <span className="block font-semibold text-ink">
              {level} · {name}
            </span>
            <span className="block text-caption">{text}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
