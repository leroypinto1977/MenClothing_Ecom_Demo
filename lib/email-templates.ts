import { formatPrice } from "@/lib/format";
import type { AddressSnapshot } from "@/lib/db/schema";

interface EmailOrder {
  number: string;
  email: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  shippingAddress: AddressSnapshot | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items: { name: string; color: string; size: string; quantity: number; unitPrice: number }[];
}

const BRAND = "#8a6a47";
const INK = "#1c1a17";

function shell(title: string, preheader: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f3f1ea;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1ea;padding:32px 0;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border:1px solid #e6e1d6;">
<tr><td style="padding:28px 32px;border-bottom:1px solid #e6e1d6;">
  <div style="font-size:18px;font-weight:700;letter-spacing:.28em;">MERIDIAN</div>
</td></tr>
<tr><td style="padding:32px;">
  <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;">${title}</h1>
  ${body}
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #e6e1d6;font-size:12px;color:#8a857c;">
  MERIDIAN · Considered menswear, made to last.
</td></tr>
</table>
</td></tr></table></body></html>`;
}

function itemsTable(order: EmailOrder) {
  const rows = order.items
    .map(
      (i) => `<tr>
  <td style="padding:8px 0;font-size:14px;">${i.name}<br><span style="color:#8a857c;font-size:12px;">${i.color} · ${i.size} · Qty ${i.quantity}</span></td>
  <td style="padding:8px 0;font-size:14px;text-align:right;white-space:nowrap;">${formatPrice(i.unitPrice * i.quantity)}</td>
</tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e6e1d6;margin-top:16px;">
${rows}
<tr><td style="padding:10px 0 2px;border-top:1px solid #e6e1d6;font-size:13px;color:#8a857c;">Subtotal</td><td style="padding:10px 0 2px;border-top:1px solid #e6e1d6;text-align:right;font-size:13px;">${formatPrice(order.subtotal)}</td></tr>
<tr><td style="padding:2px 0;font-size:13px;color:#8a857c;">Shipping</td><td style="padding:2px 0;text-align:right;font-size:13px;">${order.shipping === 0 ? "Complimentary" : formatPrice(order.shipping)}</td></tr>
<tr><td style="padding:2px 0;font-size:13px;color:#8a857c;">GST</td><td style="padding:2px 0;text-align:right;font-size:13px;">${formatPrice(order.tax)}</td></tr>
<tr><td style="padding:8px 0 0;font-weight:600;">Total</td><td style="padding:8px 0 0;text-align:right;font-weight:600;">${formatPrice(order.total)}</td></tr>
</table>`;
}

function addressBlock(a: AddressSnapshot | null) {
  if (!a) return "";
  return `<p style="margin:20px 0 0;font-size:13px;color:#8a857c;line-height:1.6;">
  <strong style="color:${INK};">Shipping to</strong><br>
  ${a.name}<br>${a.line1}${a.line2 ? `<br>${a.line2}` : ""}<br>${a.city}${a.region ? `, ${a.region}` : ""} ${a.postal}<br>${a.country}
</p>`;
}

export function orderConfirmationEmail(order: EmailOrder) {
  const body = `
  <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3a3a3c;">
    Thanks for your order. We're preparing it now and will email you again when it ships.
  </p>
  <p style="margin:0;font-size:14px;">Order <strong>${order.number}</strong></p>
  ${itemsTable(order)}
  ${addressBlock(order.shippingAddress)}`;
  return {
    subject: `Order confirmed — ${order.number}`,
    html: shell("Order confirmed", `Your MERIDIAN order ${order.number} is confirmed`, body),
  };
}

export function shippingUpdateEmail(order: EmailOrder) {
  const trackLine = order.trackingNumber
    ? `<p style="margin:0 0 8px;font-size:14px;">Carrier: <strong>${order.carrier ?? "—"}</strong><br>Tracking: <strong>${order.trackingNumber}</strong></p>
       ${order.trackingUrl ? `<p style="margin:0 0 16px;"><a href="${order.trackingUrl}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-size:13px;padding:10px 18px;">Track your parcel</a></p>` : ""}`
    : "";
  const body = `
  <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3a3a3c;">
    Good news — your order <strong>${order.number}</strong> is on its way.
  </p>
  ${trackLine}
  ${itemsTable(order)}
  ${addressBlock(order.shippingAddress)}`;
  return {
    subject: `Your order has shipped — ${order.number}`,
    html: shell("On its way", `Your MERIDIAN order ${order.number} has shipped`, body),
  };
}
