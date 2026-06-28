import { Router } from 'express';
import { getDoacoes, createDoacao, updateDoacao, deleteDoacao } from '../controllers/doacoesController';

const router = Router();

router.get('/', getDoacoes);
router.post('/', createDoacao);
router.put('/:id', updateDoacao);
router.delete('/:id', deleteDoacao);

export default router;
