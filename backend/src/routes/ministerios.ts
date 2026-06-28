import { Router } from 'express';
import { getMinisterios, createMinisterio, updateMinisterio, deleteMinisterio } from '../controllers/ministeriosController';

const router = Router();

router.get('/', getMinisterios);
router.post('/', createMinisterio);
router.put('/:id', updateMinisterio);
router.delete('/:id', deleteMinisterio);

export default router;
