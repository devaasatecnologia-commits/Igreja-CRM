import { Request, Response } from 'express';
import pool from '../config/database';

export const getDoacoes = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(
            'SELECT d.*, m.nome as membro_nome FROM doacoes d LEFT JOIN membros m ON d.membro_id = m.id ORDER BY d.data_doacao DESC'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar doações' });
    }
};

export const createDoacao = async (req: Request, res: Response) => {
    try {
        const { membro_id, valor, data_doacao, forma_pagamento, descricao } = req.body;
        const [result] = await pool.query(
            'INSERT INTO doacoes (membro_id, valor, data_doacao, forma_pagamento, descricao) VALUES (?, ?, ?, ?, ?)',
            [membro_id || null, valor, data_doacao, forma_pagamento || null, descricao || null]
        );
        res.status(201).json({ success: true, data: { id: (result as any).insertId } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao criar doação' });
    }
};

export const updateDoacao = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { membro_id, valor, data_doacao, forma_pagamento, descricao } = req.body;
        await pool.query(
            'UPDATE doacoes SET membro_id=?, valor=?, data_doacao=?, forma_pagamento=?, descricao=? WHERE id=?',
            [membro_id, valor, data_doacao, forma_pagamento, descricao, id]
        );
        res.json({ success: true, message: 'Doação atualizada' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao atualizar doação' });
    }
};

export const deleteDoacao = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM doacoes WHERE id = ?', [id]);
        res.json({ success: true, message: 'Doação removida' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao remover doação' });
    }
};
