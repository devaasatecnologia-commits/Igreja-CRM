import { Request, Response } from 'express';
import pool from '../config/database';

export class DashboardController {
    
    // Dados completos do dashboard
    async getDados(req: Request, res: Response) {
        try {
            const igrejaId = (req as any).usuario.igreja_id || 1;
            
            // Total de membros
            const [totalMembros] = await pool.query(
                'SELECT COUNT(*) as total FROM membros WHERE igreja_id = ?',
                [igrejaId]
            );
            
            // Membros ativos
            const [membrosAtivos] = await pool.query(
                "SELECT COUNT(*) as total FROM membros WHERE igreja_id = ? AND status = 'ATIVO'",
                [igrejaId]
            );
            
            // Receitas do mês
            const [receitas] = await pool.query(
                `SELECT COALESCE(SUM(valor), 0) as total 
                 FROM lancamentos_financeiros 
                 WHERE igreja_id = ? AND tipo = 'RECEBER' AND status = 'PAGO'
                 AND MONTH(data_pagamento) = MONTH(NOW()) AND YEAR(data_pagamento) = YEAR(NOW())`,
                [igrejaId]
            );
            
            // Eventos da semana
            const [eventos] = await pool.query(
                `SELECT COUNT(*) as total FROM agendamentos 
                 WHERE igreja_id = ? AND status != 'CANCELADO'
                 AND WEEK(data_inicio) = WEEK(NOW()) AND YEAR(data_inicio) = YEAR(NOW())`,
                [igrejaId]
            );
            
            // Documentos emitidos
            const [documentos] = await pool.query(
                `SELECT 
                    (SELECT COUNT(*) FROM carteirinhas WHERE igreja_id = ?) +
                    (SELECT COUNT(*) FROM certificados WHERE igreja_id = ?) as total`,
                [igrejaId, igrejaId]
            );
            
            // Últimos membros
            const [ultimosMembros] = await pool.query(
                `SELECT id, nome, email, tipo_membro, status, criado_em 
                 FROM membros WHERE igreja_id = ? 
                 ORDER BY criado_em DESC LIMIT 5`,
                [igrejaId]
            );
            
            // Dados do gráfico (últimos 6 meses)
            const [grafico] = await pool.query(
                `SELECT 
                    MONTH(criado_em) as mes,
                    COUNT(*) as total
                 FROM membros 
                 WHERE igreja_id = ? AND criado_em >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                 GROUP BY MONTH(criado_em)
                 ORDER BY mes`,
                [igrejaId]
            );
            
            // Dados da igreja
            const [igreja] = await pool.query(
                'SELECT * FROM igrejas WHERE id = ?',
                [igrejaId]
            );
            
            return res.json({
                membros: {
                    total: (totalMembros as any)[0].total,
                    ativos: (membrosAtivos as any)[0].total
                },
                financeiro: {
                    receitas_mes: (receitas as any)[0].total
                },
                eventos: {
                    esta_semana: (eventos as any)[0].total
                },
                documentos: {
                    total: (documentos as any)[0].total
                },
                ultimos_membros: ultimosMembros,
                grafico_membros: grafico,
                igreja: (igreja as any)[0] || {}
            });
        } catch (error) {
            console.error('Erro no dashboard:', error);
            return res.status(500).json({ error: 'Erro ao carregar dashboard' });
        }
    }
}