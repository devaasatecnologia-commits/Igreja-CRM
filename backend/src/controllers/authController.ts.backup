import { Request, Response } from 'express';
import pool from '../config/database';
import { generateToken, hashPassword, comparePassword } from '../utils/jwt';

export class AuthController {
    
    // Login de usuário da igreja
    async login(req: Request, res: Response) {
        try {
            const { email, senha } = req.body;
            
            if (!email || !senha) {
                return res.status(400).json({ error: 'Email e senha são obrigatórios' });
            }
            
            const [rows]: any = await pool.query(
                `SELECT u.*, i.nome as igreja_nome, i.cor_primaria, i.cor_secundaria, i.logo_url
                 FROM usuarios u
                 JOIN igrejas i ON u.igreja_id = i.id
                 WHERE u.email = ? AND u.status = 'ATIVO' AND i.status = 'ATIVO'`,
                [email]
            );
            
            if (rows.length === 0) {
                return res.status(401).json({ error: 'Email ou senha incorretos' });
            }
            
            const usuario = rows[0];
            const senhaValida = await comparePassword(senha, usuario.senha);
            
            if (!senhaValida) {
                return res.status(401).json({ error: 'Email ou senha incorretos' });
            }
            
            // Atualizar último acesso
            await pool.query('UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?', [usuario.id]);
            
            const token = generateToken({
                id: usuario.id,
                email: usuario.email,
                nivel: usuario.nivel,
                igreja_id: usuario.igreja_id
            });
            
            return res.json({
                token,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    nivel: usuario.nivel,
                    avatar_url: usuario.avatar_url
                },
                igreja: {
                    id: usuario.igreja_id,
                    nome: usuario.igreja_nome,
                    cor_primaria: usuario.cor_primaria,
                    cor_secundaria: usuario.cor_secundaria,
                    logo_url: usuario.logo_url
                }
            });
        } catch (error) {
            console.error('Erro no login:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    
    // Login do Super Admin
    async loginSuperAdmin(req: Request, res: Response) {
        try {
            const { email, senha } = req.body;
            
            const [rows]: any = await pool.query(
                'SELECT * FROM super_admin WHERE email = ? AND status = "ATIVO"',
                [email]
            );
            
            if (rows.length === 0) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
            
            const admin = rows[0];
            const senhaValida = await comparePassword(senha, admin.senha);
            
            if (!senhaValida) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
            
            await pool.query('UPDATE super_admin SET ultimo_acesso = NOW() WHERE id = ?', [admin.id]);
            
            const token = generateToken({
                id: admin.id,
                email: admin.email,
                nivel: 'SUPER_ADMIN',
                igreja_id: 0,
                is_super_admin: true
            });
            
            return res.json({
                token,
                usuario: {
                    id: admin.id,
                    nome: admin.nome,
                    email: admin.email,
                    nivel: 'SUPER_ADMIN'
                }
            });
        } catch (error) {
            console.error('Erro no login super admin:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    
    // Registrar nova igreja
    async registrarIgreja(req: Request, res: Response) {
        const connection = await pool.getConnection();
        
        try {
            const { igreja, admin } = req.body;
            
            await connection.beginTransaction();
            
            // 1. Criar igreja
            const [resultIgreja]: any = await connection.query(
                `INSERT INTO igrejas (codigo, nome, email, telefone, tipo, plano, 
                 cep, logradouro, numero, bairro, cidade, estado)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    'IGJ' + Date.now(),
                    igreja.nome,
                    igreja.email,
                    igreja.telefone,
                    igreja.tipo || 'INDEPENDENTE',
                    igreja.plano || 'FREE',
                    igreja.cep, igreja.logradouro, igreja.numero,
                    igreja.bairro, igreja.cidade, igreja.estado
                ]
            );
            
            const igrejaId = resultIgreja.insertId;
            
            // 2. Criar usuário admin
            const senhaHash = await hashPassword(admin.senha);
            
            await connection.query(
                `INSERT INTO usuarios (igreja_id, nome, email, senha, nivel)
                 VALUES (?, ?, ?, ?, 'ADMIN_MASTER')`,
                [igrejaId, admin.nome, admin.email, senhaHash]
            );
            
            // 3. Criar plano de contas padrão
            await connection.query(
                `INSERT INTO plano_contas (igreja_id, codigo, nome, tipo, categoria) VALUES
                 (?, '1', 'RECEITAS', 'RECEITA', 'OUTRO'),
                 (?, '1.1', 'Dízimos', 'RECEITA', 'DIZIMO'),
                 (?, '1.2', 'Ofertas', 'RECEITA', 'OFERTA'),
                 (?, '2', 'DESPESAS', 'DESPESA', 'OUTRO'),
                 (?, '2.1', 'Contas', 'DESPESA', 'OUTRO')`,
                [igrejaId, igrejaId, igrejaId, igrejaId, igrejaId]
            );
            
            // 4. Criar ministérios padrão
            await connection.query(
                `INSERT INTO ministerios (igreja_id, nome, descricao, cor, icone) VALUES
                 (?, 'Louvor', 'Ministério de música', '#8b5cf6', '🎵'),
                 (?, 'Oração', 'Intercessão', '#f59e0b', '🙏'),
                 (?, 'Jovens', 'Juventude', '#06b6d4', '🔥')`,
                [igrejaId, igrejaId, igrejaId]
            );
            
            await connection.commit();
            
            return res.status(201).json({
                message: 'Igreja cadastrada com sucesso!',
                igreja_id: igrejaId
            });
        } catch (error: any) {
            await connection.rollback();
            console.error('Erro ao registrar:', error);
            
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }
            
            return res.status(500).json({ error: 'Erro ao cadastrar igreja' });
        } finally {
            connection.release();
        }
    }
    
    // Esqueci senha
    async esqueciSenha(req: Request, res: Response) {
        try {
            const { email } = req.body;
            
            const [rows]: any = await pool.query(
                'SELECT * FROM usuarios WHERE email = ?',
                [email]
            );
            
            if (rows.length === 0) {
                return res.json({ message: 'Se o email existir, um link será enviado' });
            }
            
            // Gerar token de reset
            const token = require('crypto').randomBytes(32).toString('hex');
            const expiracao = new Date();
            expiracao.setHours(expiracao.getHours() + 1);
            
            await pool.query(
                'UPDATE usuarios SET token_reset = ?, token_expiracao = ? WHERE email = ?',
                [token, expiracao, email]
            );
            
            // TODO: Enviar email com link de reset
            
            return res.json({ message: 'Se o email existir, um link será enviado' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro interno' });
        }
    }
}