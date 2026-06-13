import * as React from "react";
import {
  EmailLayout,
  Eyebrow,
  H1,
  Paragraph,
  PrimaryButton,
  Divider,
} from "./_components";
import { siteUrl } from "@/lib/email-types";

export const subject = () => "Welcome to MERIDIAN";

export default function WelcomeEmail({ name }: { name?: string }) {
  const first = name?.split(" ")[0];
  return (
    <EmailLayout
      preview="Welcome to MERIDIAN — considered menswear, made to last"
      reason="You're receiving this because you created a MERIDIAN account."
    >
      <Eyebrow>Welcome</Eyebrow>
      <H1>{first ? `Welcome, ${first}.` : "Welcome to MERIDIAN."}</H1>
      <Paragraph>
        Thank you for joining us. MERIDIAN is built on a simple idea — fewer,
        better things, made from natural fibres and designed to be worn for years.
      </Paragraph>
      <Paragraph>
        Your account keeps your orders, addresses, and wishlist in one place, and
        makes checkout a breeze next time.
      </Paragraph>
      <PrimaryButton href={`${siteUrl()}/shop`}>Explore the collection</PrimaryButton>
      <Divider />
      <Paragraph>Complimentary shipping on orders over ₹12,000 · Free 30-day returns.</Paragraph>
    </EmailLayout>
  );
}

WelcomeEmail.PreviewProps = { name: "James Whitfield" } satisfies { name?: string };
