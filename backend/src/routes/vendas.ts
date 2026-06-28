import { Router } from 'express';
import { VendaController } from '../controllers/VendaController';

const router = Router();
const c = new VendaController();

router.get('/produtos', c.listarProdutos);
router.post('/produtos', c.criarProduto);
router.get('/', c.listarVendas);
router.post('/', c.criarVenda);
router.put('/:id/cancelar', c.cancelarVenda);

export default router;