'use strict';

const nodemailer = require('nodemailer');

function createTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendInviteEmail({ toEmail, inviterName, familyName, memberName, inviteUrl }) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #f8f9fa;">
      <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #0066ff, #00d4ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">WealthOS</div>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px;">You're invited to join <em>${familyName}</em></h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
          <strong>${inviterName}</strong> has added you as <strong>${memberName}</strong> to their family's WealthOS account.
          Create your account to view and manage the family's financial plan together.
        </p>
        <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #0066ff, #00d4ff); color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin-bottom: 20px;">
          Accept Invitation
        </a>
        <p style="color: #999; font-size: 13px; margin: 0;">This invite link expires in 7 days. If you didn't expect this email, you can safely ignore it.</p>
      </div>
    </div>`;

  const transport = createTransport();
  if (!transport) {
    console.log('\n--- INVITE EMAIL (no SMTP configured) ---');
    console.log(`To:      ${toEmail}`);
    console.log(`Member:  ${memberName} in ${familyName}`);
    console.log(`Link:    ${inviteUrl}`);
    console.log('-----------------------------------------\n');
    return;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || `"WealthOS" <noreply@wealthos.app>`,
    to: toEmail,
    subject: `${inviterName} invited you to ${familyName} on WealthOS`,
    html
  });
}

module.exports = { sendInviteEmail };
