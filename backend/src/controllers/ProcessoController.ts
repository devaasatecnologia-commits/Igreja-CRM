import { Request, Response } from 'express';
import pool from '../config/database';

export class ProcessoController {
    
    async listar(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { tipo, status } = req.query;
            
            let sql = `
                SELECT p.*, u.nome as responsavel_nome, m.nome as membro_nome
                FROM processos p
                LEFT JOIN usuarios u ON p.responsavel_id = u.id
                LEFT JOIN membros m ON p.membro_principal_id = m.id
                WHERE p.igreja_id = ?
            `;
            const params: any[] = [igrejaId];
            
            if (tipo) { sql += ' AND p.tipo = ?'; params.push(tipo); }
            if (status) { sql += ' AND p.status = ?'; params.push(status); }
            
            sql += ' ORDER BY p.criado_em DESC';
            
            const [processos] = await pool.query(sql, params);
            return res.json(processos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar processos' });
        }
    }
    
    async buscarPorId(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            
            const [processos] = await pool.query(
                `SELECT p.*, u.nome as responsavel_nome, m.nome as membro_nome
                 FROM processos p
                 LEFT JOIN usuarios u ON p.responsavel_id = u.id
                 LEFT JOIN membros m ON p.membro_principal_id = m.id
                 WHERE p.id = ? AND p.igreja_id = ?`,
                [id, igrejaId]
            );
            
            if ((processos as any[]).length === 0) {
                return res.status(404).json({ error: 'Processo não encontrado' });
            }
            
            // Buscar etapas
            const [etapas] = await pool.query(
                `SELECT pe.*, u.nome as concluido_por_nome
                 FROM processo_etapas pe
                 LEFT JOIN usuarios u ON pe.concluido_por = u.id
                 WHERE pe.processo_id = ?
                 ORDER BY pe.ordem`,
                [id]
            );
            
            // Buscar documentos do processo
            const [documentos] = await pool.query(
                'SELECT * FROM documentos WHERE processo_id = ?',
                [id]
            );
            
            return res.json({
                ...(processos as any)[0],
                etapas,
                documentos
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar processo' });
        }
    }
    
    async criar(req: Request, res: Response) {
        const connection = await pool.getConnection();
        
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { tipo, titulo, descricao, prioridade, responsavel_id, membro_principal_id, etapas } = req.body;
            
            await connection.beginTransaction();
            
            // Criar processo
            const [result] = await connection.query(
                `INSERT INTO processos (igreja_id, tipo, titulo, descricao, prioridade, responsavel_id, membro_principal_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [igrejaId, tipo, titulo, descricao, prioridade || 'MEDIA', responsavel_id, membro_principal_id]
            );
            
            const processoId = (result as any).insertId;
            
            // Criar etapas
            if (etapas && etapas.length > 0) {
                for (let i = 0; i < etapas.length; i++) {
                    await connection.query(
                        `INSERT INTO processo_etapas (processo_id, ordem, titulo, descricao, tipo)
                         VALUES (?, ?, ?, ?, ?)`,
                        [processoId, i + 1, etapas[i].titulo, etapas[i].descricao, etapas[i].tipo || 'OUTRO']
                    );
                }
            }
            
            await connection.commit();
            
            return res.status(201).json({
                message: 'Processo criado!',
                id: processoId
            });
        } catch (error) {
            await connection.rollback();
            return res.status(500).json({ error: 'Erro ao criar processo' });
        } finally {
            connection.release();
        }
    }
    
    async atualizarEtapa(req: Request, res: Response) {
        try {
            const { etapaId } = req.params;
            const { status, observacoes } = req.body;
            const usuarioId = req.usuario!.id;
            
            await pool.query(
                `UPDATE processo_etapas 
                 SET status = ?, observacoes = ?, data_conclusao = NOW(), concluido_por = ?
                 WHERE id = ?`,
                [status, observacoes, usuarioId, etapaId]
            );
            
            return res.json({ message: 'Etapa atualizada!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar etapa' });
        }
    }
    
    async adicionarDocumento(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            const { tipo, titulo, url_arquivo, etapa_id } = req.body;
            
            const [result] = await pool.query(
                `INSERT INTO documentos (igreja_id, processo_id, etapa_id, tipo, titulo, url_arquivo)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [igrejaId, id, etapa_id, tipo || 'OUTRO', titulo, url_arquivo]
            );
            
            return res.status(201).json({
                message: 'Documento adicionado!',
                id: (result as any).insertId
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao adicionar documento' });
        }
    }
}