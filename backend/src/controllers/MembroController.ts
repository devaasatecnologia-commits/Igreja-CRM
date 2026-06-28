import { Request, Response } from 'express';
import pool from '../config/database';
import { generateToken } from '../utils/jwt';

export class MembroController {
    
    async listar(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { busca, status, tipo, pagina = '1', limite = '20' } = req.query;
            
            let sql = 'SELECT * FROM membros WHERE igreja_id = ?';
            const params: any[] = [igrejaId];
            
            if (status) {
                sql += ' AND status = ?';
                params.push(status);
            }
            if (tipo) {
                sql += ' AND tipo_membro = ?';
                params.push(tipo);
            }
            if (busca) {
                sql += ' AND (nome LIKE ? OR email LIKE ? OR cpf LIKE ? OR celular LIKE ?)';
                const termo = `%${busca}%`;
                params.push(termo, termo, termo, termo);
            }
            
            sql += ' ORDER BY nome ASC';
            
            const page = parseInt(pagina as string);
            const limit = parseInt(limite as string);
            const offset = (page - 1) * limit;
            
            sql += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);
            
            const [membros] = await pool.query(sql, params);
            const [total] = await pool.query(
                'SELECT COUNT(*) as total FROM membros WHERE igreja_id = ?',
                [igrejaId]
            );
            
            return res.json({
                membros,
                total: (total as any)[0].total,
                pagina: page
            });
        } catch (error) {
            console.error('Erro ao listar membros:', error);
            return res.status(500).json({ error: 'Erro ao listar membros' });
        }
    }
    
    async buscarPorId(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            
            const [membros] = await pool.query(
                `SELECT m.*, f.nome as familia_nome
                 FROM membros m
                 LEFT JOIN familias f ON m.familia_id = f.id
                 WHERE m.id = ? AND m.igreja_id = ?`,
                [id, igrejaId]
            );
            
            if ((membros as any[]).length === 0) {
                return res.status(404).json({ error: 'Membro não encontrado' });
            }
            
            const membro = (membros as any)[0];
            
            // Buscar ministérios
            const [ministerios] = await pool.query(
                `SELECT mm.*, m.nome as ministerio_nome
                 FROM ministerios_membros mm
                 JOIN ministerios m ON mm.ministerio_id = m.id
                 WHERE mm.membro_id = ?`,
                [id]
            );
            
            // Buscar cursos
            const [cursos] = await pool.query(
                `SELECT mc.*, c.nome as curso_nome
                 FROM membros_cursos mc
                 JOIN cursos c ON mc.curso_id = c.id
                 WHERE mc.membro_id = ?`,
                [id]
            );
            
            return res.json({ ...membro, ministerios, cursos });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar membro' });
        }
    }
    
    async criar(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const dados = req.body;
            
            // Gerar código
            const codigo = `MBR${Date.now()}`;
            
            const [result] = await pool.query(
                `INSERT INTO membros (igreja_id, codigo, nome, email, telefone, celular,
                 data_nascimento, sexo, estado_civil, profissao, cpf, rg,
                 cep, logradouro, numero, complemento, bairro, cidade, estado,
                 tipo_membro, observacoes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    igrejaId, codigo,
                    dados.nome, dados.email, dados.telefone, dados.celular,
                    dados.data_nascimento, dados.sexo, dados.estado_civil, dados.profissao,
                    dados.cpf, dados.rg,
                    dados.cep, dados.logradouro, dados.numero, dados.complemento,
                    dados.bairro, dados.cidade, dados.estado,
                    dados.tipo_membro || 'VISITANTE', dados.observacoes
                ]
            );
            
            return res.status(201).json({
                message: 'Membro cadastrado!',
                id: (result as any).insertId,
                codigo
            });
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'CPF ou email já cadastrado' });
            }
            return res.status(500).json({ error: 'Erro ao cadastrar membro' });
        }
    }
    
    async atualizar(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            
            const [result] = await pool.query(
                'UPDATE membros SET ? WHERE id = ? AND igreja_id = ?',
                [req.body, id, igrejaId]
            );
            
            if ((result as any).affectedRows === 0) {
                return res.status(404).json({ error: 'Membro não encontrado' });
            }
            
            return res.json({ message: 'Membro atualizado!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar' });
        }
    }
    
    async excluir(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            
            await pool.query(
                "UPDATE membros SET status = 'INATIVO' WHERE id = ? AND igreja_id = ?",
                [id, igrejaId]
            );
            
            return res.json({ message: 'Membro desativado!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao desativar' });
        }
    }
    
    async estatisticas(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            
            const [total] = await pool.query('SELECT COUNT(*) as total FROM membros WHERE igreja_id = ?', [igrejaId]);
            const [ativos] = await pool.query("SELECT COUNT(*) as total FROM membros WHERE igreja_id = ? AND status = 'ATIVO'", [igrejaId]);
            const [porTipo] = await pool.query('SELECT tipo_membro, COUNT(*) as total FROM membros WHERE igreja_id = ? GROUP BY tipo_membro', [igrejaId]);
            const [porSexo] = await pool.query('SELECT sexo, COUNT(*) as total FROM membros WHERE igreja_id = ? GROUP BY sexo', [igrejaId]);
            
            return res.json({
                total: (total as any)[0].total,
                ativos: (ativos as any)[0].total,
                porTipo,
                porSexo
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro nas estatísticas' });
        }
    }
    // Login do membro (rota pública)
async loginMembro(req: Request, res: Response) {
    try {
        const { cpf, data_nascimento } = req.body;
        
        if (!cpf || !data_nascimento) {
            return res.status(400).json({ error: 'CPF e data de nascimento são obrigatórios' });
        }
        
        // Remover pontuação do CPF
        const cpfLimpo = cpf.replace(/\D/g, '');
        
        const [membros] = await pool.query(
            `SELECT id, nome, email, celular, cpf, data_nascimento, tipo_membro, status, foto_url,
                    igreja_id, data_batismo, data_conversao, data_membro_desde
             FROM membros 
             WHERE REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), '/', '') = ? 
             AND data_nascimento = ? 
             AND status = 'ATIVO'`,
            [cpfLimpo, data_nascimento]
        );
        
        if ((membros as any[]).length === 0) {
            return res.status(401).json({ error: 'CPF ou data de nascimento inválidos' });
        }
        
        const membro = (membros as any)[0];
        
        // Gerar token simples para o membro
        const token = generateToken({
            id: membro.id,
            email: membro.email || `membro${membro.id}@igreja.com`,
            nivel: 'MEMBRO',
            igreja_id: membro.igreja_id
        });
        
        return res.json({ token, membro });
    } catch (error) {
        console.error('Erro no login do membro:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
}
}