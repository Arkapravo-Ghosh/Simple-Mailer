import { Router, Request, Response } from "express";
import mailingRouter from "./routers/mailingRouter";
import unsubscribeRouter from "./routers/unsubscribeRouter";

const router = Router();

// Index Route
router.get("/", async (req: Request, res: Response): Promise<void> => {
  res.json({ message: "Server is Up and Running!" });
  return;
});

router.use("/api/mailing-list", mailingRouter);
router.use("/unsubscribe", unsubscribeRouter);

export default router;
