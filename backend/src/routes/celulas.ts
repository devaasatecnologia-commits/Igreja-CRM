import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import pool from '../config/database';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Listar todas as células
router.get('/', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        
        const [rows] = await pool.query(
            `SELECT c.*, 
             (SELECT COUNT(*) FROM membros WHERE celula_id = c.id) as membros_count,
             (SELECT nome FROM membros WHERE id = c.lider_id) as lider_nome
             FROM celulas c 
             WHERE c.igreja_id = ? 
             ORDER BY c.nome`,
            [igrejaId]
        );
        
        res.json({
            success: true,
            data: rows,
            total: (rows as any[]).length
        });
    } catch (error) {
        console.error('❌ Erro ao listar células:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar células'
        });
    }
});

export default router;
