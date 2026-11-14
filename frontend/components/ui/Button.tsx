import Link, { type LinkProps } from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "on-dark";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "border border-sage bg-white text-forest hover:border-primary hover:bg-green-tint",
  "on-dark": "border border-on-forest-muted text-white hover:bg-white/10 focus-visible:outline-white",
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const buttonClasses = (variant: Variant = "primary", className?: string) =>
  cx(base, variants[variant], className);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}

type ButtonLinkProps = LinkProps & {
  variant?: Variant;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
};

export function ButtonLink({ variant, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, className)} {...props} />;
}
