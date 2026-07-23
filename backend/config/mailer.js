import nodemailer from 'nodemailer';

// Create transporter from env variables
const createTransporter = () => {
  const host     = process.env.MAIL_HOST     || 'smtp.gmail.com';
  const port     = Number(process.env.MAIL_PORT) || 465;
  const user     = process.env.MAIL_USER;
  const pass     = process.env.MAIL_PASS;
  const fromName = process.env.MAIL_FROM_NAME || 'Andaaz Watches';
  const fromEmail= process.env.MAIL_FROM_EMAIL || user;

  if (!user || !pass) {
    console.warn('[Mail] MAIL_USER or MAIL_PASS not set — emails disabled');
    return null;
  }

return {
  transporter: nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
  }),
  from: `"${fromName}" <${fromEmail}>`,
};
  }; 

// ── Order confirmation email ───────────────────────────────────────
export const sendOrderConfirmationEmail = async ({ to, customerName, orderId, items, itemsTotal, shippingCost, totalAmount, paymentMethod, shippingAddress }) => {
  const mail = createTransporter();
  if (!mail) return;

  const orderRef = orderId.slice(-8).toUpperCase();
  const isFreeShipping = shippingCost === 0;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #f3f4f6;">
        <div style="display:flex;align-items:center;gap:12px;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;" />` : ''}
          <div>
            <p style="margin:0;font-weight:700;font-size:14px;">${item.name}</p>
            <p style="margin:0;color:#6b7280;font-size:12px;">Qty: ${item.qty}</p>
          </div>
        </div>
      </td>
      <td style="padding:10px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700;font-size:14px;">
        PKR ${Number(item.price * item.qty).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:white;">

    <!-- Header -->
    <div style="background:#000;padding:32px;text-align:center;">
      <h1 style="margin:0;color:white;font-size:28px;font-family:Georgia,serif;letter-spacing:-0.5px;">Andaaz</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:3px;text-transform:uppercase;">Luxury Timepieces</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:28px;text-align:center;">
        <p style="margin:0;font-size:24px;">✓</p>
        <h2 style="margin:8px 0 4px;color:#166534;font-size:20px;">Order Confirmed!</h2>
        <p style="margin:0;color:#166534;font-size:14px;">Order #${orderRef}</p>
      </div>

      <p style="font-size:15px;color:#374151;">Hi <strong>${customerName}</strong>,</p>
      <p style="font-size:14px;color:#6b7280;line-height:1.6;">Thank you for your order! We've received your order and will process it shortly. You'll hear from us once it's on its way.</p>

      <!-- Items -->
      <h3 style="font-size:14px;font-weight:700;color:#111;text-transform:uppercase;letter-spacing:1px;margin:24px 0 12px;">Your Order</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${itemsHtml}
      </table>

      <!-- Totals -->
      <div style="margin-top:16px;padding-top:16px;border-top:2px solid #111;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#6b7280;font-size:13px;">Subtotal</span>
          <span style="font-size:13px;">PKR ${Number(itemsTotal).toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
          <span style="color:#6b7280;font-size:13px;">Shipping</span>
          <span style="font-size:13px;color:${isFreeShipping ? '#16a34a' : '#111'}">${isFreeShipping ? 'Free' : `PKR ${Number(shippingCost).toLocaleString()}`}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="font-weight:800;font-size:16px;">Total</span>
          <span style="font-weight:800;font-size:16px;">PKR ${Number(totalAmount).toLocaleString()}</span>
        </div>
      </div>

      <!-- Shipping address -->
      ${shippingAddress ? `
      <div style="margin-top:24px;background:#f9fafb;border-radius:12px;padding:16px;">
        <h3 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Shipping To</h3>
        <p style="margin:0;font-weight:700;font-size:14px;">${shippingAddress.full_name}</p>
        <p style="margin:2px 0;font-size:13px;color:#6b7280;">${shippingAddress.phone}</p>
        <p style="margin:2px 0;font-size:13px;color:#6b7280;">${shippingAddress.street}</p>
        <p style="margin:2px 0;font-size:13px;color:#6b7280;">${shippingAddress.city}, ${shippingAddress.province}</p>
      </div>` : ''}

      <!-- Payment -->
      <div style="margin-top:16px;padding:12px 16px;background:#fff7ed;border-radius:12px;border:1px solid #fed7aa;">
        <p style="margin:0;font-size:13px;color:#92400e;">
          <strong>Payment:</strong> ${paymentMethod === 'cod' ? 'Cash on Delivery — please have the amount ready when your order arrives.' : paymentMethod}
        </p>
      </div>

      <!-- Contact -->
      <div style="margin-top:28px;text-align:center;padding-top:24px;border-top:1px solid #f3f4f6;">
        <p style="font-size:13px;color:#6b7280;">Questions? Contact us on</p>
        <a href="https://wa.me/923146063795" style="display:inline-block;background:#22c55e;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;margin-top:8px;">WhatsApp: +92 314 6063795</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #f3f4f6;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Andaaz Watches. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  await mail.transporter.sendMail({
    from:    mail.from,
    to,
    subject: `Order Confirmed — #${orderRef} | Andaaz`,
    html,
  });

  console.log(`[Mail] Order confirmation sent to ${to}`);
};

// ── Verification email ─────────────────────────────────────────────
export const sendVerificationEmail = async ({ to, name, verificationUrl }) => {
  const mail = createTransporter();
  if (!mail) return;

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:500px;margin:0 auto;background:white;">
    <div style="background:#000;padding:32px;text-align:center;">
      <h1 style="margin:0;color:white;font-size:28px;font-family:Georgia,serif;">Andaaz</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 8px;font-size:22px;">Verify your email</h2>
      <p style="color:#6b7280;font-size:14px;">Hi ${name}, click the button below to verify your email and activate your account.</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${verificationUrl}" style="display:inline-block;background:#000;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">Verify Email</a>
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
    </div>
  </div>
</body>
</html>`;

  await mail.transporter.sendMail({ from: mail.from, to, subject: 'Verify your Andaaz account', html });
  console.log(`[Mail] Verification email sent to ${to}`);
};

// ── OTP email ──────────────────────────────────────────────────────
export const sendOTPEmail = async ({ to, name, otp }) => {
  const mail = createTransporter();
  if (!mail) return;

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:500px;margin:0 auto;background:white;">
    <div style="background:#000;padding:32px;text-align:center;">
      <h1 style="margin:0;color:white;font-size:28px;font-family:Georgia,serif;">Andaaz</h1>
    </div>
    <div style="padding:32px;text-align:center;">
      <h2 style="margin:0 0 8px;font-size:22px;">Your verification code</h2>
      <p style="color:#6b7280;font-size:14px;">Hi ${name}, use this OTP to verify your account:</p>
      <div style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:12px;padding:24px;margin:24px 0;">
        <p style="margin:0;font-size:42px;font-weight:900;letter-spacing:12px;color:#111;">${otp}</p>
      </div>
      <p style="color:#9ca3af;font-size:12px;">This OTP expires in 10 minutes.</p>
    </div>
  </div>
</body>
</html>`;

  await mail.transporter.sendMail({ from: mail.from, to, subject: `${otp} — Your Andaaz verification code`, html });
  console.log(`[Mail] OTP sent to ${to}`);
};
