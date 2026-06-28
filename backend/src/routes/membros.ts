import { Router } from 'express';
import { MembroController } from '../controllers/MembroController';

const router = Router();
const c = new MembroController();

// Rota PÚBLICA para login do membro (SEM autenticação)
router.post('/login', c.loginMembro);

// Rotas protegidas
router.get('/', c.listar);
router.get('/estatisticas', c.estatisticas);
router.get('/:id', c.buscarPorId);
router.post('/', c.criar);
router.put('/:id', c.atualizar);
router.delete('/:id', c.excluir);

export default router;