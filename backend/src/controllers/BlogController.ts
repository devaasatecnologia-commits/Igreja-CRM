import { Request, Response } from 'express';
import pool from '../config/database';

export class BlogController {
    
    async listarPosts(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { categoria, pagina = '1', limite = '10' } = req.query;
            
            let sql = `
                SELECT p.*, u.nome as autor_nome
                FROM posts p
                LEFT JOIN usuarios u ON p.autor_id = u.id
                WHERE p.igreja_id = ? AND p.status = 'PUBLICADO'
            `;
            const params: any[] = [igrejaId];
            
            if (categoria) { sql += ' AND p.categoria = ?'; params.push(categoria); }
            
            sql += ' ORDER BY p.data_publicacao DESC';
            
            const page = parseInt(pagina as string);
            const limit = parseInt(limite as string);
            sql += ' LIMIT ? OFFSET ?';
            params.push(limit, (page - 1) * limit);
            
            const [posts] = await pool.query(sql, params);
            return res.json(posts);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar posts' });
        }
    }
    
    async buscarPost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const [posts] = await pool.query(
                `SELECT p.*, u.nome as autor_nome
                 FROM posts p
                 LEFT JOIN usuarios u ON p.autor_id = u.id
                 WHERE p.id = ?`,
                [id]
            );
            
            if ((posts as any[]).length === 0) {
                return res.status(404).json({ error: 'Post não encontrado' });
            }
            
            // Incrementar visualizações
            await pool.query('UPDATE posts SET visualizacoes = visualizacoes + 1 WHERE id = ?', [id]);
            
            return res.json((posts as any)[0]);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar post' });
        }
    }
    
    async criarPost(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const usuarioId = req.usuario!.id;
            const { titulo, conteudo, resumo, imagem_url, categoria, tags } = req.body;
            
            const [result] = await pool.query(
                `INSERT INTO posts (igreja_id, titulo, conteudo, resumo, imagem_url, categoria, tags, autor_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [igrejaId, titulo, conteudo, resumo, imagem_url, categoria || 'DEVOCIONAL', JSON.stringify(tags || []), usuarioId]
            );
            
            return res.status(201).json({ message: 'Post criado!', id: (result as any).insertId });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar post' });
        }
    }
    
    // Galeria
    async listarGaleria(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { tipo, evento_id } = req.query;
            
            let sql = 'SELECT * FROM galeria WHERE igreja_id = ?';
            const params: any[] = [igrejaId];
            
            if (tipo) { sql += ' AND tipo = ?'; params.push(tipo); }
            if (evento_id) { sql += ' AND evento_id = ?'; params.push(evento_id); }
            
            sql += ' ORDER BY criado_em DESC LIMIT 50';
            
            const [fotos] = await pool.query(sql, params);
            return res.json(fotos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar galeria' });
        }
    }
    
    async adicionarFoto(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { titulo, descricao, url_arquivo, evento_id, tags } = req.body;
            
            const [result] = await pool.query(
                `INSERT INTO galeria (igreja_id, titulo, descricao, url_arquivo, evento_id, tags, tipo)
                 VALUES (?, ?, ?, ?, ?, ?, 'FOTO')`,
                [igrejaId, titulo, descricao, url_arquivo, evento_id, JSON.stringify(tags || [])]
            );
            
            return res.status(201).json({ message: 'Foto adicionada!', id: (result as any).insertId });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao adicionar foto' });
        }
    }
}