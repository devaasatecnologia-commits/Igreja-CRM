import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import pool from '../config/database';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Listar todos os agendamentos
router.get('/', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        console.log('Buscando agendamentos para igreja_id:', igrejaId);
        
        const [rows] = await pool.query(
            `SELECT a.*, 
             (SELECT nome FROM membros WHERE id = a.responsavel_id) as responsavel_nome
             FROM agendamentos a 
             WHERE a.igreja_id = ? 
             ORDER BY a.data_inicio DESC`,
            [igrejaId]
        );
        
        const agendamentos = rows as any[];
        console.log('Agendamentos encontrados:', agendamentos.length);
        
        res.json({
            success: true,
            data: agendamentos,
            total: agendamentos.length
        });
    } catch (error) {
        console.error('Erro ao listar agendamentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar agendamentos'
        });
    }
});

// Buscar um agendamento específico
router.get('/:id', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        const [rows] = await pool.query(
            `SELECT a.*, 
             (SELECT nome FROM membros WHERE id = a.responsavel_id) as responsavel_nome
             FROM agendamentos a 
             WHERE a.id = ? AND a.igreja_id = ?`,
            [req.params.id, igrejaId]
        );
        const agendamentos = rows as any[];
        if (agendamentos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Agendamento nao encontrado'
            });
        }
        res.json({
            success: true,
            data: agendamentos[0]
        });
    } catch (error) {
        console.error('Erro ao buscar agendamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar agendamento'
        });
    }
});

// Criar novo agendamento
router.post('/', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        const { 
            titulo, descricao, data_inicio, data_fim, tipo, 
            local_evento, capacidade, responsavel_id, status 
        } = req.body;
        
        const [result] = await pool.query(
            `INSERT INTO agendamentos 
             (igreja_id, titulo, descricao, data_inicio, data_fim, tipo, 
              local_evento, capacidade, responsavel_id, status, criado_em)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [igrejaId, titulo, descricao, data_inicio, data_fim, tipo || 'OUTRO', 
             local_evento || null, capacidade || null, responsavel_id || null, status || 'AGENDADO']
        );
        
        res.status(201).json({
            success: true,
            message: 'Agendamento criado com sucesso!',
            id: (result as any).insertId
        });
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar agendamento'
        });
    }
});

// Atualizar agendamento
router.put('/:id', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        const { 
            titulo, descricao, data_inicio, data_fim, tipo, 
            local_evento, capacidade, responsavel_id, status 
        } = req.body;
        
        await pool.query(
            `UPDATE agendamentos SET 
             titulo = ?, descricao = ?, data_inicio = ?, data_fim = ?, 
             tipo = ?, local_evento = ?, capacidade = ?, 
             responsavel_id = ?, status = ?, atualizado_em = NOW()
             WHERE id = ? AND igreja_id = ?`,
            [titulo, descricao, data_inicio, data_fim, tipo, 
             local_evento, capacidade, responsavel_id, status, 
             req.params.id, igrejaId]
        );
        
        res.json({
            success: true,
            message: 'Agendamento atualizado com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar agendamento'
        });
    }
});

// Excluir agendamento
router.delete('/:id', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        
        await pool.query(
            'DELETE FROM agendamentos WHERE id = ? AND igreja_id = ?',
            [req.params.id, igrejaId]
        );
        
        res.json({
            success: true,
            message: 'Agendamento excluido com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir agendamento'
        });
    }
});

// Atualizar status do agendamento
router.put('/:id/status', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        const { status } = req.body;
        
        await pool.query(
            `UPDATE agendamentos SET 
             status = ?, atualizado_em = NOW()
             WHERE id = ? AND igreja_id = ?`,
            [status, req.params.id, igrejaId]
        );
        
        res.json({
            success: true,
            message: 'Status atualizado com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar status'
        });
    }
});

export default router;
