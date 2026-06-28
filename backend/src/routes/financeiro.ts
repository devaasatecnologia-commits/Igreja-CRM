import { Router } from 'express';
import { FinanceiroController } from '../controllers/FinanceiroController';

const router = Router();
const c = new FinanceiroController();

router.get('/lancamentos', c.listarLancamentos);
router.get('/lancamentos/:id', c.buscarLancamento);  
router.post('/lancamentos', c.criarLancamento);
router.put('/lancamentos/:id', c.atualizarLancamento);  
router.put('/lancamentos/:id/baixar', c.baixarLancamento);
router.put('/lancamentos/:id/cancelar', c.cancelarLancamento); 
router.get('/relatorio', c.relatorioFinanceiro); 
router.get('/fluxo-caixa', c.fluxoCaixa); 

export default router;