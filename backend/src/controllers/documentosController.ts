import { Request, Response } from 'express';
import pool from '../config/database';

export const listar = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(
            'SELECT d.*, m.nome as membro_nome FROM documentos d LEFT JOIN membros m ON d.membro_id = m.id ORDER BY d.created_at DESC'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Erro ao listar documentos:', error);
        res.status(500).json({ success: false, message: 'Erro ao listar documentos' });
    }
};

export const criar = async (req: Request, res: Response) => {
    try {
        const { membro_id, tipo, titulo, conteudo, dados_personalizados } = req.body;
        const [result] = await pool.query(
            'INSERT INTO documentos (membro_id, tipo, titulo, conteudo, dados_personalizados) VALUES (?, ?, ?, ?, ?)',
            [membro_id || null, tipo, titulo, conteudo || '', JSON.stringify(dados_personalizados || {})]
        );
        res.status(201).json({ success: true, data: { id: (result as any).insertId } });
    } catch (error) {
        console.error('Erro ao criar documento:', error);
        res.status(500).json({ success: false, message: 'Erro ao criar documento' });
    }
};

export const atualizar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { titulo, conteudo, dados_personalizados } = req.body;
        await pool.query(
            'UPDATE documentos SET titulo=?, conteudo=?, dados_personalizados=? WHERE id=?',
            [titulo, conteudo, JSON.stringify(dados_personalizados || {}), id]
        );
        res.json({ success: true, message: 'Documento atualizado' });
    } catch (error) {
        console.error('Erro ao atualizar documento:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar documento' });
    }
};

export const deletar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM documentos WHERE id = ?', [id]);
        res.json({ success: true, message: 'Documento removido' });
    } catch (error) {
        console.error('Erro ao deletar documento:', error);
        res.status(500).json({ success: false, message: 'Erro ao remover documento' });
    }
};
