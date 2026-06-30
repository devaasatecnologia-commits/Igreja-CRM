import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import pool from '../config/database';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Listar todos os documentos
router.get('/', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        console.log('Buscando documentos para igreja_id:', igrejaId);
        
        const [rows] = await pool.query(
            `SELECT d.*, m.nome as membro_nome
             FROM documentos d
             LEFT JOIN membros m ON d.membro_id = m.id
             WHERE d.igreja_id = ? 
             ORDER BY d.criado_em DESC`,
            [igrejaId]
        );
        
        const documentos = rows as any[];
        console.log('Documentos encontrados:', documentos.length);
        
        res.json({
            success: true,
            data: documentos,
            total: documentos.length
        });
    } catch (error) {
        console.error('Erro ao listar documentos:', error);
        // Retornar dados vazios para não quebrar o frontend
        res.json({
            success: true,
            data: [],
            total: 0,
            message: 'Módulo de documentos em desenvolvimento'
        });
    }
});

// Buscar um documento específico
router.get('/:id', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        const [rows] = await pool.query(
            `SELECT d.*, m.nome as membro_nome
             FROM documentos d
             LEFT JOIN membros m ON d.membro_id = m.id
             WHERE d.id = ? AND d.igreja_id = ?`,
            [req.params.id, igrejaId]
        );
        const documentos = rows as any[];
        if (documentos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Documento não encontrado'
            });
        }
        res.json({
            success: true,
            data: documentos[0]
        });
    } catch (error) {
        console.error('Erro ao buscar documento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar documento'
        });
    }
});

// Criar novo documento
router.post('/', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        const { titulo, tipo, membro_id, descricao, data_validade, observacoes } = req.body;
        
        const [result] = await pool.query(
            `INSERT INTO documentos 
             (igreja_id, titulo, tipo, membro_id, descricao, data_validade, observacoes, status, data_emissao, criado_em)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'GERADO', CURDATE(), NOW())`,
            [igrejaId, titulo, tipo || 'OUTRO', membro_id, descricao || null, data_validade || null, observacoes || null]
        );
        
        res.status(201).json({
            success: true,
            message: 'Documento criado com sucesso!',
            id: (result as any).insertId
        });
    } catch (error) {
        console.error('Erro ao criar documento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar documento'
        });
    }
});

export default router;
