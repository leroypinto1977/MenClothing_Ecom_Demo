import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  href = "/",
}: {
  className?: string;
  href?: string | null;
}) {
  const content = (
    <span
      className={cn(
        "font-sans text-xl font-semibold uppercase leading-none tracking-[0.34em] text-foreground",
        className
      )}
    >
      Meridian
    </span>
  );
  if (href === null) return content;
  return (
    <Link href={href} aria-label="MERIDIAN — home" className="inline-flex">
      {content}
    </Link>
  );
}

/** Small circular monogram mark. */
export function Monogram({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border border-current font-serif text-base leading-none",
        className
      )}
      aria-hidden
    >
      M
    </span>
  );
}
