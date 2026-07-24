import { Resend } from 'resend';

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.warn('[Mail] RESEND_API_KEY not set — emails disabled'); return null; }
  return new Resend(apiKey);
};

const FROM = `${process.env.MAIL_FROM_NAME || 'Andaaz Watches'} <${process.env.MAIL_FROM_EMAIL || 'onboarding@resend.dev'}>`;

export const sendOrderConfirmationEmail = async ({ to, customerName, orderId, items, itemsTotal, shippingCost, totalAmount, paymentMethod, shippingAddress }) => {
  const resend = getResend();
  if (!resend) return;

  const orderRef  = orderId.slice(-8).toUpperCase();
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #f3f4f6;">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;display:block;"/>` : ''}
        <p style="margin:4px 0 0;font-weight:700;font-size:14px;">${item.name}</p>
        <p style="margin:2px 0;color:#6b7280;font-size:12px;">Qty: ${item.qty}</p>
      </td>
      <td style="padding:10px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700;font-size:14px;vertical-align:top;">
        PKR ${Number(item.price * item.qty).toLocaleString()}
      </td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:0 auto;background:white;">
  <div style="background:#000;padding:32px;text-align:center;">
    <h1 style="margin:0;color:white;font-size:28px;font-family:Georgia,serif;">Andaaz</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:3px;text-transform:uppercase;">Luxury Timepieces</p>
  </div>
  <div style="padding:32px;">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:28px;text-align:center;">
      <p style="margin:0;font-size:24px;">✓</p>
      <h2 style="margin:8px 0 4px;color:#166534;font-size:20px;">Order Confirmed!</h2>
      <p style="margin:0;color:#166534;font-size:14px;">Order #${orderRef}</p>
    </div>
    <p style="font-size:15px;color:#374151;">Hi <strong>${customerName}</strong>,</p>
    <p style="font-size:14px;color:#6b7280;line-height:1.6;">Thank you for your order! We have received it and will process it shortly.</p>
    <h3 style="font-size:14px;font-weight:700;color:#111;text-transform:uppercase;letter-spacing:1px;margin:24px 0 12px;">Your Order</h3>
    <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
    <div style="margin-top:16px;padding-top:16px;border-top:2px solid #111;">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="color:#6b7280;font-size:13px;">Subtotal</span>
        <span style="font-size:13px;">PKR ${Number(itemsTotal).toLocaleString()}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
        <span style="color:#6b7280;font-size:13px;">Shipping</span>
        <span style="font-size:13px;${shippingCost===0?'color:#16a34a':''};">${shippingCost===0?'Free':`PKR ${Number(shippingCost).toLocaleString()}`}</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="font-weight:800;font-size:16px;">Total</span>
        <span style="font-weight:800;font-size:16px;">PKR ${Number(totalAmount).toLocaleString()}</span>
      </div>
    </div>
    ${shippingAddress ? `
    <div style="margin-top:24px;background:#f9fafb;border-radius:12px;padding:16px;">
      <h3 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;">Shipping To</h3>
      <p style="margin:0;font-weight:700;font-size:14px;">${shippingAddress.full_name}</p>
      <p style="margin:2px 0;font-size:13px;color:#6b7280;">${shippingAddress.phone}</p>
      <p style="margin:2px 0;font-size:13px;color:#6b7280;">${shippingAddress.street}</p>
      <p style="margin:2px 0;font-size:13px;color:#6b7280;">${shippingAddress.city}, ${shippingAddress.province}</p>
    </div>` : ''}
    <div style="margin-top:16px;padding:12px 16px;background:#fff7ed;border-radius:12px;border:1px solid #fed7aa;">
      <p style="margin:0;font-size:13px;color:#92400e;">
        <strong>Payment:</strong> ${paymentMethod==='cod'?'Cash on Delivery — please have the amount ready when your order arrives.':paymentMethod}
      </p>
    </div>
    <div style="margin-top:28px;text-align:center;padding-top:24px;border-top:1px solid #f3f4f6;">
      <p style="font-size:13px;color:#6b7280;">Questions? Contact us on WhatsApp</p>
      <a href="https://wa.me/923146063795" style="display:inline-block;background:#22c55e;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;margin-top:8px;">+92 314 6063795</a>
    </div>
  </div>
  <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #f3f4f6;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Andaaz Watches. All rights reserved.</p>
  </div>
</div>
</body></html>`;

  const { error } = await resend.emails.send({ from: FROM, to: [to], subject: `Order Confirmed — #${orderRef} | Andaaz`, html });
  if (error) throw new Error(error.message);
  console.log(`[Mail] Order confirmation sent to ${to}`);
};

export const sendOTPEmail = async ({ to, name, otp }) => {
  const resend = getResend();
  if (!resend) return;

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:500px;margin:0 auto;background:white;">
  <div style="background:#000;padding:32px;text-align:center;">
    <h1 style="margin:0;color:white;font-size:28px;font-family:Georgia,serif;">Andaaz</h1>
  </div>
  <div style="padding:32px;text-align:center;">
    <h2 style="margin:0 0 8px;font-size:22px;">Your verification code</h2>
    <p style="color:#6b7280;font-size:14px;">Hi ${name}, use this OTP to verify your Andaaz account:</p>
    <div style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:12px;padding:24px;margin:24px 0;">
      <p style="margin:0;font-size:42px;font-weight:900;letter-spacing:12px;color:#111;">${otp}</p>
    </div>
    <p style="color:#9ca3af;font-size:12px;">This OTP expires in 10 minutes. If you did not register, ignore this email.</p>
  </div>
</div>
</body></html>`;

  const { error } = await resend.emails.send({ from: FROM, to: [to], subject: `${otp} — Your Andaaz verification code`, html });
  if (error) throw new Error(error.message);
  console.log(`[Mail] OTP sent to ${to}`);
};
