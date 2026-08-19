// backend/utils/mailer.js
// Nodemailer wrapper for the official ClothCore Gmail account. Credentials
// come only from backend/.env (EMAIL_USER / EMAIL_PASS — a Google App
// Password, never the real account password) and are never logged.
//
// If email isn't configured, the app must keep working — every other
// feature is unrelated to it. We just flip `isEmailConfigured` to false and
// let callers (the password-reset routes) return a safe 503 instead of
// crashing the whole backend at startup.
const nodemailer = require("nodemailer");

const BRAND = {
  plum: "#190019",
  plum700: "#522B5B",
  mauve: "#854F6C",
  coral: "#E08E7D",
  cream: "#FBE4D8",
};

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const fromName = process.env.EMAIL_FROM_NAME || "ClothCore";

const isEmailConfigured = Boolean(emailUser && emailPass);

let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: emailUser, pass: emailPass },
  });
} else {
  console.warn(
    "[mailer] EMAIL_USER / EMAIL_PASS are not set in backend/.env — " +
      "password-reset emails will not be sent until they're configured with a Gmail App Password."
  );
}

function otpEmailHtml({ firstName, otp, expiresInMinutes }) {
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";
  return `
  <div style="background:${BRAND.cream};padding:32px 16px;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#FFFDFB;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(25,0,25,0.12);">
      <div style="background:linear-gradient(135deg, ${BRAND.plum}, ${BRAND.plum700});padding:28px 32px;">
        <div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.02em;">ClothCore</div>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 12px;font-size:20px;color:${BRAND.plum};">Reset Your ClothCore Password</h1>
        <p style="margin:0 0 6px;color:${BRAND.mauve};font-size:14px;">${greeting}</p>
        <p style="margin:0 0 20px;color:${BRAND.mauve};font-size:14px;line-height:1.6;">
          We received a request to reset the password for your ClothCore account.
          Use the verification code below to continue.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <span style="display:inline-block;padding:16px 32px;border-radius:14px;background:${BRAND.cream};border:1.5px solid ${BRAND.coral};font-size:32px;font-weight:700;letter-spacing:0.35em;color:${BRAND.plum};">
            ${otp}
          </span>
        </div>
        <p style="margin:0 0 6px;color:${BRAND.mauve};font-size:13px;">
          This code expires in <strong>${expiresInMinutes} minutes</strong>.
        </p>
        <p style="margin:0 0 20px;color:${BRAND.mauve};font-size:13px;">
          If you did not request a password reset, you can safely ignore this email —
          your password will not be changed.
        </p>
        <hr style="border:none;border-top:1px solid rgba(82,43,91,0.15);margin:24px 0;" />
        <p style="margin:0;color:#a58a95;font-size:12px;">
          Need help? Contact your ClothCore administrator. Never share this code with anyone.
        </p>
      </div>
    </div>
  </div>`;
}

function otpEmailText({ firstName, otp, expiresInMinutes }) {
  const greeting = firstName ? `Hi ${firstName},` : "Hi,";
  return [
    greeting,
    "",
    "We received a request to reset the password for your ClothCore account.",
    "",
    `Your verification code is: ${otp}`,
    "",
    `This code expires in ${expiresInMinutes} minutes.`,
    "",
    "If you did not request a password reset, you can safely ignore this email.",
  ].join("\n");
}

async function sendPasswordResetOtpEmail({ to, firstName, otp, expiresInMinutes }) {
  if (!transporter) {
    throw new Error("Email service is not configured");
  }

  await transporter.sendMail({
    from: `"${fromName}" <${emailUser}>`,
    to,
    subject: "ClothCore Password Reset Code",
    text: otpEmailText({ firstName, otp, expiresInMinutes }),
    html: otpEmailHtml({ firstName, otp, expiresInMinutes }),
  });
}

// Best-effort confirmation email — callers should not let a failure here
// affect the (already-completed) password reset response.
async function sendPasswordChangedEmail({ to, firstName }) {
  if (!transporter) return;

  const greeting = firstName ? `Hi ${firstName},` : "Hi,";

  await transporter.sendMail({
    from: `"${fromName}" <${emailUser}>`,
    to,
    subject: "Your ClothCore Password Was Changed",
    text: `${greeting}\n\nYour ClothCore account password was just changed. If this wasn't you, contact an administrator immediately.`,
    html: `
    <div style="background:${BRAND.cream};padding:32px 16px;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#FFFDFB;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(25,0,25,0.12);">
        <div style="background:linear-gradient(135deg, ${BRAND.plum}, ${BRAND.plum700});padding:28px 32px;">
          <div style="color:#ffffff;font-size:20px;font-weight:700;">ClothCore</div>
        </div>
        <div style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:20px;color:${BRAND.plum};">Password Changed</h1>
          <p style="margin:0;color:${BRAND.mauve};font-size:14px;line-height:1.6;">
            ${greeting}<br/><br/>
            Your ClothCore account password was just changed. If this was you, no action is needed.
            If you did not make this change, please contact an administrator immediately.
          </p>
        </div>
      </div>
    </div>`,
  });
}

// Renders one optional detail row (Phone / Shop / Subject) — skipped
// entirely when the visitor didn't provide it, rather than showing an
// empty "Phone: " line.
function optionalRow(label, value) {
  if (!value) return "";
  return `
        <tr>
          <td style="padding:6px 0;color:${BRAND.mauve};font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;width:120px;vertical-align:top;">${label}</td>
          <td style="padding:6px 0;color:${BRAND.plum};font-size:14px;">${value}</td>
        </tr>`;
}

function contactInquiryEmailHtml({ name, email, phone, shopName, subject, message, submittedAt }) {
  return `
  <div style="background:${BRAND.cream};padding:32px 16px;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#FFFDFB;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(25,0,25,0.12);">
      <div style="background:linear-gradient(135deg, ${BRAND.plum}, ${BRAND.plum700});padding:28px 32px;">
        <div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.02em;">ClothCore</div>
        <div style="color:${BRAND.cream};font-size:13px;margin-top:4px;">New Website Inquiry</div>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 16px;font-size:19px;color:${BRAND.plum};">New inquiry received through ClothCore</h1>

        <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          ${optionalRow("Name", name)}
          ${optionalRow("Email", email)}
          ${optionalRow("Phone", phone)}
          ${optionalRow("Shop / Company", shopName)}
          ${optionalRow("Subject", subject)}
        </table>

        <div style="margin:0 0 20px;">
          <div style="color:${BRAND.mauve};font-size:12.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px;">Message</div>
          <div style="background:${BRAND.cream};border:1px solid rgba(224,142,125,0.35);border-radius:14px;padding:16px 18px;color:${BRAND.plum};font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</div>
        </div>

        <hr style="border:none;border-top:1px solid rgba(82,43,91,0.15);margin:20px 0;" />
        <p style="margin:0;color:#a58a95;font-size:12px;">Submitted ${submittedAt} · Reply directly to this email to respond to ${name}.</p>
      </div>
    </div>
  </div>`;
}

function contactInquiryEmailText({ name, email, phone, shopName, subject, message, submittedAt }) {
  return [
    "New inquiry received through ClothCore.",
    "",
    "Name:",
    name,
    "",
    "Email:",
    email,
    ...(phone ? ["", "Phone:", phone] : []),
    ...(shopName ? ["", "Shop/Company:", shopName] : []),
    ...(subject ? ["", "Subject:", subject] : []),
    "",
    "Message:",
    message,
    "",
    "Submitted:",
    submittedAt,
  ].join("\n");
}

// Sends a visitor's "Get In Touch" submission to the official ClothCore
// inbox (the same EMAIL_USER account, reused from the exact transporter
// above — no second/duplicate email configuration). replyTo is set to the
// visitor's own address so ClothCore staff can just hit "Reply" in Gmail
// to respond to them directly.
async function sendContactInquiryEmail({ name, email, phone, shopName, subject, message }) {
  if (!transporter) {
    throw new Error("Email service is not configured");
  }

  const submittedAt = new Date().toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  await transporter.sendMail({
    from: `"${fromName}" <${emailUser}>`,
    to: emailUser,
    replyTo: email,
    subject: `ClothCore Website Inquiry — ${name}`,
    text: contactInquiryEmailText({ name, email, phone, shopName, subject, message, submittedAt }),
    html: contactInquiryEmailHtml({ name, email, phone, shopName, subject, message, submittedAt }),
  });
}

module.exports = {
  isEmailConfigured,
  sendPasswordResetOtpEmail,
  sendPasswordChangedEmail,
  sendContactInquiryEmail,
};
