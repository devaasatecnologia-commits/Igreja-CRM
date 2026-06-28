import { Request, Response } from 'express';
import pool from '../config/database';

export class FinanceiroController {
    
    // Plano de Contas
    async listarContas(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const [contas] = await pool.query(
                'SELECT * FROM plano_contas WHERE igreja_id = ? ORDER BY codigo',
                [igrejaId]
                );
            return res.json(contas);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar contas' });
        }
    }
    
    // Novos métodos para adicionar:

    async buscarLancamento(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            const [lancamentos] = await pool.query(
                `SELECT l.*, pc.nome as conta_nome, m.nome as membro_nome
             FROM lancamentos_financeiros l
             LEFT JOIN plano_contas pc ON l.plano_conta_id = pc.id
             LEFT JOIN membros m ON l.membro_id = m.id
                WHERE l.id = ? AND l.igreja_id = ?`,
                [id, igrejaId]
                );
            if ((lancamentos as any[]).length === 0) return res.status(404).json({ error: 'Não encontrado' });
            return res.json((lancamentos as any)[0]);
        } catch (error) { return res.status(500).json({ error: 'Erro' }); }
    }

    async atualizarLancamento(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            await pool.query('UPDATE lancamentos_financeiros SET ? WHERE id = ? AND igreja_id = ?', [req.body, id, igrejaId]);
            return res.json({ message: 'Atualizado!' });
        } catch (error) { return res.status(500).json({ error: 'Erro' }); }
    }

    async cancelarLancamento(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            await pool.query("UPDATE lancamentos_financeiros SET status = 'CANCELADO' WHERE id = ? AND igreja_id = ?", [id, igrejaId]);
            return res.json({ message: 'Cancelado!' });
        } catch (error) { return res.status(500).json({ error: 'Erro' }); }
    }

    async relatorioFinanceiro(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { data_inicio, data_fim } = req.query;
        // Relatório detalhado
            const [lancamentos] = await pool.query(
                `SELECT l.*, pc.nome as conta_nome FROM lancamentos_financeiros l
             LEFT JOIN plano_contas pc ON l.plano_conta_id = pc.id
             WHERE l.igreja_id = ? AND l.data_vencimento BETWEEN ? AND ?
                ORDER BY l.data_vencimento`,
                [igrejaId, data_inicio, data_fim]
                );
            const [totais] = await pool.query(
                `SELECT tipo, status, SUM(valor) as total FROM lancamentos_financeiros
             WHERE igreja_id = ? AND data_vencimento BETWEEN ? AND ?
                GROUP BY tipo, status`,
                [igrejaId, data_inicio, data_fim]
                );
            return res.json({ lancamentos, totais });
        } catch (error) { return res.status(500).json({ error: 'Erro' }); }
    }
    // Lançamentos
async listarLancamentos(req: Request, res: Response) {
    try {
        const igrejaId = req.usuario!.igreja_id;
        const { tipo, status, data_inicio, data_fim, membro_id } = req.query;
        
        let sql = `
            SELECT l.*, pc.nome as conta_nome, m.nome as membro_nome
            FROM lancamentos_financeiros l
            LEFT JOIN plano_contas pc ON l.plano_conta_id = pc.id
            LEFT JOIN membros m ON l.membro_id = m.id
            WHERE l.igreja_id = ?
        `;
        const params: any[] = [igrejaId];
        
        if (tipo) { sql += ' AND l.tipo = ?'; params.push(tipo); }
        if (status) { sql += ' AND l.status = ?'; params.push(status); }
        if (data_inicio) { sql += ' AND l.data_vencimento >= ?'; params.push(data_inicio); }
        if (data_fim) { sql += ' AND l.data_vencimento <= ?'; params.push(data_fim); }
        if (membro_id) { sql += ' AND l.membro_id = ?'; params.push(membro_id); }
        
        sql += ' ORDER BY l.data_vencimento DESC LIMIT 100';
        
        const [lancamentos] = await pool.query(sql, params);
        
        // Totais (considerando filtro de membro)
        let totaisSql = `SELECT 
            COALESCE(SUM(CASE WHEN tipo = 'RECEBER' AND status IN ('PENDENTE','VENCIDO') THEN valor END), 0) as a_receber,
            COALESCE(SUM(CASE WHEN tipo = 'PAGAR' AND status IN ('PENDENTE','VENCIDO') THEN valor END), 0) as a_pagar,
            COALESCE(SUM(CASE WHEN tipo = 'RECEBER' AND status = 'PAGO' AND MONTH(data_pagamento) = MONTH(NOW()) THEN valor END), 0) as recebido_mes,
            COALESCE(SUM(CASE WHEN tipo = 'PAGAR' AND status = 'PAGO' AND MONTH(data_pagamento) = MONTH(NOW()) THEN valor END), 0) as pago_mes
        FROM lancamentos_financeiros WHERE igreja_id = ?`;
        
        const totaisParams: any[] = [igrejaId];
        
        if (membro_id) {
            totaisSql += ' AND membro_id = ?';
            totaisParams.push(membro_id);
        }
        
        const [totais] = await pool.query(totaisSql, totaisParams);
        
        return res.json({ lancamentos, totais: (totais as any)[0] });
    } catch (error) {
        console.error('Erro ao listar lançamentos:', error);
        return res.status(500).json({ error: 'Erro ao listar lançamentos' });
    }
}
    
    async criarLancamento(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { tipo, descricao, valor, data_vencimento, plano_conta_id, membro_id, parcelas = 1 } = req.body;
            
            const ids = [];
            for (let i = 0; i < parcelas; i++) {
                const dataParcela = new Date(data_vencimento);
                dataParcela.setMonth(dataParcela.getMonth() + i);
                
                const [result] = await pool.query(
                    `INSERT INTO lancamentos_financeiros 
                     (igreja_id, tipo, descricao, valor, data_vencimento, plano_conta_id, membro_id, parcela_atual, total_parcelas)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [igrejaId, tipo, parcelas > 1 ? `${descricao} (${i+1}/${parcelas})` : descricao,
                    valor / parcelas, dataParcela, plano_conta_id, membro_id || null, i + 1, parcelas]
                    );
                ids.push((result as any).insertId);
            }
            
            return res.status(201).json({ message: 'Lançamento criado!', ids });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar lançamento' });
        }
    }
    
    async baixarLancamento(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            const { data_pagamento, forma_pagamento } = req.body;
            
            await pool.query(
                `UPDATE lancamentos_financeiros 
                 SET status = 'PAGO', data_pagamento = ?, forma_pagamento = ?
                WHERE id = ? AND igreja_id = ?`,
                [data_pagamento || new Date(), forma_pagamento || 'DINHEIRO', id, igrejaId]
                );
            
            return res.json({ message: 'Lançamento baixado!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao baixar' });
        }
    }
    
    async fluxoCaixa(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { mes, ano } = req.query;
            const mesAtual = mes || new Date().getMonth() + 1;
            const anoAtual = ano || new Date().getFullYear();
            
            const [receitas] = await pool.query(
                `SELECT pc.categoria, SUM(l.valor) as total
                 FROM lancamentos_financeiros l
                 JOIN plano_contas pc ON l.plano_conta_id = pc.id
                 WHERE l.igreja_id = ? AND l.tipo = 'RECEBER' AND l.status = 'PAGO'
                 AND MONTH(l.data_pagamento) = ? AND YEAR(l.data_pagamento) = ?
                GROUP BY pc.categoria`,
                [igrejaId, mesAtual, anoAtual]
                );
            
            const [despesas] = await pool.query(
                `SELECT pc.categoria, SUM(l.valor) as total
                 FROM lancamentos_financeiros l
                 JOIN plano_contas pc ON l.plano_conta_id = pc.id
                 WHERE l.igreja_id = ? AND l.tipo = 'PAGAR' AND l.status = 'PAGO'
                 AND MONTH(l.data_pagamento) = ? AND YEAR(l.data_pagamento) = ?
                GROUP BY pc.categoria`,
                [igrejaId, mesAtual, anoAtual]
                );
            
            const totalReceitas = (receitas as any[]).reduce((acc: number, r: any) => acc + Number(r.total), 0);
            const totalDespesas = (despesas as any[]).reduce((acc: number, d: any) => acc + Number(d.total), 0);
            
            return res.json({
                mes: mesAtual, ano: anoAtual,
                receitas, despesas,
                totalReceitas, totalDespesas,
                saldo: totalReceitas - totalDespesas
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro no fluxo de caixa' });
        }
    }
}