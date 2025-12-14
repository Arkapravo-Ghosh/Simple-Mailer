import { Request, Response } from "express";
import mailSvc from "../services/mailServices";
import mailUtils from "../utils/mailUtils";
import generateHtml from "../helpers/generateHtml";

const add = async (req: Request, res: Response) => {
  const payload = req.body;
  const results = await mailSvc.addRecipients(payload);
  return res.json({ results });
};

const list = async (req: Request, res: Response) => {
  const filter = req.query || {};
  const docs = await mailSvc.listRecipients(filter as any);
  return res.json(docs);
};

const update = async (req: Request, res: Response) => {
  const payload = req.body;
  const results = await mailSvc.updateRecipients(payload);
  return res.json({ results });
};

const remove = async (req: Request, res: Response) => {
  const identifiers = req.body.identifiers || req.query.identifiers;
  if (!identifiers) return res.status(400).json({ error: "No identifiers provided" });
  const results = await mailSvc.removeRecipients(identifiers);
  return res.json({ results });
};

const sendAll = async (req: Request, res: Response) => {
  const subject = (req.body && req.body.subject) || "Notification from Simple Mailer";
  const text = (req.body && req.body.text) || "";

  const recipients = await mailSvc.listRecipients();
  const base = (process.env.BASE_URL || ").replace(/\/$/, ");

  const messages = recipients.map((r: any) => {
    const unsubscribeUrl = `${base}/unsubscribe?uuid=${r.uuid}`;
    const html = generateHtml(r.name, unsubscribeUrl);
    return {
      to: r.email,
      subject,
      text,
      html,
      mailingList: {
        listId: process.env.MAIL_LIST_ID || "simple-mailer",
        unsubscribe: `<${unsubscribeUrl}>`,
        oneClickUnsubscribe: true,
        autoSubmitted: false,
        precedence: "bulk",
      },
    };
  });

  // Fire-and-forget: kick off sending asynchronously and return immediately.
  mailUtils
    .sendMail(messages)
    .then((results) => {
      // Log summary when finished
      // eslint-disable-next-line no-console
      console.log('[mailListController] sendAll completed:', results.length, 'messages');
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[mailListController] sendAll error:', err);
    });

  return res.status(202).json({ queued: recipients.length, message: 'Sending started' });
};

export default {
  add,
  list,
  update,
  remove,
  sendAll,
};
