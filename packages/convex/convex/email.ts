/**
 * email.ts
 *
 * Transactional email via Resend's HTTP API (no SDK dependency — just fetch).
 *
 * Gated on `RESEND_API_KEY`: when it's unset the action no-ops gracefully so
 * local dev works without an email provider (the invite still exists in-app
 * and shows up in the invitee's banner once they sign in).
 *
 * NO DNS REQUIRED to get started: leave `RESEND_FROM` unset and Resend's
 * shared `onboarding@resend.dev` sender is used. In that mode Resend only
 * delivers to the address that owns the Resend account — perfect for testing
 * invites to your own inbox. To email arbitrary teammates, verify a domain in
 * Resend (adds SPF/DKIM DNS records) and set `RESEND_FROM` to an address on it.
 */

import { internalAction } from './_generated/server';
import { v } from 'convex/values';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'One UI Studio <onboarding@resend.dev>';

const ROLE_LABELS: Record<string, string> = {
  viewer: 'Viewer',
  editor: 'Editor',
  admin: 'Admin',
};

export const sendInviteEmail = internalAction({
  args: {
    to: v.string(),
    brandName: v.string(),
    role: v.string(),
    inviterName: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        `[email] RESEND_API_KEY not set — skipping invite email to ${args.to} ` +
          `(the invite is still pending in-app).`,
      );
      return { sent: false, reason: 'no-api-key' as const };
    }

    const from = process.env.RESEND_FROM ?? DEFAULT_FROM;
    const siteUrl = process.env.SITE_URL ?? '';
    const roleLabel = ROLE_LABELS[args.role] ?? args.role;
    const inviter = args.inviterName?.trim();
    const invitedBy = inviter ? `${inviter} invited you` : 'You have been invited';
    const subject = `${invitedBy} to ${args.brandName} on One UI Studio`;

    const cta = siteUrl
      ? `Sign in at ${siteUrl} with this email address (${args.to}) to accept.`
      : `Sign in to One UI Studio with this email address (${args.to}) to accept.`;

    const text = `${invitedBy} to work on ${args.brandName} as ${roleLabel}.\n\n${cta}`;
    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">${invitedBy} to ${args.brandName}</h2>
        <p style="margin: 0 0 8px;">You've been added as <strong>${roleLabel}</strong> on One UI Studio.</p>
        <p style="margin: 0 0 16px;">${cta}</p>
        ${
          siteUrl
            ? `<p style="margin: 0;"><a href="${siteUrl}" style="display:inline-block;padding:10px 16px;background:#1a1a1a;color:#fff;border-radius:8px;text-decoration:none;">Open One UI Studio</a></p>`
            : ''
        }
      </div>
    `;

    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to: [args.to], subject, html, text }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[email] Resend send failed (${res.status}): ${body}`);
      return { sent: false, reason: `resend-${res.status}` as const };
    }

    return { sent: true as const };
  },
});
