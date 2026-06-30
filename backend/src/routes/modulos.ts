import { Router } from 'express';
import { ModulosController } from '../controllers/ModulosController';

const router = Router();
const modulosController = new ModulosController();

// Rotas de módulos por igreja
router.get('/:igrejaId', modulosController.listarModulos);
router.put('/:igrejaId', modulosController.atualizarModulos);

export default router;
