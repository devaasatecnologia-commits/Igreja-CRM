import { Router } from 'express';
import { MinisterioController } from '../controllers/MinisterioController';

const router = Router();
const c = new MinisterioController();

router.get('/', c.listar);
router.get('/:id', c.buscarPorId);
router.post('/', c.criar);
router.put('/:id', c.atualizar);
router.post('/:id/membros', c.adicionarMembro);
router.delete('/:id/membros/:membroId', c.removerMembro);

export default router;