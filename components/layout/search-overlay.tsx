"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Container } from "@/components/container";
import { useUI } from "@/lib/store/ui-context";
import { searchProducts } from "@/lib/data";
import { formatPrice } from "@/lib/format";

const POPULAR = ["Oxford", "Merino", "Overcoat", "Chino", "Leather", "Cashmere"];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUI();
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (searchOpen) {
      setQuery("");
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  const results = React.useMemo(() => searchProducts(query).slice(0, 6), [query]);

  const close = () => setSearchOpen(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    close();
  };

  return (
    <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
      <SheetContent
        side="top"
        showCloseButton={false}
        className="h-auto max-h-[88vh] overflow-y-auto p-0"
      >
        <Container className="py-5 md:py-7">
          <form onSubmit={submit} className="flex items-center gap-3 border-b border-border pb-4">
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for shirts, knitwear, leather…"
              className="w-full bg-transparent font-serif text-xl outline-none placeholder:text-muted-foreground/60 md:text-2xl"
            />
            <button
              type="button"
              onClick={close}
              aria-label="Close search"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </form>

          {query.trim() === "" ? (
            <div className="py-6">
              <p className="label-eyebrow text-muted-foreground">Popular searches</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground/80 transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No results for “{query}”. Try a different term.
            </p>
          ) : (
            <div className="py-5">
              <p className="label-eyebrow text-muted-foreground">
                {results.length} result{results.length > 1 ? "s" : ""}
              </p>
              <ul className="mt-3 divide-y divide-border">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.slug}`}
                      onClick={close}
                      className="flex items-center gap-4 py-3"
                    >
                      <div className="relative size-14 shrink-0 overflow-hidden bg-muted">
                        <Image
                          src={p.images[0].thumb}
                          alt={p.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {p.category}
                        </p>
                      </div>
                      <span className="text-sm">{formatPrice(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </SheetContent>
    </Sheet>
  );
}
