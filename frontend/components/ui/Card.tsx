import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type CardProps = HTMLAttributes<HTMLElement> & { as?: "section" | "article" | "div" };

export function Card({ as: Tag = "section", className, ...props }: CardProps) {
  return <Tag className={cx("rounded-card border border-line bg-white p-5", className)} {...props} />;
}
