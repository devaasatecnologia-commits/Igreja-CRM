import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';

const router = Router();
const c = new DashboardController();

router.get('/', c.getDados);

export { router as dashboardRouter };