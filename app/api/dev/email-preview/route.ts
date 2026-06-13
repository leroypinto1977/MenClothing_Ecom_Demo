import { createElement } from "react";
import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";

import OrderConfirmationEmail, {
  subject as confirmationSubject,
} from "@/emails/order-confirmation";
import OrderShippedEmail, { subject as shippedSubject } from "@/emails/order-shipped";
import OrderDeliveredEmail, {
  subject as deliveredSubject,
} from "@/emails/order-delivered";
import OrderCancelledEmail, {
  subject as cancelledSubject,
} from "@/emails/order-cancelled";
import RefundIssuedEmail, { subject as refundSubject } from "@/emails/refund-issued";
import PaymentFailedEmail, {
  subject as paymentFailedSubject,
} from "@/emails/payment-failed";
import WelcomeEmail, { subject as welcomeSubject } from "@/emails/welcome";
import PasswordResetEmail, {
  subject as passwordResetSubject,
} from "@/emails/password-reset";
import AdminNewOrderEmail, {
  subject as adminNewOrderSubject,
} from "@/emails/admin-new-order";

// Each entry renders the template with its own PreviewProps sample data.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEmail = ((props: any) => React.ReactElement) & { PreviewProps?: any };

interface Entry {
  slug: string;
  label: string;
  Component: AnyEmail;
  subject: string;
}

const ENTRIES: Entry[] = [
  {
    slug: "welcome",
    label: "Welcome",
    Component: WelcomeEmail,
    subject: welcomeSubject(),
  },
  {
    slug: "order-confirmation",
    label: "Order confirmation",
    Component: OrderConfirmationEmail,
    subject: confirmationSubject(OrderConfirmationEmail.PreviewProps.order),
  },
  {
    slug: "payment-failed",
    label: "Payment failed",
    Component: PaymentFailedEmail,
    subject: paymentFailedSubject(PaymentFailedEmail.PreviewProps.order),
  },
  {
    slug: "order-shipped",
    label: "Order shipped",
    Component: OrderShippedEmail,
    subject: shippedSubject(OrderShippedEmail.PreviewProps.order),
  },
  {
    slug: "order-delivered",
    label: "Order delivered",
    Component: OrderDeliveredEmail,
    subject: deliveredSubject(OrderDeliveredEmail.PreviewProps.order),
  },
  {
    slug: "order-cancelled",
    label: "Order cancelled",
    Component: OrderCancelledEmail,
    subject: cancelledSubject(OrderCancelledEmail.PreviewProps.order),
  },
  {
    slug: "refund-issued",
    label: "Refund issued",
    Component: RefundIssuedEmail,
    subject: refundSubject(RefundIssuedEmail.PreviewProps.order),
  },
  {
    slug: "password-reset",
    label: "Password reset",
    Component: PasswordResetEmail,
    subject: passwordResetSubject(),
  },
  {
    slug: "admin-new-order",
    label: "Admin · new order",
    Component: AdminNewOrderEmail,
    subject: adminNewOrderSubject(AdminNewOrderEmail.PreviewProps.order),
  },
];

function galleryHtml(req: NextRequest): string {
  const base = req.nextUrl.pathname;
  const cards = ENTRIES.map(
    (e) => `
    <a class="card" href="${base}?template=${e.slug}" target="_blank" rel="noopener">
      <div class="meta">
        <p class="label">${e.label}</p>
        <p class="subject">${e.subject}</p>
        <code>${e.slug}</code>
      </div>
      <div class="frame">
        <iframe src="${base}?template=${e.slug}" loading="lazy" title="${e.label}"></iframe>
      </div>
    </a>`
  ).join("");

  return `<!doctype html><html><head><meta charset="utf-8">
<title>Email templates — MERIDIAN (dev)</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root { color-scheme: light; }
  body { margin: 0; background: #f3f1ea; font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #1c1a17; }
  header { padding: 28px 32px 8px; }
  h1 { font-family: Georgia, serif; font-size: 24px; margin: 0; }
  p.sub { color: #8a857c; font-size: 14px; margin: 6px 0 0; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; padding: 24px 32px 48px; }
  .card { display: block; text-decoration: none; color: inherit; background: #fff; border: 1px solid #e6e1d6; border-radius: 6px; overflow: hidden; transition: box-shadow .15s; }
  .card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.08); }
  .meta { padding: 14px 16px; border-bottom: 1px solid #e6e1d6; }
  .label { margin: 0; font-weight: 600; font-size: 15px; }
  .subject { margin: 3px 0 6px; font-size: 13px; color: #8a6a47; }
  code { font-size: 11px; color: #8a857c; }
  .frame { height: 460px; overflow: hidden; background: #f3f1ea; }
  iframe { width: 100%; height: 100%; border: 0; pointer-events: none; }
</style></head>
<body>
  <header>
    <h1>Email templates</h1>
    <p class="sub">${ENTRIES.length} transactional templates · sample data · dev-only preview. Click a card to open full-size.</p>
  </header>
  <div class="grid">${cards}</div>
</body></html>`;
}

export async function GET(req: NextRequest) {
  // Never expose in production.
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const slug = req.nextUrl.searchParams.get("template");

  if (!slug) {
    return new NextResponse(galleryHtml(req), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const entry = ENTRIES.find((e) => e.slug === slug);
  if (!entry) {
    return new NextResponse(`Unknown template "${slug}"`, { status: 404 });
  }

  const html = await render(
    createElement(entry.Component, entry.Component.PreviewProps)
  );
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
