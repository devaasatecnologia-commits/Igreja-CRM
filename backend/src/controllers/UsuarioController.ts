import { Request, Response } from 'express';
import pool from '../config/database';
import { generateToken, hashPassword, comparePassword } from '../utils/jwt';

export class UsuarioController {
async login(req: Request, res: Response) {
    try {
        const { email, senha } = req.body;

        const [rows]: any = await pool.query(
            'SELECT * FROM usuarios WHERE email = ? AND status = ?',
            [email, 'ATIVO']
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        const usuario = rows[0];
        const senhaValida = await comparePassword(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        // Atualizar último acesso
        await pool.query(
            'UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?',
            [usuario.id]
        );

        const token = generateToken({
            id: usuario.id,
            email: usuario.email,
            nivel: usuario.nivel,
            igreja_id: usuario.igreja_id  // ⬅️ ADICIONADO
        });

        return res.json({
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                nivel: usuario.nivel,
                igreja_id: usuario.igreja_id  // ⬅️ ADICIONADO
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

    async registrar(req: Request, res: Response) {
        try {
            const { nome, email, senha } = req.body;

            // Verificar se email já existe
            const [existente]: any = await pool.query(
                'SELECT id FROM usuarios WHERE email = ?',
                [email]
            );

            if (existente.length > 0) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }

            const senhaHash = await hashPassword(senha);

            await pool.query(
                'INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)',
                [nome, email, senhaHash, 'VISUALIZADOR']
            );

            return res.status(201).json({ message: 'Usuário criado com sucesso' });
        } catch (error) {
            console.error('Erro no registro:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getPerfil(req: Request, res: Response) {
        try {
            const usuario = (req as any).usuario;
            
            const [rows]: any = await pool.query(
                'SELECT id, nome, email, nivel, ultimo_acesso FROM usuarios WHERE id = ?',
                [usuario.id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            return res.json(rows[0]);
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}