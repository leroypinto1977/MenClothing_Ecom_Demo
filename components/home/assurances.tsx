import { Truck, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/container";

const ITEMS = [
  { Icon: Truck, title: "Complimentary shipping", body: "On orders over ₹12,000" },
  { Icon: RotateCcw, title: "30-day returns", body: "Wear it, live in it, decide" },
  { Icon: Sparkles, title: "Crafted in Europe", body: "Small-workshop production" },
  { Icon: ShieldCheck, title: "Secure checkout", body: "Encrypted & protected" },
];

export function Assurances() {
  return (
    <section className="border-y border-border">
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:grid-cols-4">
          {ITEMS.map(({ Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-brand" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
