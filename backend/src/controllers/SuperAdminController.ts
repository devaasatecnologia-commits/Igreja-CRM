import { Request, Response } from 'express';
import pool from '../config/database';
import { hashPassword } from '../utils/jwt';

export class SuperAdminController {
    
    // Listar todas as igrejas
    async listarIgrejas(req: Request, res: Response) {
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
    
    // Detalhes de uma igreja
    async detalhesIgreja(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const [igreja] = await pool.query('SELECT * FROM igrejas WHERE id = ?', [id]);
            
            if ((igreja as any[]).length === 0) {
                return res.status(404).json({ error: 'Igreja não encontrada' });
            }
            
            // Estatísticas
            const [stats] = await pool.query(
                `SELECT 
                    (SELECT COUNT(*) FROM membros WHERE igreja_id = ?) as membros,
                    (SELECT COUNT(*) FROM usuarios WHERE igreja_id = ?) as usuarios,
                    (SELECT COUNT(*) FROM agendamentos WHERE igreja_id = ?) as eventos,
                    (SELECT COUNT(*) FROM lancamentos_financeiros WHERE igreja_id = ?) as transacoes`,
                [id, id, id, id]
            );
            
            return res.json({ igreja: (igreja as any)[0], estatisticas: (stats as any)[0] });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar igreja' });
        }
    }
    
    // Atualizar plano da igreja
    async atualizarPlano(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { plano, status, max_membros, max_usuarios } = req.body;
            
            await pool.query(
                `UPDATE igrejas SET plano = ?, status = ?, max_membros = ?, max_usuarios = ?
                 WHERE id = ?`,
                [plano, status, max_membros, max_usuarios, id]
            );
            
            return res.json({ message: 'Igreja atualizada!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar' });
        }
    }
    
    // Criar Super Admin
    async criarSuperAdmin(req: Request, res: Response) {
        try {
            const { nome, email, senha } = req.body;
            const senhaHash = await hashPassword(senha);
            
            await pool.query(
                'INSERT INTO super_admin (nome, email, senha) VALUES (?, ?, ?)',
                [nome, email, senhaHash]
            );
            
            return res.status(201).json({ message: 'Super Admin criado!' });
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }
            return res.status(500).json({ error: 'Erro ao criar' });
        }
    }
    
    // Dashboard do Super Admin
    async dashboard(req: Request, res: Response) {
        try {
            const [totalIgrejas] = await pool.query('SELECT COUNT(*) as total FROM igrejas');
            const [igrejasAtivas] = await pool.query("SELECT COUNT(*) as total FROM igrejas WHERE status = 'ATIVO'");
            const [totalMembros] = await pool.query('SELECT COUNT(*) as total FROM membros');
            const [faturamento] = await pool.query(
                `SELECT COALESCE(SUM(valor), 0) as total FROM assinaturas WHERE status = 'ATIVA'`
            );
            
            return res.json({
                total_igrejas: (totalIgrejas as any)[0].total,
                igrejas_ativas: (igrejasAtivas as any)[0].total,
                total_membros: (totalMembros as any)[0].total,
                faturamento_mensal: (faturamento as any)[0].total
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro no dashboard' });
        }
    }
}