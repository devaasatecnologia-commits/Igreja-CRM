import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import pool from '../config/database';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// ============================================
// LISTAR LANÇAMENTOS FINANCEIROS
// ============================================
router.get('/lancamentos', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        console.log('🔍 Buscando lançamentos para igreja_id:', igrejaId);
        
        const [rows] = await pool.query(
            `SELECT l.*, 
             m.nome as membro_nome,
             pc.nome as conta_nome
             FROM lancamentos_financeiros l
             LEFT JOIN membros m ON l.membro_id = m.id
             LEFT JOIN plano_contas pc ON l.plano_conta_id = pc.id
             WHERE l.igreja_id = ? 
             ORDER BY l.data_vencimento DESC`,
            [igrejaId]
        );
        
        const lancamentos = rows as any[];
        console.log('✅ Lançamentos encontrados:', lancamentos.length);
        
        // Calcular totais
        let totalReceitas = 0, totalDespesas = 0, totalPendentes = 0, totalVencidos = 0;
        
        lancamentos.forEach(l => {
            const valor = parseFloat(l.valor) || 0;
            if (l.tipo === 'RECEBER') {
                if (l.status === 'PAGO') totalReceitas += valor;
                else if (l.status === 'PENDENTE') totalPendentes += valor;
                else if (l.status === 'VENCIDO') totalVencidos += valor;
            } else if (l.tipo === 'PAGAR') {
                if (l.status === 'PAGO') totalDespesas += valor;
                else if (l.status === 'PENDENTE') totalPendentes += valor;
                else if (l.status === 'VENCIDO') totalVencidos += valor;
            }
        });
        
        res.json({
            success: true,
            lancamentos: lancamentos,
            totais: {
                recebido_mes: totalReceitas,
                pago_mes: totalDespesas,
                a_receber: totalPendentes,
                a_pagar: totalVencidos
            }
        });
    } catch (error) {
        console.error('❌ Erro ao listar lançamentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar lançamentos',
            error: error.message
        });
    }
});

// ============================================
// BUSCAR UM LANÇAMENTO ESPECÍFICO
// ============================================
router.get('/lancamentos/:id', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        const [rows] = await pool.query(
            `SELECT l.*, 
             m.nome as membro_nome,
             pc.nome as conta_nome
             FROM lancamentos_financeiros l
             LEFT JOIN membros m ON l.membro_id = m.id
             LEFT JOIN plano_contas pc ON l.plano_conta_id = pc.id
             WHERE l.id = ? AND l.igreja_id = ?`,
            [req.params.id, igrejaId]
        );
        const lancamentos = rows as any[];
        if (lancamentos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lançamento não encontrado'
            });
        }
        res.json({
            success: true,
            data: lancamentos[0]
        });
    } catch (error) {
        console.error('Erro ao buscar lançamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar lançamento'
        });
    }
});

// ============================================
// CRIAR NOVO LANÇAMENTO
// ============================================
router.post('/lancamentos', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        const { tipo, descricao, valor, data_vencimento, plano_conta_id, membro_id, observacao, parcelas } = req.body;
        
        const totalParcelas = parcelas || 1;
        
        const [result] = await pool.query(
            `INSERT INTO lancamentos_financeiros 
             (igreja_id, tipo, descricao, valor, data_vencimento, plano_conta_id, 
              membro_id, observacao, total_parcelas, status, criado_em)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDENTE', NOW())`,
            [igrejaId, tipo, descricao, valor, data_vencimento, plano_conta_id, 
             membro_id || null, observacao || null, totalParcelas]
        );
        
        res.status(201).json({
            success: true,
            message: 'Lançamento criado com sucesso!',
            id: (result as any).insertId
        });
    } catch (error) {
        console.error('Erro ao criar lançamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar lançamento'
        });
    }
});

// ============================================
// ATUALIZAR LANÇAMENTO
// ============================================
router.put('/lancamentos/:id', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        const { tipo, descricao, valor, data_vencimento, plano_conta_id, membro_id, observacao } = req.body;
        
        await pool.query(
            `UPDATE lancamentos_financeiros SET 
             tipo = ?, descricao = ?, valor = ?, data_vencimento = ?, 
             plano_conta_id = ?, membro_id = ?, observacao = ?, atualizado_em = NOW()
             WHERE id = ? AND igreja_id = ?`,
            [tipo, descricao, valor, data_vencimento, plano_conta_id, 
             membro_id || null, observacao || null, req.params.id, igrejaId]
        );
        
        res.json({
            success: true,
            message: 'Lançamento atualizado com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao atualizar lançamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar lançamento'
        });
    }
});

// ============================================
// BAIXAR LANÇAMENTO (MARCAR COMO PAGO)
// ============================================
router.put('/lancamentos/:id/baixar', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        const { data_pagamento, forma_pagamento } = req.body;
        
        await pool.query(
            `UPDATE lancamentos_financeiros SET 
             status = 'PAGO', 
             data_pagamento = ?, 
             forma_pagamento = ?,
             atualizado_em = NOW()
             WHERE id = ? AND igreja_id = ?`,
            [data_pagamento || new Date().toISOString().split('T')[0], 
             forma_pagamento || 'DINHEIRO', 
             req.params.id, igrejaId]
        );
        
        res.json({
            success: true,
            message: 'Lançamento baixado com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao baixar lançamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao baixar lançamento'
        });
    }
});

// ============================================
// CANCELAR LANÇAMENTO
// ============================================
router.put('/lancamentos/:id/cancelar', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        
        await pool.query(
            `UPDATE lancamentos_financeiros SET 
             status = 'CANCELADO', 
             atualizado_em = NOW()
             WHERE id = ? AND igreja_id = ?`,
            [req.params.id, igrejaId]
        );
        
        res.json({
            success: true,
            message: 'Lançamento cancelado com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao cancelar lançamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao cancelar lançamento'
        });
    }
});

// ============================================
// EXCLUIR LANÇAMENTO
// ============================================
router.delete('/lancamentos/:id', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        
        await pool.query(
            'DELETE FROM lancamentos_financeiros WHERE id = ? AND igreja_id = ?',
            [req.params.id, igrejaId]
        );
        
        res.json({
            success: true,
            message: 'Lançamento excluído com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao excluir lançamento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir lançamento'
        });
    }
});

// ============================================
// FLUXO DE CAIXA RESUMIDO
// ============================================
router.get('/fluxo-caixa', async (req, res) => {
    try {
        const igrejaId = (req as any).igrejaId || 1;
        
        const [rows] = await pool.query(
            `SELECT 
             SUM(CASE WHEN tipo = 'RECEBER' AND status = 'PAGO' THEN valor ELSE 0 END) as total_receitas,
             SUM(CASE WHEN tipo = 'PAGAR' AND status = 'PAGO' THEN valor ELSE 0 END) as total_despesas,
             SUM(CASE WHEN status = 'PENDENTE' THEN valor ELSE 0 END) as total_pendentes,
             SUM(CASE WHEN status = 'VENCIDO' THEN valor ELSE 0 END) as total_vencidos
             FROM lancamentos_financeiros 
             WHERE igreja_id = ? AND MONTH(data_vencimento) = MONTH(CURRENT_DATE())`,
            [igrejaId]
        );
        
        const resultado = rows as any[];
        const dados = resultado[0] || {};
        
        res.json({
            success: true,
            totalReceitas: parseFloat(dados.total_receitas) || 0,
            totalDespesas: parseFloat(dados.total_despesas) || 0,
            totalPendentes: parseFloat(dados.total_pendentes) || 0,
            totalVencidos: parseFloat(dados.total_vencidos) || 0,
            saldo: (parseFloat(dados.total_receitas) || 0) - (parseFloat(dados.total_despesas) || 0)
        });
    } catch (error) {
        console.error('Erro ao buscar fluxo de caixa:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar fluxo de caixa'
        });
    }
});

export default router;
