"use client";

import * as React from "react";

const FALLBACK = ["Complimentary shipping on orders over ₹12,000"];

export function AnnouncementBar({ messages }: { messages?: string[] }) {
  const list = messages && messages.length > 0 ? messages : FALLBACK;
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (list.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), 4500);
    return () => clearInterval(id);
  }, [list.length]);

  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-center px-5 text-center">
        <p
          key={index}
          className="animate-fade-in text-[0.6875rem] font-medium uppercase tracking-[0.2em]"
        >
          {list[index % list.length]}
        </p>
      </div>
    </div>
  );
}
