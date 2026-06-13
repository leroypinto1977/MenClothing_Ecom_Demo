import * as React from "react";
import { Text } from "@react-email/components";
import {
  EmailLayout,
  Eyebrow,
  H1,
  Paragraph,
  PrimaryButton,
  Divider,
  C,
} from "./_components";

export const subject = () => "Reset your MERIDIAN password";

export default function PasswordResetEmail({
  url,
  name,
}: {
  url: string;
  name?: string;
}) {
  const first = name?.split(" ")[0];
  return (
    <EmailLayout
      preview="Reset your MERIDIAN password"
      reason="You're receiving this because a password reset was requested for your MERIDIAN account."
    >
      <Eyebrow>Password reset</Eyebrow>
      <H1>{first ? `Hi ${first},` : "Reset your password"}</H1>
      <Paragraph>
        We received a request to reset your password. Click below to choose a new
        one. This link expires in 1 hour.
      </Paragraph>
      <PrimaryButton href={url}>Reset password</PrimaryButton>
      <Divider />
      <Text style={{ margin: "0 0 8px", fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
        If the button doesn&apos;t work, paste this link into your browser:
      </Text>
      <Text style={{ margin: 0, fontSize: 12, color: C.brand, wordBreak: "break-all" }}>
        {url}
      </Text>
      <Divider />
      <Paragraph>
        Didn&apos;t request this? You can safely ignore this email — your password
        won&apos;t change.
      </Paragraph>
    </EmailLayout>
  );
}

PasswordResetEmail.PreviewProps = {
  url: "https://meridian.in/reset-password?token=demo-token",
  name: "James Whitfield",
} satisfies { url: string; name?: string };
