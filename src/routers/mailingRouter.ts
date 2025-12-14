import { Router } from "express";
import mailListCtrl from "../controllers/mailListController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

// protect mailing list management and send endpoints
router.use(authMiddleware);

router.get("/", mailListCtrl.list);
router.post("/", mailListCtrl.add);
router.put("/", mailListCtrl.update);
router.delete("/", mailListCtrl.remove);
router.post("/send", mailListCtrl.sendAll);

export default router;
