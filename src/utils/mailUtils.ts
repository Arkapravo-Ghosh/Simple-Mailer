import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import mailConfig, { MailConfig } from "../configs/mailConfig";

type Transporter = nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

const buildTransportOptions = (cfg: MailConfig): SMTPTransport.Options => {
  const opt: SMTPTransport.Options = {
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
  };

  if (cfg.user && cfg.pass) {
    opt.auth = { user: cfg.user, pass: cfg.pass };
  }

  if (typeof cfg.requireTLS !== "undefined") {
    // nodemailer option to prefer STARTTLS
    opt.requireTLS = cfg.requireTLS;
  }

  if (cfg.tls) {
    opt.tls = cfg.tls as any;
  }

  return opt;
};

let _transporter: Transporter | null = null;

const createTransporter = (cfg = mailConfig): Transporter => {
  if (_transporter) return _transporter;

  const transportOptions = buildTransportOptions(cfg);
  _transporter = nodemailer.createTransport(transportOptions) as Transporter;
  return _transporter;
};

const verifyTransporter = async (cfg = mailConfig): Promise<boolean> => {
  const t = createTransporter(cfg);
  try {
    await t.verify();
    return true;
  } catch (err) {
    return false;
  }
};

interface MailingListDetails {
  listId?: string;
  listPost?: string;
  unsubscribe?: string; // mailto: or https:// url
  oneClickUnsubscribe?: boolean;
  autoSubmitted?: boolean;
  precedence?: string;
}

interface MessageItem {
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject?: string;
  text?: string;
  html?: string;
  from?: string;
  headers?: Record<string, string>;
  mailingList?: MailingListDetails;
}

interface SendResult {
  success: boolean;
  info?: any;
  error?: any;
  message?: MessageItem;
}

const sendMail = async (messages: MessageItem[], cfg = mailConfig): Promise<SendResult[]> => {
  const transporter = createTransporter(cfg);
  const results: SendResult[] = [];

  for (const msg of messages) {
    try {
      const recipients = msg.to || msg.cc || msg.bcc;
      if (!recipients) {
        const err = new Error("No recipients specified (to/cc/bcc)");
        console.error(err);
        results.push({ success: false, error: err, message: msg });
        continue;
      }

      const headers: Record<string, string> = { ...(msg.headers || {}) };

      if (msg.mailingList) {
        const ml = msg.mailingList;
        if (ml.listId) headers["List-Id"] = ml.listId;
        if (ml.listPost) headers["List-Post"] = ml.listPost;
        if (ml.unsubscribe) headers["List-Unsubscribe"] = ml.unsubscribe;
        if (ml.oneClickUnsubscribe && ml.unsubscribe) headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
        if (ml.precedence) headers["Precedence"] = ml.precedence;
        if (ml.autoSubmitted) headers["Auto-Submitted"] = ml.autoSubmitted ? "auto-generated" : "no";
      }

      const mailOptions: nodemailer.SendMailOptions = {
        from: msg.from || cfg.from,
        to: msg.to,
        cc: msg.cc,
        bcc: msg.bcc,
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
        headers,
      };

      const info = await transporter.sendMail(mailOptions);
      results.push({ success: true, info, message: msg });
    } catch (err) {
      console.error("sendMail error for message:", msg, err);
      results.push({ success: false, error: err, message: msg });
      continue;
    }
  }

  return results;
};

export default {
  verifyTransporter,
  sendMail,
};
