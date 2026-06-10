"use client";

import * as React from "react";
import { Ruler } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const ROWS = [
  { size: "XS", chest: "34–36", waist: "28–30", neck: "14–14.5" },
  { size: "S", chest: "36–38", waist: "30–32", neck: "15" },
  { size: "M", chest: "39–41", waist: "32–34", neck: "15.5–16" },
  { size: "L", chest: "42–44", waist: "35–37", neck: "16.5–17" },
  { size: "XL", chest: "45–47", waist: "38–40", neck: "17.5" },
  { size: "XXL", chest: "48–50", waist: "41–43", neck: "18" },
];

export function SizeGuide() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
      >
        <Ruler className="size-3.5" />
        Size guide
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Size guide</DialogTitle>
            <DialogDescription>
              Measurements in inches. For the best fit, measure a garment you
              already own and compare.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 overflow-hidden border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/60 text-left">
                  <th className="px-4 py-2.5 font-medium">Size</th>
                  <th className="px-4 py-2.5 font-medium">Chest</th>
                  <th className="px-4 py-2.5 font-medium">Waist</th>
                  <th className="px-4 py-2.5 font-medium">Neck</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.size} className="border-t border-border">
                    <td className="px-4 py-2.5 font-medium">{r.size}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.chest}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.waist}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.neck}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Between sizes? We recommend sizing up for a relaxed fit, or down for
            a closer cut.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
