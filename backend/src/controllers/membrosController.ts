import { Request, Response } from 'express';
import pool from '../config/database';

export const listar = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM membros WHERE ativo = 1');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Erro ao listar membros:', error);
        res.status(500).json({ success: false, message: 'Erro ao listar membros' });
    }
};

export const criar = async (req: Request, res: Response) => {
    try {
        const { nome, email, telefone, data_nascimento, endereco, cargo } = req.body;
        const [result] = await pool.query(
            'INSERT INTO membros (nome, email, telefone, data_nascimento, endereco, cargo, ativo) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [nome, email, telefone, data_nascimento, endereco, cargo || 'Membro']
        );
        res.status(201).json({ success: true, data: { id: (result as any).insertId } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao criar membro' });
    }
};

export const atualizar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nome, email, telefone, data_nascimento, endereco, cargo } = req.body;
        await pool.query(
            'UPDATE membros SET nome=?, email=?, telefone=?, data_nascimento=?, endereco=?, cargo=? WHERE id=?',
            [nome, email, telefone, data_nascimento, endereco, cargo, id]
        );
        res.json({ success: true, message: 'Membro atualizado' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao atualizar membro' });
    }
};

export const deletar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE membros SET ativo = 0 WHERE id = ?', [id]);
        res.json({ success: true, message: 'Membro removido' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao remover membro' });
    }
};
