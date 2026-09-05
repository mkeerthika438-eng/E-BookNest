const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

const isConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);

let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
} else {
  console.log('ℹ️  Email reminders are OFF — no SMTP_* values set in .env. In-app notifications still work normally.');
}

// Sends an email if SMTP is configured; silently skips (with a console note) otherwise.
// This means the rest of the app (borrowing, renewal, etc.) never breaks even if
// email hasn't been set up.
async function sendMail({ to, subject, html }) {
  if (!isConfigured) {
    console.log(`ℹ️  (Email skipped — SMTP not configured) Would have sent "${subject}" to ${to}`);
    return { skipped: true };
  }
  try {
    await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
    return { skipped: false, sent: true };
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    return { skipped: false, sent: false, error: err.message };
  }
}

module.exports = { sendMail, isEmailConfigured: isConfigured };
