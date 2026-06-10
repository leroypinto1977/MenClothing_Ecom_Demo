"use client";

import * as React from "react";

const MESSAGES = [
  "Complimentary shipping on orders over ₹12,000",
  "Free 30-day returns — wear it, live in it, decide later",
  "New season knitwear has landed",
];

export function AnnouncementBar() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % MESSAGES.length),
      4500
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-center px-5 text-center">
        <p
          key={index}
          className="animate-fade-in text-[0.6875rem] font-medium uppercase tracking-[0.2em]"
        >
          {MESSAGES[index]}
        </p>
      </div>
    </div>
  );
}
