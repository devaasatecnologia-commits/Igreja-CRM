import { Request, Response } from 'express';
import pool from '../config/database';

export const getFinanceiro = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM financeiro ORDER BY data_lancamento DESC'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao buscar financeiro' });
    }
};

export const createFinanceiro = async (req: Request, res: Response) => {
    try {
        const { descricao, tipo, categoria, valor, data_lancamento, forma_pagamento, status } = req.body;
        const [result] = await pool.query(
            'INSERT INTO financeiro (descricao, tipo, categoria, valor, data_lancamento, forma_pagamento, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [descricao, tipo, categoria, valor, data_lancamento, forma_pagamento, status || 'pendente']
        );
        res.status(201).json({ success: true, data: { id: (result as any).insertId } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao criar lançamento' });
    }
};

export const updateFinanceiro = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { descricao, tipo, categoria, valor, data_lancamento, forma_pagamento, status } = req.body;
        await pool.query(
            'UPDATE financeiro SET descricao=?, tipo=?, categoria=?, valor=?, data_lancamento=?, forma_pagamento=?, status=? WHERE id=?',
            [descricao, tipo, categoria, valor, data_lancamento, forma_pagamento, status, id]
        );
        res.json({ success: true, message: 'Lançamento atualizado' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao atualizar lançamento' });
    }
};

export const deleteFinanceiro = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM financeiro WHERE id = ?', [id]);
        res.json({ success: true, message: 'Lançamento removido' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao remover lançamento' });
    }
};
