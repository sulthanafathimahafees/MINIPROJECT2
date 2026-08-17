import nodemailer from 'nodemailer';

/**
 * Send Password Reset Email via SMTP or Ethereal Test Account with console log fallback
 * @param {string} toEmail - Recipient email address
 * @param {string} resetLink - Full reset URL containing reset token
 */
export const sendPasswordResetEmail = async (toEmail, resetLink) => {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || '"OptiBuy Support" <noreply@optibuy.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b1120; color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; padding: 32px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; }
        .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #334155; }
        .logo { font-size: 28px; font-weight: 900; color: #2563eb; letter-spacing: -0.5px; }
        .logo span { color: #06b6d4; }
        .content { padding: 24px 0; }
        .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
        .text { font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
        .btn-container { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(37,99,235,0.4); }
        .footer { border-top: 1px solid #334155; padding-top: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .token-box { background-color: #0f172a; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #38bdf8; word-break: break-all; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Opti<span>Buy</span></div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 4px; font-weight: 600;">Consumer Electronics Decision Support Platform</div>
        </div>
        <div class="content">
          <div class="title">Password Reset Request</div>
          <div class="text">
            We received a request to reset your password for your OptiBuy account (<strong>${toEmail}</strong>).
            Click the button below to reset your password. This link is valid for <strong>30 minutes</strong> and can only be used once.
          </div>
          <div class="btn-container">
            <a href="${resetLink}" class="btn" target="_blank">Reset Password</a>
          </div>
          <div class="text" style="font-size: 13px;">
            If the button doesn't work, copy and paste the following URL into your browser:
          </div>
          <div class="token-box">${resetLink}</div>
        </div>
        <div class="footer">
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p>&copy; 2026 OptiBuy Inc. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Log details to server console for development visibility
  console.log(`\n==================================================`);
  console.log(`📧 [Password Reset Email Triggered]`);
  console.log(`📩 Recipient: ${toEmail}`);
  console.log(`🔗 Reset Link: ${resetLink}`);
  console.log(`==================================================\n`);

  if (smtpUser && smtpUser.trim() && smtpPass && smtpPass.trim()) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser.trim(),
          pass: smtpPass.trim()
        }
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to: toEmail,
        subject: 'Reset your OptiBuy password',
        html: htmlContent
      });

      console.log(`✅ [Gmail SMTP Success] Email sent to ${toEmail}. Message ID: ${info.messageId}`);
    } catch (smtpError) {
      console.error(`❌ [Gmail SMTP Error] ${smtpError.message}`);
      console.log(`💡 Note: Gmail requires an 'App Password' (not your normal Gmail password).`);
    }
  } else {
    // Generate free Ethereal test mailbox URL for instant email preview
    try {
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      const info = await testTransporter.sendMail({
        from: smtpFrom,
        to: toEmail,
        subject: 'Reset your OptiBuy password',
        html: htmlContent
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`📬 [Ethereal Email Test Service] Real email preview created!`);
      console.log(`🔗 View rendered email in inbox preview: ${previewUrl}\n`);
    } catch (etherealErr) {
      console.log(`[Dev Notice] Set SMTP_USER and SMTP_PASSWORD in backend/.env to send real Gmail emails.`);
    }
  }
};
