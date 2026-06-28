import { Router } from 'express';
import { getEventos, createEvento, updateEvento, deleteEvento } from '../controllers/eventosController';

const router = Router();

router.get('/', getEventos);
router.post('/', createEvento);
router.put('/:id', updateEvento);
router.delete('/:id', deleteEvento);

export default router;
