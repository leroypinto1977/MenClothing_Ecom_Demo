import * as React from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { EmailOrder, EmailOrderLine } from "@/lib/email-types";

// ---- brand tokens ----------------------------------------------------------
export const C = {
  bg: "#f3f1ea",
  card: "#ffffff",
  ink: "#1c1a17",
  body: "#3a3a3c",
  muted: "#8a857c",
  border: "#e6e1d6",
  brand: "#8a6a47",
  brandSoft: "#f0e9df",
};

const serif = 'Georgia, "Times New Roman", serif';
const sans =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export function formatINR(value: number): string {
  return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

// ---- layout shell ----------------------------------------------------------
export function EmailLayout({
  preview,
  children,
  supportEmail = "support@meridian.in",
  reason,
}: {
  preview: string;
  children: React.ReactNode;
  supportEmail?: string;
  reason?: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: C.bg, fontFamily: sans, color: C.ink }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "32px 0" }}>
          {/* Header */}
          <Section style={{ padding: "0 8px 20px" }}>
            <Text
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.3em",
                color: C.ink,
              }}
            >
              MERIDIAN
            </Text>
          </Section>

          {/* Card */}
          <Section
            style={{
              backgroundColor: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 4,
              padding: "32px",
            }}
          >
            {children}
          </Section>

          {/* Footer */}
          <Section style={{ padding: "20px 8px 0" }}>
            <Text style={{ margin: "0 0 4px", fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
              Need help? Reply to this email or write to{" "}
              <Link href={`mailto:${supportEmail}`} style={{ color: C.brand }}>
                {supportEmail}
              </Link>
              .
            </Text>
            <Text style={{ margin: 0, fontSize: 11, color: C.muted }}>
              {reason ?? "You're receiving this because you placed an order with MERIDIAN."}
              <br />
              MERIDIAN · Considered menswear, made to last.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ---- primitives ------------------------------------------------------------
export function H1({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        margin: "0 0 6px",
        fontFamily: serif,
        fontSize: 26,
        lineHeight: 1.2,
        fontWeight: 600,
        color: C.ink,
      }}
    >
      {children}
    </Text>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        margin: "0 0 14px",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: C.brand,
      }}
    >
      {children}
    </Text>
  );
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.65, color: C.body }}>
      {children}
    </Text>
  );
}

export function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button
      href={href}
      style={{
        display: "inline-block",
        backgroundColor: C.ink,
        color: C.card,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.04em",
        padding: "13px 26px",
        borderRadius: 2,
        textDecoration: "none",
      }}
    >
      {children}
    </Button>
  );
}

export function Divider() {
  return <Hr style={{ borderColor: C.border, margin: "24px 0" }} />;
}

// ---- order building blocks -------------------------------------------------
export function OrderBadge({ number }: { number: string }) {
  return (
    <Text
      style={{
        display: "inline-block",
        margin: "0 0 4px",
        fontSize: 13,
        color: C.muted,
      }}
    >
      Order <span style={{ color: C.ink, fontWeight: 600 }}>{number}</span>
    </Text>
  );
}

export function ItemRow({ item }: { item: EmailOrderLine }) {
  return (
    <Row style={{ marginBottom: 4 }}>
      <Column style={{ width: 56, verticalAlign: "top" }}>
        <Img
          src={item.image}
          width={48}
          height={60}
          alt={item.name}
          style={{ borderRadius: 2, objectFit: "cover", border: `1px solid ${C.border}` }}
        />
      </Column>
      <Column style={{ verticalAlign: "top", paddingLeft: 4 }}>
        <Text style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.ink }}>
          {item.name}
        </Text>
        <Text style={{ margin: "2px 0 0", fontSize: 12, color: C.muted }}>
          {item.color} · {item.size} · Qty {item.quantity}
        </Text>
      </Column>
      <Column style={{ verticalAlign: "top", textAlign: "right", whiteSpace: "nowrap" }}>
        <Text style={{ margin: 0, fontSize: 14, color: C.ink }}>
          {formatINR(item.unitPrice * item.quantity)}
        </Text>
      </Column>
    </Row>
  );
}

function TotalLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Row>
      <Column>
        <Text
          style={{
            margin: "3px 0",
            fontSize: strong ? 15 : 13,
            color: strong ? C.ink : C.muted,
            fontWeight: strong ? 600 : 400,
          }}
        >
          {label}
        </Text>
      </Column>
      <Column style={{ textAlign: "right" }}>
        <Text
          style={{
            margin: "3px 0",
            fontSize: strong ? 15 : 13,
            color: C.ink,
            fontWeight: strong ? 600 : 400,
          }}
        >
          {value}
        </Text>
      </Column>
    </Row>
  );
}

export function OrderSummary({ order }: { order: EmailOrder }) {
  return (
    <>
      <Section style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 8 }}>
        {order.items.map((item, i) => (
          <ItemRow key={i} item={item} />
        ))}
      </Section>
      <Section style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 12 }}>
        <TotalLine label="Subtotal" value={formatINR(order.subtotal)} />
        <TotalLine
          label="Shipping"
          value={order.shipping === 0 ? "Complimentary" : formatINR(order.shipping)}
        />
        <TotalLine label="GST" value={formatINR(order.tax)} />
        <TotalLine label="Total" value={formatINR(order.total)} strong />
      </Section>
    </>
  );
}

export function AddressBlock({ order }: { order: EmailOrder }) {
  const a = order.shippingAddress;
  if (!a) return null;
  return (
    <Section style={{ marginTop: 20 }}>
      <Text style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, color: C.ink }}>
        Shipping to
      </Text>
      <Text style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
        {a.name}
        <br />
        {a.line1}
        {a.line2 ? (
          <>
            <br />
            {a.line2}
          </>
        ) : null}
        <br />
        {a.city}
        {a.region ? `, ${a.region}` : ""} {a.postal}
        <br />
        {a.country}
      </Text>
    </Section>
  );
}
