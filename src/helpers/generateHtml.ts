const escapeHtml = (str: string): string =>
  str.replace(/[&<>"']/g, (c) => {
    const m: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return m[c] || c;
  });

const generateHtml = (name?: string, unsubscribeUrl = "{{unsubscribe_url}}"): string => {
  const displayName = name ? escapeHtml(name) : "Subscriber";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Notification</title>
  </head>
  <body style="font-family: Arial, sans-serif; color: #333; background:#f6f9fc; margin:0; padding:24px;">
    <div style="max-width:680px;margin:24px auto;padding:0;">
      <div style="background:#ffffff;border-radius:8px;box-shadow:0 6px 18px rgba(18,38,63,0.06);overflow:hidden;border:1px solid rgba(16,24,40,0.04);">
        <div style="padding:20px 28px;border-bottom:1px solid rgba(16,24,40,0.04);background:linear-gradient(180deg,#ffffff,#fbfdff);">
          <h1 style="margin:0;font-size:18px;color:#0f1724;font-weight:600;">Simple Mailer</h1>
        </div>
        <div style="padding:28px;">
          <h2 style="margin:0 0 12px 0;font-size:16px;color:#0f1724;">Hello ${displayName},</h2>
          <p style="margin:0 0 16px 0;color:#334155;">This is an automated message from Simple Mailer. You are receiving this because you subscribed to our list.</p>

          <div style="margin-top:18px;">
            <p style="margin:0;color:#475569;">Best regards,<br/>The Simple Mailer Team</p>
          </div>
        </div>
        <div style="padding:14px 28px;background:#fbfdff;border-top:1px solid rgba(16,24,40,0.04);">
          <p style="margin:0;font-size:12px;color:#667085;">If you do not wish to receive these emails, <a href="${unsubscribeUrl}" style="color:#0b69ff;">unsubscribe here</a>.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;
};

export default generateHtml;
