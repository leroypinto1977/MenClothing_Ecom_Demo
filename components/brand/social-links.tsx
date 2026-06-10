import { cn } from "@/lib/utils";

type IconProps = { className?: string };

function Instagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function X({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function Youtube({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.4A3 3 0 0 0 .5 6.5C0 8.4 0 12 0 12s0 3.6.5 5.5a3 3 0 0 0 2.1 2.1C4.5 20 12 20 12 20s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1C24 15.6 24 12 24 12s0-3.6-.5-5.5ZM9.6 15.5v-7l6.3 3.5-6.3 3.5Z" />
    </svg>
  );
}

function Pinterest({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.08 2.45 7.59 5.96 9.13-.08-.78-.16-1.97.03-2.82.17-.74 1.1-4.7 1.1-4.7s-.28-.56-.28-1.4c0-1.31.76-2.29 1.7-2.29.8 0 1.19.6 1.19 1.32 0 .8-.51 2-.78 3.11-.22.93.47 1.69 1.39 1.69 1.66 0 2.94-1.76 2.94-4.29 0-2.24-1.61-3.81-3.91-3.81-2.67 0-4.23 2-4.23 4.06 0 .8.31 1.66.69 2.13a.28.28 0 0 1 .06.27c-.07.29-.23.93-.26 1.06-.04.17-.14.21-.32.13-1.2-.56-1.95-2.3-1.95-3.7 0-3.02 2.19-5.79 6.32-5.79 3.32 0 5.9 2.36 5.9 5.52 0 3.3-2.08 5.95-4.96 5.95-.97 0-1.88-.5-2.19-1.1l-.6 2.27c-.21.84-.8 1.9-1.19 2.54.9.28 1.84.43 2.83.43 5.52 0 10-4.48 10-10S17.52 2 12 2Z" />
    </svg>
  );
}

const socials = [
  { name: "Instagram", Icon: Instagram },
  { name: "X", Icon: X },
  { name: "YouTube", Icon: Youtube },
  { name: "Pinterest", Icon: Pinterest },
];

export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-3", className)}>
      {socials.map(({ name, Icon }) => (
        <a
          key={name}
          href="#"
          aria-label={name}
          className="flex size-9 items-center justify-center rounded-full border border-border text-foreground/70 transition-colors hover:border-foreground hover:text-foreground"
        >
          <Icon className="size-[1.05rem]" />
        </a>
      ))}
    </div>
  );
}
