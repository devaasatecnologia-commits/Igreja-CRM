import { Router } from 'express';
import { ProcessoController } from '../controllers/ProcessoController';

const router = Router();
const c = new ProcessoController();

router.get('/', c.listar);
router.get('/:id', c.buscarPorId);
router.post('/', c.criar);
router.put('/etapas/:etapaId', c.atualizarEtapa);
router.post('/:id/documentos', c.adicionarDocumento);

export default router;