import Link from "next/link";
import { Container } from "@/components/container";
import { Wordmark } from "@/components/brand/wordmark";
import { Newsletter } from "@/components/layout/newsletter";
import { SocialLinks } from "@/components/brand/social-links";
import { footerNav } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <Newsletter />

      <Container className="grid grid-cols-2 gap-10 py-14 md:grid-cols-5">
        <div className="col-span-2">
          <Wordmark href={null} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Considered, well-made menswear essentials — designed in London,
            crafted in Europe, and built to be worn for years.
          </p>
          <SocialLinks className="mt-6" />
        </div>

        {footerNav.map((col) => (
          <div key={col.heading}>
            <p className="label-eyebrow text-muted-foreground">{col.heading}</p>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-foreground/75 transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} MERIDIAN. A demo store. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/about" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/about" className="hover:text-foreground">
              Terms
            </Link>
            <div className="flex items-center gap-1.5 opacity-80">
              {["VISA", "MC", "AMEX", "PAY"].map((p) => (
                <span
                  key={p}
                  className="rounded-sm border border-border px-1.5 py-0.5 text-[0.6rem] font-medium tracking-wider"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
