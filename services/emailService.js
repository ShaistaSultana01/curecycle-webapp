import nodemailer from "nodemailer";

// Gmail SMTP via App Password (free, 500 emails/day)
// Required env vars:
//   EMAIL_USER  → your Gmail address (e.g. curecycle.alerts@gmail.com)
//   EMAIL_PASS  → 16-char Gmail App Password (NOT your normal password)
//   EMAIL_FROM  → optional display name (defaults to EMAIL_USER)

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(
      "⚠️  EMAIL_USER / EMAIL_PASS not set — emails will be skipped."
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
};

/**
 * Send a notification email. Silently no-ops if email is not configured
 * so the rest of the app keeps working in dev / on hosts without SMTP.
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const t = getTransporter();
  if (!t || !to) return { skipped: true };

  try {
    const info = await t.sendMail({
      from: `"CureCycle" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("📧 Email send failed:", err.message);
    return { success: false, error: err.message };
  }
};

// Reusable HTML wrapper so all emails look consistent
export const wrapEmail = (title, body) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f7f9fc;">
    <div style="background:#fff;border-radius:8px;padding:28px;border:1px solid #e3e8ef;">
      <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;">${title}</h2>
      <div style="color:#334155;font-size:14px;line-height:1.6;">${body}</div>
      <hr style="border:none;border-top:1px solid #e3e8ef;margin:24px 0 16px;" />
      <p style="font-size:12px;color:#64748b;margin:0;">
        You're receiving this because you signed up for CureCycle.
      </p>
    </div>
  </div>
`;
