import { Router } from 'express';
import unsubscribeCtrl from '../controllers/unsubscribeController';

const router = Router();

// Public unsubscribe route
router.get('/', unsubscribeCtrl.unsubscribe);
router.post('/', unsubscribeCtrl.unsubscribe);

export default router;
