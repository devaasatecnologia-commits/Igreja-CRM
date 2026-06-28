import { Router } from 'express';
import { IgrejaController } from '../controllers/IgrejaController';

const router = Router();
const c = new IgrejaController();

router.get('/minha', c.minhaIgreja);
router.put('/personalizacao', c.atualizarPersonalizacao);
router.get('/modulos', c.getModulos);

export default router;