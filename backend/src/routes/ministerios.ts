import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import pool from '../config/database';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Listar todos os ministérios
router.get('/', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        console.log('🔍 Buscando ministérios para igreja_id:', igrejaId);
        
        const [rows] = await pool.query(
            'SELECT * FROM ministerios WHERE igreja_id = ? ORDER BY nome',
            [igrejaId]
        );
        
        console.log('✅ Ministérios encontrados:', (rows as any[]).length);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('❌ Erro ao listar ministérios:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar ministérios'
        });
    }
});

export default router;
