import { Router } from 'express';
import { authMiddleware, superAdminMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import authRoutes from './auth';
import igrejaRoutes from './igrejas';
import membroRoutes from './membros';
import ministerioRoutes from './ministerios';
import processoRoutes from './processos';
import documentoRoutes from './documentos';
import agendaRoutes from './agenda';
import financeiroRoutes from './financeiro';
import vendaRoutes from './vendas';
import blogRoutes from './blog';
import superAdminRoutes from './superadmin';

// Importar o controller para rota pública
import { MembroController } from '../controllers/MembroController';

const router = Router();
const membroController = new MembroController();

// ============ ROTAS PÚBLICAS (sem autenticação) ============
router.use('/auth', authRoutes);
router.post('/membros/login', (req, res) => membroController.loginMembro(req, res));

// ============ ROTAS PROTEGIDAS ============
router.use('/igrejas', authMiddleware, igrejaRoutes);
router.use('/membros', authMiddleware, tenantMiddleware, membroRoutes);
router.use('/ministerios', authMiddleware, tenantMiddleware, ministerioRoutes);
router.use('/processos', authMiddleware, tenantMiddleware, processoRoutes);
router.use('/documentos', authMiddleware, tenantMiddleware, documentoRoutes);
router.use('/agenda', authMiddleware, tenantMiddleware, agendaRoutes);
router.use('/financeiro', authMiddleware, tenantMiddleware, financeiroRoutes);
router.use('/vendas', authMiddleware, tenantMiddleware, vendaRoutes);
router.use('/blog', authMiddleware, tenantMiddleware, blogRoutes);
router.use('/superadmin', authMiddleware, superAdminMiddleware, superAdminRoutes);

export { router };