import { Request, Response } from "express";
import mailSvc from "../services/mailServices";

const unsubscribe = async (req: Request, res: Response) => {
  const uuid = (req.query.uuid || req.body.uuid || req.params.uuid) as string | undefined;
  if (!uuid) return res.status(400).send({ error: "Missing uuid" });

  const results = await mailSvc.removeRecipients(uuid);
  const first = results[0];
  if (first && first.success) return res.json({ success: true });
  return res.status(404).json({ success: false, error: "Not found or already removed" });
};

export default { unsubscribe };
