import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import pool from '../config/database';

const router = Router();

// Aplicar middlewares em todas as rotas
router.use(authMiddleware);
router.use(tenantMiddleware);

// Listar todos os membros
router.get('/', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        console.log('🔍 Buscando membros para igreja_id:', igrejaId);
        
        const [rows] = await pool.query(
            'SELECT * FROM membros WHERE igreja_id = ? ORDER BY nome',
            [igrejaId]
        );
        
        console.log('✅ Membros encontrados:', (rows as any[]).length);
        
        res.json({
            success: true,
            data: rows,
            total: (rows as any[]).length
        });
    } catch (error) {
        console.error('❌ Erro ao listar membros:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar membros',
            error: error.message
        });
    }
});

// Buscar um membro específico
router.get('/:id', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        const [rows] = await pool.query(
            'SELECT * FROM membros WHERE id = ? AND igreja_id = ?',
            [req.params.id, igrejaId]
        );
        const membros = rows as any[];
        if (membros.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Membro não encontrado'
            });
        }
        res.json({
            success: true,
            data: membros[0]
        });
    } catch (error) {
        console.error('Erro ao buscar membro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar membro'
        });
    }
});

export default router;
