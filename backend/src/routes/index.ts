import { Router } from 'express';
import authRoutes from './auth';
import membrosRoutes from './membros';

const router = Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de membros
router.use('/membros', membrosRoutes);

// Rota de teste
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando perfeitamente!',
        timestamp: new Date().toISOString()
    });
});

// Rota para listar usuários
router.get('/usuarios', async (req, res) => {
    try {
        const pool = require('../config/database').default;
        const [rows] = await pool.query('SELECT id, nome, email, tipo FROM usuarios LIMIT 10');
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuários',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});

export { router };
