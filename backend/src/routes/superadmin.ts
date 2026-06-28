import { Router } from 'express';
import { SuperAdminController } from '../controllers/SuperAdminController';
import { superAdminMiddleware } from '../middleware/auth';

const router = Router();
const c = new SuperAdminController();

router.use(superAdminMiddleware);

router.get('/dashboard', c.dashboard);
router.get('/igrejas', c.listarIgrejas);
router.get('/igrejas/:id', c.detalhesIgreja);
router.put('/igrejas/:id/plano', c.atualizarPlano);
router.post('/criar', c.criarSuperAdmin);

export default router;