import { Request, Response } from 'express';
import pool from '../config/database';

export class ModulosController {
    async listarModulos(req: Request, res: Response) {
        try {
            const { igrejaId } = req.params;
            
            // Buscar módulos da igreja
            const [rows] = await pool.query(
                `SELECT id, nome, icone, ativo, ordem 
                 FROM modulos 
                 WHERE igreja_id = ? OR igreja_id IS NULL 
                 ORDER BY ordem ASC`,
                [igrejaId]
            );
            
            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Erro ao listar módulos:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao carregar módulos'
            });
        }
    }

    async atualizarModulos(req: Request, res: Response) {
        try {
            const { igrejaId } = req.params;
            const { modulos } = req.body;
            
            // Atualizar módulos da igreja
            for (const modulo of modulos) {
                await pool.query(
                    `UPDATE modulos SET 
                        ativo = ?, 
                        ordem = ? 
                     WHERE id = ? AND igreja_id = ?`,
                    [modulo.ativo, modulo.ordem, modulo.id, igrejaId]
                );
            }
            
            res.json({
                success: true,
                message: 'Módulos atualizados com sucesso!'
            });
        } catch (error) {
            console.error('Erro ao atualizar módulos:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar módulos'
            });
        }
    }
}
