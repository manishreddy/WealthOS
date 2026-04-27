'use strict';

const nodemailer = require('nodemailer');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

async function sendWelcomeEmail({ toEmail, displayName, baseUrl }) {
  if (!toEmail || toEmail.endsWith('@replit.user')) {
    console.log(`[welcome-email] Skipping — no real email address for user (${toEmail || 'none'})`);
    return;
  }

  const familySetupUrl = `${baseUrl}/family-setup.html`;
  const onboardingUrl = `${baseUrl}/onboarding.html`;
  const dashboardUrl = `${baseUrl}/dashboard.html`;

  const safeName = escapeHtml(displayName);
  const greeting = safeName ? `Hi ${safeName},` : 'Welcome to WealthOS,';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #f8f9fa;">
      <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #0066ff, #00d4ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">WealthOS</div>
        </div>
        <h2 style="font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px;">You're in — here's what to do next</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">${greeting}<br>Your WealthOS account is ready. Follow these three steps to get your family's financial plan set up.</p>

        <div style="border: 1px solid #e8eaf0; border-radius: 10px; overflow: hidden; margin-bottom: 28px;">
          <a href="${familySetupUrl}" style="display: flex; align-items: center; gap: 16px; padding: 18px 20px; text-decoration: none; color: inherit; border-bottom: 1px solid #e8eaf0;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #0066ff, #00d4ff); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="color: white; font-weight: 700; font-size: 15px;">1</span>
            </div>
            <div>
              <div style="font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 2px;">Set up your family</div>
              <div style="font-size: 13px; color: #6b7280;">Add family members so everyone's finances are in one place.</div>
            </div>
            <div style="margin-left: auto; color: #0066ff; font-size: 18px;">→</div>
          </a>
          <a href="${onboardingUrl}" style="display: flex; align-items: center; gap: 16px; padding: 18px 20px; text-decoration: none; color: inherit; border-bottom: 1px solid #e8eaf0;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #0066ff, #00d4ff); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="color: white; font-weight: 700; font-size: 15px;">2</span>
            </div>
            <div>
              <div style="font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 2px;">Set your risk profile &amp; goals</div>
              <div style="font-size: 13px; color: #6b7280;">Tell us your risk tolerance and what you're saving towards.</div>
            </div>
            <div style="margin-left: auto; color: #0066ff; font-size: 18px;">→</div>
          </a>
          <a href="${dashboardUrl}" style="display: flex; align-items: center; gap: 16px; padding: 18px 20px; text-decoration: none; color: inherit;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #0066ff, #00d4ff); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="color: white; font-weight: 700; font-size: 15px;">3</span>
            </div>
            <div>
              <div style="font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 2px;">Explore your dashboard</div>
              <div style="font-size: 13px; color: #6b7280;">See your net worth, portfolio, and financial snapshot at a glance.</div>
            </div>
            <div style="margin-left: auto; color: #0066ff; font-size: 18px;">→</div>
          </a>
        </div>

        <a href="${familySetupUrl}" style="display: block; text-align: center; background: linear-gradient(135deg, #0066ff, #00d4ff); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin-bottom: 20px;">
          Get started →
        </a>
        <p style="color: #999; font-size: 13px; margin: 0; text-align: center;">Questions? Just reply to this email — we're here to help.</p>
      </div>
    </div>`;

  const transport = createTransport();
  if (!transport) {
    console.log('\n--- WELCOME EMAIL (no SMTP configured) ---');
    console.log(`To:           ${toEmail}`);
    console.log(`Name:         ${displayName || '(unknown)'}`);
    console.log(`Family Setup: ${familySetupUrl}`);
    console.log(`Onboarding:   ${onboardingUrl}`);
    console.log(`Dashboard:    ${dashboardUrl}`);
    console.log('------------------------------------------\n');
    return;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || `"WealthOS" <noreply@wealthos.app>`,
    to: toEmail,
    subject: `You're in — here's what to do next on WealthOS`,
    html
  });
}

module.exports = { sendInviteEmail, sendWelcomeEmail };
