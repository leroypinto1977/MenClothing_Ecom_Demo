import "server-only";
import * as React from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";

const API_KEY = process.env.RESEND_API_KEY;
// Resend's sandbox sender works without domain verification — fine for the demo.
const FROM = process.env.RESEND_FROM ?? "MERIDIAN <onboarding@resend.dev>";
const REPLY_TO = process.env.RESEND_REPLY_TO ?? "support@meridian.in";

const resend = API_KEY ? new Resend(API_KEY) : null;

export function emailEnabled() {
  return resend !== null;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  /** A React Email element; rendered to HTML + a plain-text alternative. */
  template: React.ReactElement;
}

/**
 * Render and send a transactional email. When RESEND_API_KEY is absent
 * (demo/dev), this logs and resolves so order flows never break on missing
 * credentials. Returns true if the message was actually dispatched.
 */
export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const [html, text] = await Promise.all([
    render(input.template),
    render(input.template, { plainText: true }),
  ]);

  if (!resend) {
    console.info(
      `[email] skipped (no RESEND_API_KEY): "${input.subject}" → ${
        Array.isArray(input.to) ? input.to.join(", ") : input.to
      }`
    );
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: input.to,
      replyTo: REPLY_TO,
      subject: input.subject,
      html,
      text,
    });
    if (error) {
      console.error("[email] send failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send threw:", err);
    return false;
  }
}
