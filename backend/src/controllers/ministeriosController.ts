import { Request, Response } from 'express';
import pool from '../config/database';

export const listar = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM ministerios ORDER BY nome'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Erro ao listar ministérios:', error);
        res.status(500).json({ success: false, message: 'Erro ao listar ministérios' });
    }
};

export const criar = async (req: Request, res: Response) => {
    try {
        const { nome, descricao, cor } = req.body;
        const [result] = await pool.query(
            'INSERT INTO ministerios (nome, descricao, cor) VALUES (?, ?, ?)',
            [nome, descricao, cor || '#1a237e']
        );
        res.status(201).json({ success: true, data: { id: (result as any).insertId } });
    } catch (error) {
        console.error('Erro ao criar ministério:', error);
        res.status(500).json({ success: false, message: 'Erro ao criar ministério' });
    }
};

export const atualizar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nome, descricao, cor } = req.body;
        await pool.query(
            'UPDATE ministerios SET nome=?, descricao=?, cor=? WHERE id=?',
            [nome, descricao, cor, id]
        );
        res.json({ success: true, message: 'Ministério atualizado' });
    } catch (error) {
        console.error('Erro ao atualizar ministério:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar ministério' });
    }
};

export const deletar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM ministerios WHERE id = ?', [id]);
        res.json({ success: true, message: 'Ministério removido' });
    } catch (error) {
        console.error('Erro ao deletar ministério:', error);
        res.status(500).json({ success: false, message: 'Erro ao remover ministério' });
    }
};
