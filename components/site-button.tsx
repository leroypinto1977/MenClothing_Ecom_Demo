import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none select-none";

const variants = {
  solid: "bg-foreground text-background hover:bg-foreground/85",
  outline:
    "border border-foreground/70 text-foreground hover:bg-foreground hover:text-background",
  outlineLight:
    "border border-background/60 text-background hover:bg-background hover:text-foreground",
  light: "bg-background text-foreground hover:bg-background/90",
  brand: "bg-brand text-brand-foreground hover:bg-brand/90",
  subtle: "bg-secondary text-secondary-foreground hover:bg-accent",
} as const;

const sizes = {
  sm: "h-9 px-5",
  md: "h-11 px-7",
  lg: "h-12 px-8",
  block: "h-12 w-full px-8",
  blockLg: "h-[3.25rem] w-full px-8",
} as const;

export type SiteButtonProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
} & (
  | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">)
  | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
);

export function SiteButton({
  variant = "solid",
  size = "md",
  className,
  children,
  ...props
}: SiteButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
