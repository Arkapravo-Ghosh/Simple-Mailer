export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  requireTLS?: boolean;
  tls?: Record<string, unknown>;
  user?: string;
  pass?: string;
  from?: string;
};

const env = process.env;

// Defaults tuned for Google SMTP but overridable via env
export const mailConfig: MailConfig = {
  host: env.SMTP_HOST || 'smtp.gmail.com',
  // Use STARTTLS-friendly defaults for Google: port 587 and secure=false
  port: env.SMTP_PORT ? Number(env.SMTP_PORT) : 587,
  secure: env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : false,
  // prefer STARTTLS
  requireTLS: env.SMTP_REQUIRE_TLS ? env.SMTP_REQUIRE_TLS === 'true' : true,
  // default TLS options; leave strict verification on by default
  tls: {
    rejectUnauthorized: env.SMTP_TLS_REJECT_UNAUTHORIZED ? env.SMTP_TLS_REJECT_UNAUTHORIZED === 'true' : true,
  },
  user: env.SMTP_USER || env.GMAIL_USER || undefined,
  pass: env.SMTP_PASS || env.GMAIL_PASS || undefined,
  from: env.MAIL_FROM || (env.SMTP_USER || env.GMAIL_USER) || undefined,
};

export default mailConfig;
