import { Router } from 'express';
import authRoutes from './auth';
import membrosRoutes from './membros';
import ministeriosRoutes from './ministerios';
import celulasRoutes from './celulas';
import agendamentosRoutes from './agendamentos';
import financeiroRoutes from './financeiro';
import documentosRoutes from './documentos';

const router = Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas principais da aplicação
router.use('/membros', membrosRoutes);
router.use('/ministerios', ministeriosRoutes);
router.use('/celulas', celulasRoutes);
router.use('/agendamentos', agendamentosRoutes);
router.use('/financeiro', financeiroRoutes);
router.use('/documentos', documentosRoutes);

// Rota de teste
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando perfeitamente!',
        timestamp: new Date().toISOString()
    });
});

export { router };
