import { Router } from 'express';
import { getFinanceiro, createFinanceiro, updateFinanceiro, deleteFinanceiro } from '../controllers/financeiroController';

const router = Router();

router.get('/', getFinanceiro);
router.post('/', createFinanceiro);
router.put('/:id', updateFinanceiro);
router.delete('/:id', deleteFinanceiro);

export default router;
