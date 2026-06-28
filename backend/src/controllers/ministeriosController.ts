import { Request, Response } from 'express';
import pool from '../config/database';

export const getMinisterios = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(
            'SELECT m.*, u.nome as lider_nome FROM ministerios m LEFT JOIN usuarios u ON m.lider_id = u.id'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar ministérios' });
    }
};

export const createMinisterio = async (req: Request, res: Response) => {
    try {
        const { nome, descricao, lider_id, cor } = req.body;
        const [result] = await pool.query(
            'INSERT INTO ministerios (nome, descricao, lider_id, cor) VALUES (?, ?, ?, ?)',
            [nome, descricao, lider_id || null, cor || '#1a237e']
        );
        res.status(201).json({ success: true, data: { id: (result as any).insertId } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao criar ministério' });
    }
};

export const updateMinisterio = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nome, descricao, lider_id, cor } = req.body;
        await pool.query(
            'UPDATE ministerios SET nome=?, descricao=?, lider_id=?, cor=? WHERE id=?',
            [nome, descricao, lider_id, cor, id]
        );
        res.json({ success: true, message: 'Ministério atualizado' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao atualizar ministério' });
    }
};

export const deleteMinisterio = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM ministerios WHERE id = ?', [id]);
        res.json({ success: true, message: 'Ministério removido' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao remover ministério' });
    }
};
