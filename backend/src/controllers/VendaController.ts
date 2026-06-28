import { Request, Response } from 'express';
import pool from '../config/database';

export class VendaController {
    
    // Produtos
    async listarProdutos(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { busca, status } = req.query;
            
            let sql = 'SELECT * FROM produtos WHERE igreja_id = ?';
            const params: any[] = [igrejaId];
            
            if (status) { sql += ' AND status = ?'; params.push(status); }
            if (busca) { sql += ' AND (nome LIKE ? OR codigo LIKE ?)'; params.push(`%${busca}%`, `%${busca}%`); }
            
            sql += ' ORDER BY nome';
            
            const [produtos] = await pool.query(sql, params);
            return res.json(produtos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar produtos' });
        }
    }
    
    async criarProduto(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { nome, descricao, preco_venda, preco_custo, estoque_atual, categoria } = req.body;
            
            const codigo = `PRD${Date.now()}`;
            
            const [result] = await pool.query(
                `INSERT INTO produtos (igreja_id, codigo, nome, descricao, preco_venda, preco_custo, estoque_atual, categoria)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [igrejaId, codigo, nome, descricao, preco_venda, preco_custo || 0, estoque_atual || 0, categoria || 'GERAL']
            );
            
            return res.status(201).json({ message: 'Produto cadastrado!', id: (result as any).insertId, codigo });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar produto' });
        }
    }
    
    // Vendas
    async listarVendas(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            
            const [vendas] = await pool.query(
                `SELECT v.*, m.nome as membro_nome
                 FROM vendas v
                 LEFT JOIN membros m ON v.membro_id = m.id
                 WHERE v.igreja_id = ?
                 ORDER BY v.data DESC LIMIT 50`,
                [igrejaId]
            );
            
            return res.json(vendas);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar vendas' });
        }
    }
    
    async criarVenda(req: Request, res: Response) {
        const connection = await pool.getConnection();
        
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { membro_id, desconto = 0, itens, pagamentos } = req.body;
            
            if (!itens || itens.length === 0) {
                return res.status(400).json({ error: 'Adicione pelo menos 1 item' });
            }
            
            await connection.beginTransaction();
            
            // Calcular total
            let total = 0;
            for (const item of itens) {
                const [produto] = await connection.query(
                    'SELECT * FROM produtos WHERE id = ? AND igreja_id = ? AND status = "ATIVO"',
                    [item.produto_id, igrejaId]
                );
                
                if ((produto as any[]).length === 0) {
                    await connection.rollback();
                    return res.status(400).json({ error: `Produto ID ${item.produto_id} não encontrado` });
                }
                
                const prod = (produto as any)[0];
                
                if (prod.estoque_atual < item.quantidade) {
                    await connection.rollback();
                    return res.status(400).json({ 
                        error: `Estoque insuficiente para "${prod.nome}". Disponível: ${prod.estoque_atual}` 
                    });
                }
                
                item.valor_unitario = prod.preco_venda;
                item.total = prod.preco_venda * item.quantidade;
                total += item.total;
            }
            
            total -= desconto || 0;
            
            const numero = `VD${Date.now()}`;
            
            const [resultVenda] = await connection.query(
                `INSERT INTO vendas (igreja_id, numero, total, desconto, membro_id)
                 VALUES (?, ?, ?, ?, ?)`,
                [igrejaId, numero, total, desconto || 0, membro_id || null]
            );
            
            const vendaId = (resultVenda as any).insertId;
            
            // Inserir itens e baixar estoque
            for (const item of itens) {
                await connection.query(
                    `INSERT INTO itens_venda (venda_id, produto_id, quantidade, valor_unitario, total)
                     VALUES (?, ?, ?, ?, ?)`,
                    [vendaId, item.produto_id, item.quantidade, item.valor_unitario, item.total]
                );
                
                await connection.query(
                    'UPDATE produtos SET estoque_atual = estoque_atual - ? WHERE id = ?',
                    [item.quantidade, item.produto_id]
                );
            }
            
            // Pagamento
            if (pagamentos && pagamentos.length > 0) {
                await connection.query(
                    "UPDATE vendas SET status = 'PAGO' WHERE id = ?",
                    [vendaId]
                );
                
                // Criar lançamento financeiro
                await connection.query(
                    `INSERT INTO lancamentos_financeiros 
                     (igreja_id, tipo, descricao, valor, data_vencimento, data_pagamento, plano_conta_id, forma_pagamento, status)
                     VALUES (?, 'RECEBER', ?, ?, CURDATE(), CURDATE(), 
                        (SELECT id FROM plano_contas WHERE igreja_id = ? AND categoria = 'VENDA' LIMIT 1),
                        ?, 'PAGO')`,
                    [igrejaId, `Venda #${numero}`, total, igrejaId, pagamentos[0].forma_pagamento || 'DINHEIRO']
                );
            }
            
            await connection.commit();
            
            return res.status(201).json({
                message: 'Venda realizada!',
                id: vendaId,
                numero,
                total
            });
        } catch (error) {
            await connection.rollback();
            return res.status(500).json({ error: 'Erro ao criar venda' });
        } finally {
            connection.release();
        }
    }
    
    async cancelarVenda(req: Request, res: Response) {
        const connection = await pool.getConnection();
        
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            
            const [vendas] = await connection.query(
                'SELECT * FROM vendas WHERE id = ? AND igreja_id = ?',
                [id, igrejaId]
            );
            
            if ((vendas as any[]).length === 0) {
                return res.status(404).json({ error: 'Venda não encontrada' });
            }
            
            await connection.beginTransaction();
            
            // Devolver estoque
            const [itens] = await connection.query('SELECT * FROM itens_venda WHERE venda_id = ?', [id]);
            
            for (const item of (itens as any[])) {
                await connection.query(
                    'UPDATE produtos SET estoque_atual = estoque_atual + ? WHERE id = ?',
                    [item.quantidade, item.produto_id]
                );
            }
            
            await connection.query("UPDATE vendas SET status = 'CANCELADO' WHERE id = ?", [id]);
            
            await connection.commit();
            
            return res.json({ message: 'Venda cancelada e estoque devolvido!' });
        } catch (error) {
            await connection.rollback();
            return res.status(500).json({ error: 'Erro ao cancelar' });
        } finally {
            connection.release();
        }
    }
}