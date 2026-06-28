import { Request, Response } from 'express';
import pool from '../config/database';

export class IgrejaController {
    
    // Buscar dados da igreja logada
    async minhaIgreja(req: Request, res: Response) {
        try {
            const igrejaId = (req as any).usuario.igreja_id || 1;
            
            const [igrejas] = await pool.query(
                'SELECT * FROM igrejas WHERE id = ?',
                [igrejaId]
            );
            
            if ((igrejas as any[]).length === 0) {
                return res.status(404).json({ error: 'Igreja não encontrada' });
            }
            
            return res.json((igrejas as any)[0]);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar igreja' });
        }
    }
    
    // Atualizar personalização
    async atualizarPersonalizacao(req: Request, res: Response) {
        try {
            const igrejaId = (req as any).usuario.igreja_id || 1;
            const { cor_primaria, cor_secundaria, logo_url, nome } = req.body;
            
            await pool.query(
                `UPDATE igrejas SET 
                 cor_primaria = COALESCE(?, cor_primaria),
                 cor_secundaria = COALESCE(?, cor_secundaria),
                 logo_url = COALESCE(?, logo_url),
                 nome = COALESCE(?, nome)
                 WHERE id = ?`,
                [cor_primaria, cor_secundaria, logo_url, nome, igrejaId]
            );
            
            return res.json({ message: 'Personalização atualizada!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar' });
        }
    }
    
    // SUPER ADMIN - Listar todas as igrejas
    async listarTodas(req: Request, res: Response) {
        try {
            const [igrejas] = await pool.query(
                `SELECT i.*, 
                    (SELECT COUNT(*) FROM membros WHERE igreja_id = i.id) as total_membros,
                    (SELECT COUNT(*) FROM usuarios WHERE igreja_id = i.id) as total_usuarios
                 FROM igrejas i 
                 ORDER BY i.criado_em DESC`
            );
            
            return res.json(igrejas);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar igrejas' });
        }
    }
    
    // SUPER ADMIN - Atualizar plano da igreja
    async atualizarPlano(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { plano, status, max_membros, max_usuarios } = req.body;
            
            await pool.query(
                `UPDATE igrejas SET 
                 plano = COALESCE(?, plano),
                 status = COALESCE(?, status),
                 max_membros = COALESCE(?, max_membros),
                 max_usuarios = COALESCE(?, max_usuarios)
                 WHERE id = ?`,
                [plano, status, max_membros, max_usuarios, id]
            );
            
            return res.json({ message: 'Igreja atualizada!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar' });
        }
    }

    async getModulos(req: Request, res: Response) {
    try {
        const igrejaId = req.usuario!.igreja_id;
        const [igrejas] = await pool.query(
            'SELECT modulos_liberados, plano FROM igrejas WHERE id = ?',
            [igrejaId]
        );
        
        if ((igrejas as any[]).length === 0) {
            return res.status(404).json({ error: 'Igreja não encontrada' });
        }
        
        const igreja = (igrejas as any)[0];
        let modulos = {};
        
        if (igreja.modulos_liberados) {
            modulos = typeof igreja.modulos_liberados === 'string' 
                ? JSON.parse(igreja.modulos_liberados) 
                : igreja.modulos_liberados;
        }
        
        return res.json({ modulos, plano: igreja.plano });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar módulos' });
    }
}
}