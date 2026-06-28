import { Request, Response } from 'express';
import pool from '../config/database';

export class AgendaController {
    
    // ============ LISTAR EVENTOS ============
    async listar(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { data_inicio, data_fim, tipo, status, visibilidade } = req.query;
            
            let sql = `
                SELECT a.*, m.nome as responsavel_nome,
                    (SELECT COUNT(*) FROM evento_participantes WHERE evento_id = a.id) as total_inscritos,
                    (SELECT COUNT(*) FROM evento_checkins WHERE evento_id = a.id) as total_checkins
                FROM agendamentos a
                LEFT JOIN membros m ON a.responsavel_id = m.id
                WHERE a.igreja_id = ? AND a.status != 'CANCELADO'
            `;
            const params: any[] = [igrejaId];
            
            if (data_inicio) { sql += ' AND a.data_inicio >= ?'; params.push(data_inicio); }
            if (data_fim) { sql += ' AND a.data_fim <= ?'; params.push(data_fim); }
            if (tipo) { sql += ' AND a.tipo = ?'; params.push(tipo); }
            if (status) { sql += ' AND a.status = ?'; params.push(status); }
            if (visibilidade) { sql += ' AND a.visibilidade = ?'; params.push(visibilidade); }
            
            sql += ' ORDER BY a.data_inicio ASC LIMIT 100';
            
            const [eventos] = await pool.query(sql, params);
            return res.json(eventos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar eventos' });
        }
    }
    
    // ============ BUSCAR POR ID ============
    async buscarPorId(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            
            const [eventos] = await pool.query(
                `SELECT a.*, m.nome as responsavel_nome, m.foto_url as responsavel_foto
                 FROM agendamentos a
                 LEFT JOIN membros m ON a.responsavel_id = m.id
                WHERE a.id = ? AND a.igreja_id = ?`,
                [id, igrejaId]
                );
            
            if ((eventos as any[]).length === 0) {
                return res.status(404).json({ error: 'Evento não encontrado' });
            }
            
            // Buscar participantes
            const [participantes] = await pool.query(
                `SELECT ep.*, m.nome, m.foto_url, m.celular
                 FROM evento_participantes ep
                 JOIN membros m ON ep.membro_id = m.id
                WHERE ep.evento_id = ?`,
                [id]
                );
            
            // Buscar check-ins
            const [checkins] = await pool.query(
                `SELECT ec.*, m.nome
                 FROM evento_checkins ec
                 JOIN membros m ON ec.membro_id = m.id
                WHERE ec.evento_id = ?`,
                [id]
                );
            
            // Buscar ata (se houver)
            const [atas] = await pool.query(
                'SELECT * FROM evento_atas WHERE evento_id = ? ORDER BY criado_em DESC LIMIT 1',
                [id]
                );
            
            return res.json({ 
                ...(eventos as any)[0], 
                participantes, 
                checkins,
                ata: (atas as any[]).length > 0 ? (atas as any)[0] : null
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar evento' });
        }
    }
    
    // ============ CRIAR EVENTO ============
    async criar(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const {
                titulo, descricao, material, data_inicio, data_fim, tipo,
                local_evento, sala, cor, responsavel_id, capacidade,
                visibilidade, requer_inscricao, valor_inscricao,
                transmicao_ao_vivo, url_transmissao,
                recorrente, frequencia, intervalo, data_fim_recorrencia
            } = req.body;
            
            if (!titulo || !data_inicio || !data_fim) {
                return res.status(400).json({ error: 'Campos obrigatórios: titulo, data_inicio, data_fim' });
            }
            
            const ids = [];
            
            if (recorrente && frequencia) {
                const dataInicio = new Date(data_inicio);
                const dataFim = new Date(data_fim);
                const duracao = dataFim.getTime() - dataInicio.getTime();
                const dataLimite = data_fim_recorrencia ? new Date(data_fim_recorrencia) : new Date(dataInicio.getFullYear(), 11, 31);
                let dataAtual = new Date(dataInicio);
                
                while (dataAtual <= dataLimite) {
                    const fimEvento = new Date(dataAtual.getTime() + duracao);
                    
                    const [result] = await pool.query(
                        `INSERT INTO agendamentos 
     (igreja_id, titulo, descricao, material, data_inicio, data_fim, tipo, 
      local_evento, sala, cor, responsavel_id, capacidade,
      visibilidade, requer_inscricao, valor_inscricao,
      transmicao_ao_vivo, url_transmissao, criado_por)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [igrejaId, titulo, descricao, material, data_inicio, data_fim, tipo || 'OUTRO',
                           local_evento, sala, cor || '#3788d8', responsavel_id, capacidade,
                           visibilidade || 'PUBLICO', requer_inscricao || false, valor_inscricao || 0,
                           transmicao_ao_vivo || false, url_transmissao, usuarioId] 
                           );
                    ids.push((result as any).insertId);
                    
                    switch (frequencia) {
                    case 'DIARIA': dataAtual.setDate(dataAtual.getDate() + (intervalo || 1)); break;
                    case 'SEMANAL': dataAtual.setDate(dataAtual.getDate() + (7 * (intervalo || 1))); break;
                    case 'MENSAL': dataAtual.setMonth(dataAtual.getMonth() + (intervalo || 1)); break;
                    case 'ANUAL': dataAtual.setFullYear(dataAtual.getFullYear() + (intervalo || 1)); break;
                    default: dataAtual = new Date(dataLimite.getTime() + 1);
                    }
                }
            } else {
                const [result] = await pool.query(
                    `INSERT INTO agendamentos 
                     (igreja_id, titulo, descricao, material, data_inicio, data_fim, tipo, 
                      local_evento, sala, cor, responsavel_id, capacidade,
                      visibilidade, requer_inscricao, valor_inscricao,
                      transmicao_ao_vivo, url_transmissao)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [igrejaId, titulo, descricao, material, data_inicio, data_fim, tipo || 'OUTRO',
                       local_evento, sala, cor || '#3788d8', responsavel_id, capacidade,
                       visibilidade || 'PUBLICO', requer_inscricao || false, valor_inscricao || 0,
                       transmicao_ao_vivo || false, url_transmissao]
                       );
                ids.push((result as any).insertId);
            }
            
            return res.status(201).json({
                message: ids.length > 1 ? `${ids.length} eventos criados!` : 'Evento criado!',
                ids
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao criar evento' });
        }
    }
    
    // ============ ATUALIZAR EVENTO ============
    async atualizar(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            
            const [result] = await pool.query(
                'UPDATE agendamentos SET ? WHERE id = ? AND igreja_id = ?',
                [req.body, id, igrejaId]
                );
            
            if ((result as any).affectedRows === 0) {
                return res.status(404).json({ error: 'Evento não encontrado' });
            }
            
            return res.json({ message: 'Evento atualizado!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar' });
        }
    }
    
    // ============ ALTERAR STATUS ============
    async alterarStatus(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            const { status } = req.body;
            
            await pool.query(
                'UPDATE agendamentos SET status = ? WHERE id = ? AND igreja_id = ?',
                [status, id, igrejaId]
                );
            
            return res.json({ message: `Evento ${status.toLowerCase()}!` });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao alterar status' });
        }
    }
    
    // ============ CONFIRMAR PRESENÇA ============
    async confirmarPresenca(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { membro_id } = req.body;
            
            await pool.query(
                `INSERT INTO evento_participantes (evento_id, membro_id, status)
                 VALUES (?, ?, 'CONFIRMADO')
                ON DUPLICATE KEY UPDATE status = 'CONFIRMADO'`,
                [id, membro_id]
                );
            
            return res.json({ message: 'Presença confirmada! 🙏' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao confirmar' });
        }
    }
    
    // ============ CHECK-IN ============
    async checkin(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { membro_id, metodo } = req.body;
            
            await pool.query(
                `INSERT INTO evento_checkins (evento_id, membro_id, metodo)
                 VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE metodo = ?`,
                [id, membro_id, metodo || 'MANUAL', metodo || 'MANUAL']
                );
            
            // Atualizar presença
            await pool.query(
                `UPDATE evento_participantes SET status = 'PRESENTE', checkin_realizado = NOW()
                WHERE evento_id = ? AND membro_id = ?`,
                [id, membro_id]
                );
            
            return res.json({ message: 'Check-in realizado! ✅' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro no check-in' });
        }
    }
    
    // ============ EXCLUIR EVENTO ============
    async excluir(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { id } = req.params;
            
            await pool.query(
                'DELETE FROM agendamentos WHERE id = ? AND igreja_id = ?',
                [id, igrejaId]
                );
            
            return res.json({ message: 'Evento excluído!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao excluir' });
        }
    }
    
    // ============ PRÓXIMOS EVENTOS ============
    async proximos(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario?.igreja_id || 1;
            const limite = req.query.limite || 10;
            
            const [eventos] = await pool.query(
                `SELECT a.*, m.nome as responsavel_nome
                 FROM agendamentos a
                 LEFT JOIN membros m ON a.responsavel_id = m.id
                 WHERE a.igreja_id = ? AND a.data_inicio >= NOW()
                 AND a.status != 'CANCELADO' AND a.visibilidade = 'PUBLICO'
                 ORDER BY a.data_inicio ASC
                LIMIT ?`,
                [igrejaId, parseInt(limite as string)]
                );
            
            return res.json(eventos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar próximos' });
        }
    }
    
    // ============ SALVAR ATA ============
    async salvarAta(req: Request, res: Response) {
        try {
            const { evento_id, titulo, conteudo, participantes, decisoes } = req.body;
            const usuarioId = req.usuario!.id;
            
            const [result] = await pool.query(
                `INSERT INTO evento_atas (evento_id, titulo, conteudo, participantes, decisoes, criado_por)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [evento_id, titulo, conteudo, JSON.stringify(participantes), JSON.stringify(decisoes), usuarioId]
                );
            
            return res.status(201).json({ message: 'Ata salva!', id: (result as any).insertId });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao salvar ata' });
        }
    }
}