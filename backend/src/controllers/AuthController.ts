import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Configuração do banco
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'igreja_crm',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const JWT_SECRET = process.env.JWT_SECRET || 'igreja_crm_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }

        // Buscar usuário no banco
        const [rows] = await pool.query(
            `SELECT u.*, i.nome as igreja_nome, i.cor_primaria, i.cor_secundaria 
             FROM usuarios u 
             JOIN igrejas i ON u.igreja_id = i.id 
             WHERE u.email = ?`,
            [email]
        );

        const users = rows as any[];
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        const user = users[0];

        // Verificar senha
        const senhaValida = bcrypt.compareSync(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({
                success: false,
                message: 'Senha incorreta'
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                nome: user.nome,
                tipo: user.tipo,
                igreja_id: user.igreja_id
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Retornar dados
        return res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                token,
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                    tipo: user.tipo,
                    igreja_id: user.igreja_id
                },
                igreja: {
                    id: user.igreja_id,
                    nome: user.igreja_nome || 'Igreja',
                    cor_primaria: user.cor_primaria || '#1a237e',
                    cor_secundaria: user.cor_secundaria || '#283593',
                    cor_destaque: '#f59e0b'
                }
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno no servidor',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
};

// Registrar nova igreja
export const register = async (req: Request, res: Response) => {
    try {
        const { nome, email, senha, telefone, endereco } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Nome, email e senha são obrigatórios'
            });
        }

        // Verificar se já existe
        const [existing] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if ((existing as any[]).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email já cadastrado'
            });
        }

        // Gerar slug
        const slug = nome.toLowerCase().replace(/[^a-z0-9]/g, '-');

        // Hash da senha
        const senhaHash = bcrypt.hashSync(senha, 10);

        // Inserir igreja
        const [igrejaResult] = await pool.query(
            'INSERT INTO igrejas (nome, slug, email, telefone, endereco) VALUES (?, ?, ?, ?, ?)',
            [nome, slug, email, telefone || null, endereco || null]
        );
        const igrejaId = (igrejaResult as any).insertId;

        // Inserir usuário admin
        await pool.query(
            'INSERT INTO usuarios (igreja_id, nome, email, senha, tipo, ativo) VALUES (?, ?, ?, ?, ?, ?)',
            [igrejaId, 'Admin', email, senhaHash, 'admin', 1]
        );

        return res.status(201).json({
            success: true,
            message: 'Igreja cadastrada com sucesso!',
            data: {
                igreja_id: igrejaId,
                nome,
                email
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno no servidor'
        });
    }
};

// Verificar token
export const verifyToken = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token não fornecido'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        return res.json({
            success: true,
            message: 'Token válido',
            data: decoded
        });

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
};
