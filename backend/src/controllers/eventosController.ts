import { Request, Response } from 'express';
import pool from '../config/database';

export const listar = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM eventos ORDER BY data_inicio DESC'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Erro ao listar eventos:', error);
        res.status(500).json({ success: false, message: 'Erro ao listar eventos' });
    }
};

export const criar = async (req: Request, res: Response) => {
    try {
        const { titulo, descricao, data_inicio, data_fim, local, tipo, cor } = req.body;
        const [result] = await pool.query(
            'INSERT INTO eventos (titulo, descricao, data_inicio, data_fim, local, tipo, cor) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [titulo, descricao, data_inicio, data_fim, local, tipo, cor || '#1a237e']
        );
        res.status(201).json({ success: true, data: { id: (result as any).insertId } });
    } catch (error) {
        console.error('Erro ao criar evento:', error);
        res.status(500).json({ success: false, message: 'Erro ao criar evento' });
    }
};

export const atualizar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { titulo, descricao, data_inicio, data_fim, local, tipo, cor } = req.body;
        await pool.query(
            'UPDATE eventos SET titulo=?, descricao=?, data_inicio=?, data_fim=?, local=?, tipo=?, cor=? WHERE id=?',
            [titulo, descricao, data_inicio, data_fim, local, tipo, cor, id]
        );
        res.json({ success: true, message: 'Evento atualizado' });
    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar evento' });
    }
};

export const deletar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM eventos WHERE id = ?', [id]);
        res.json({ success: true, message: 'Evento removido' });
    } catch (error) {
        console.error('Erro ao deletar evento:', error);
        res.status(500).json({ success: false, message: 'Erro ao remover evento' });
    }
};
