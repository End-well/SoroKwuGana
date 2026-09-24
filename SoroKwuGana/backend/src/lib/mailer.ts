/**
 * Nodemailer setup — Gmail SMTP.
 * Add to backend/.env:
 *   SMTP_USER=your_gmail@gmail.com
 *   SMTP_PASS=your_16_char_app_password   ← from myaccount.google.com/apppasswords
 *   SITE_URL=http://localhost:5173
 */
import nodemailer from 'nodemailer';

export const FROM_NAME    = process.env.EMAIL_FROM_NAME ?? 'SoroKwuGana';
export const FROM_ADDRESS = process.env.SMTP_USER       ?? '';
export const SITE_URL     = process.env.SITE_URL        ?? 'http://localhost:5173';

/** Returns true when SMTP credentials are present in env. */
export function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim());
}

export function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: {
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
    },
  });
}

/** Send one email. Throws with a clear message on failure. */
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP not configured. Add SMTP_USER and SMTP_PASS to backend/.env');
  }

  const transport = createTransport();
  await transport.sendMail({
    from:    `"${FROM_NAME}" <${FROM_ADDRESS}>`,
    to:      opts.to,
    subject: opts.subject,
    html:    opts.html,
    text:    opts.text ?? opts.html.replace(/<[^>]+>/g, ''),
  });
}

/** Verify SMTP connection — used by the test endpoint. */
export async function verifySmtp(): Promise<void> {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP_USER and SMTP_PASS are not set in backend/.env');
  }
  const transport = createTransport();
  await transport.verify();
}

/** Build the newsletter HTML email for a post */
export function buildPostEmail(opts: {
  postTitle: string;
  postExcerpt: string;
  postSlug: string;
  postCoverImage?: string;
  unsubscribeToken: string;
}): string {
  const postUrl        = `${SITE_URL}/article/${opts.postSlug}`;
  const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe/${opts.unsubscribeToken}`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${opts.postTitle}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
  <tr><td style="background:linear-gradient(135deg,#6C63FF,#FF4D6D);padding:28px 32px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:900;">SoroKwuGana</h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,.75);font-size:13px;">Entertainment · Lifestyle · Culture</p>
  </td></tr>
  ${opts.postCoverImage ? `<tr><td><img src="${opts.postCoverImage}" alt="" style="width:100%;height:260px;object-fit:cover;display:block;"/></td></tr>` : ''}
  <tr><td style="padding:36px 36px 28px;">
    <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#6C63FF;text-transform:uppercase;letter-spacing:1px;">New Story</p>
    <h2 style="margin:0 0 16px;font-size:26px;font-weight:900;color:#111827;line-height:1.3;">${opts.postTitle}</h2>
    <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.7;">${opts.postExcerpt}</p>
    <a href="${postUrl}" style="display:inline-block;background:linear-gradient(135deg,#6C63FF,#FF4D6D);color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:50px;text-decoration:none;">
      Read the Full Story →
    </a>
  </td></tr>
  <tr><td style="padding:20px 36px 32px;border-top:1px solid #f3f4f6;">
    <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
      You're receiving this because you subscribed to SoroKwuGana.<br/>
      <a href="${unsubscribeUrl}" style="color:#6C63FF;">Unsubscribe</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/** Welcome email after subscribing */
export function buildWelcomeEmail(opts: { unsubscribeToken: string }): string {
  const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe/${opts.unsubscribeToken}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
  <tr><td style="background:linear-gradient(135deg,#6C63FF,#FF4D6D);padding:28px 32px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:900;">SoroKwuGana</h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,.75);font-size:13px;">Entertainment · Lifestyle · Culture</p>
  </td></tr>
  <tr><td style="padding:40px 36px;">
    <h2 style="margin:0 0 16px;font-size:24px;font-weight:900;color:#111827;">You're in the loop! 🎉</h2>
    <p style="margin:0 0 16px;font-size:15px;color:#6b7280;line-height:1.7;">
      Welcome to SoroKwuGana. You'll get the hottest stories in African entertainment, lifestyle and culture delivered straight to your inbox.
    </p>
    <a href="${SITE_URL}" style="display:inline-block;background:linear-gradient(135deg,#6C63FF,#FF4D6D);color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:50px;text-decoration:none;">
      Start Reading →
    </a>
  </td></tr>
  <tr><td style="padding:20px 36px 32px;border-top:1px solid #f3f4f6;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      Changed your mind? <a href="${unsubscribeUrl}" style="color:#6C63FF;">Unsubscribe</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}
