import { Request, Response } from 'express';
import pool from '../config/database';

export class MinisterioController {
    
    async listar(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            
            const [ministerios] = await pool.query(
                `SELECT m.*, 
                    (SELECT COUNT(*) FROM ministerios_membros WHERE ministerio_id = m.id) as total_membros
                 FROM ministerios m
                 WHERE m.igreja_id = ? AND m.status = 'ATIVO'
                 ORDER BY m.nome`,
                [igrejaId]
            );
            
            return res.json(ministerios);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar ministérios' });
        }
    }
    
    async buscarPorId(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            
            const [ministerios] = await pool.query(
                'SELECT * FROM ministerios WHERE id = ? AND igreja_id = ?',
                [id, igrejaId]
            );
            
            if ((ministerios as any[]).length === 0) {
                return res.status(404).json({ error: 'Ministério não encontrado' });
            }
            
            // Buscar membros
            const [membros] = await pool.query(
                `SELECT mm.*, m.nome, m.foto_url, m.celular
                 FROM ministerios_membros mm
                 JOIN membros m ON mm.membro_id = m.id
                 WHERE mm.ministerio_id = ?
                 ORDER BY mm.funcao, m.nome`,
                [id]
            );
            
            return res.json({ ...(ministerios as any)[0], membros });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar ministério' });
        }
    }
    
    async criar(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { nome, descricao, cor, icone, dia_reuniao, horario, local } = req.body;
            
            const [result] = await pool.query(
                `INSERT INTO ministerios (igreja_id, nome, descricao, cor, icone, dia_reuniao, horario, local)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [igrejaId, nome, descricao, cor || '#6366f1', icone || '🕊️', dia_reuniao, horario, local]
            );
            
            return res.status(201).json({
                message: 'Ministério criado!',
                id: (result as any).insertId
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar ministério' });
        }
    }
    
    async atualizar(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            
            await pool.query(
                'UPDATE ministerios SET ? WHERE id = ? AND igreja_id = ?',
                [req.body, id, igrejaId]
            );
            
            return res.json({ message: 'Ministério atualizado!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar' });
        }
    }
    
    async adicionarMembro(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            const { membro_id, funcao } = req.body;
            
            // Verificar se ministério pertence à igreja
            const [min] = await pool.query(
                'SELECT id FROM ministerios WHERE id = ? AND igreja_id = ?',
                [id, igrejaId]
            );
            
            if ((min as any[]).length === 0) {
                return res.status(404).json({ error: 'Ministério não encontrado' });
            }
            
            await pool.query(
                `INSERT INTO ministerios_membros (ministerio_id, membro_id, funcao)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE funcao = ?`,
                [id, membro_id, funcao || 'MEMBRO', funcao || 'MEMBRO']
            );
            
            return res.json({ message: 'Membro adicionado ao ministério!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao adicionar membro' });
        }
    }
    
    async removerMembro(req: Request, res: Response) {
        try {
            const { id, membroId } = req.params;
            
            await pool.query(
                'DELETE FROM ministerios_membros WHERE ministerio_id = ? AND membro_id = ?',
                [id, membroId]
            );
            
            return res.json({ message: 'Membro removido do ministério!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao remover membro' });
        }
    }
}