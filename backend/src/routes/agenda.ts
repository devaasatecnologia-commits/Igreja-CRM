import { Router } from 'express';
import { AgendaController } from '../controllers/AgendaController';

const router = Router();
const c = new AgendaController();

router.get('/', c.listar);
router.get('/proximos', c.proximos);
router.get('/:id', c.buscarPorId);
router.post('/', c.criar);
router.put('/:id', c.atualizar);
router.put('/:id/status', c.alterarStatus);
router.post('/:id/confirmar', c.confirmarPresenca);
router.post('/:id/checkin', c.checkin);
router.delete('/:id', c.excluir);
router.post('/atas', c.salvarAta);

export default router;