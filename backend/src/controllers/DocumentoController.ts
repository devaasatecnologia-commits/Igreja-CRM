import { Request, Response } from 'express';
import pool from '../config/database';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

export class DocumentoController {
    
    async listar(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { tipo, membro_id } = req.query;
            
            let sql = `
                SELECT d.*, m.nome as membro_nome
                FROM documentos d
                LEFT JOIN membros m ON d.membro_id = m.id
                WHERE d.igreja_id = ?
            `;
            const params: any[] = [igrejaId];
            
            if (tipo) { sql += ' AND d.tipo = ?'; params.push(tipo); }
            if (membro_id) { sql += ' AND d.membro_id = ?'; params.push(membro_id); }
            
            sql += ' ORDER BY d.data_emissao DESC LIMIT 50';
            
            const [documentos] = await pool.query(sql, params);
            return res.json(documentos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar documentos' });
        }
    }
    
    async gerarCarteirinha(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { membro_id } = req.body;
            
            // Buscar membro
            const [membros] = await pool.query(
                'SELECT * FROM membros WHERE id = ? AND igreja_id = ?',
                [membro_id, igrejaId]
            );
            
            if ((membros as any[]).length === 0) {
                return res.status(404).json({ error: 'Membro não encontrado' });
            }
            
            const membro = (membros as any)[0];
            const codigo = `CRT${Date.now()}`;
            const dataValidade = new Date();
            dataValidade.setFullYear(dataValidade.getFullYear() + 2);
            
            // Gerar QR Code
            const qrData = JSON.stringify({ codigo, nome: membro.nome, id: membro.id });
            const qrCodeUrl = await QRCode.toDataURL(qrData);
            
            // Salvar no banco
            const [result] = await pool.query(
                `INSERT INTO documentos 
                 (igreja_id, membro_id, tipo, titulo, codigo_validacao, qr_code_url, data_validade, status)
                 VALUES (?, ?, 'CARTEIRINHA', ?, ?, ?, ?, 'GERADO')`,
                [igrejaId, membro_id, `Carteirinha - ${membro.nome}`, codigo, qrCodeUrl, dataValidade]
            );
            
            return res.status(201).json({
                message: 'Carteirinha gerada!',
                id: (result as any).insertId,
                codigo,
                qr_code: qrCodeUrl
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao gerar carteirinha' });
        }
    }
    
    async gerarCertificado(req: Request, res: Response) {
        try {
            const igrejaId = req.usuario!.igreja_id;
            const { membro_id, tipo, descricao, data_evento } = req.body;
            
            const [membros] = await pool.query(
                'SELECT * FROM membros WHERE id = ? AND igreja_id = ?',
                [membro_id, igrejaId]
            );
            
            if ((membros as any[]).length === 0) {
                return res.status(404).json({ error: 'Membro não encontrado' });
            }
            
            const membro = (membros as any)[0];
            const codigo = `CERT${Date.now()}`;
            
            const [result] = await pool.query(
                `INSERT INTO documentos 
                 (igreja_id, membro_id, tipo, titulo, descricao, codigo_validacao, data_evento, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'GERADO')`,
                [igrejaId, membro_id, `CERTIFICADO_${tipo}`, `Certificado de ${tipo} - ${membro.nome}`,
                 descricao, codigo, data_evento]
            );
            
            return res.status(201).json({
                message: 'Certificado gerado!',
                id: (result as any).insertId,
                codigo
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao gerar certificado' });
        }
    }
    
    async imprimirCarteirinha(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const [docs] = await pool.query(
                `SELECT d.*, m.nome, m.cpf, m.foto_url, i.nome as igreja_nome, i.logo_url
                 FROM documentos d
                 JOIN membros m ON d.membro_id = m.id
                 JOIN igrejas i ON d.igreja_id = i.id
                 WHERE d.id = ?`,
                [id]
            );
            
            if ((docs as any[]).length === 0) {
                return res.status(404).json({ error: 'Documento não encontrado' });
            }
            
            const doc = (docs as any)[0];
            
            // Gerar PDF
            const pdf = new PDFDocument({ size: [204, 321], margin: 0 });
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=carteirinha_${doc.membro_id}.pdf`);
            
            pdf.pipe(res);
            
            // Fundo
            pdf.rect(0, 0, 204, 321).fill('#1e3a5f');
            pdf.rect(3, 3, 198, 315).lineWidth(1).stroke('#c8960c');
            
            // Nome da igreja
            pdf.fontSize(12).fill('#c8960c').text(doc.igreja_nome || 'IGREJA', 5, 10, { width: 194, align: 'center' });
            pdf.fontSize(8).fill('#ffffff').text('CARTEIRA DE MEMBRO', 5, 25, { width: 194, align: 'center' });
            
            // Foto (placeholder)
            pdf.rect(62, 40, 80, 90).fill('#3f51b5');
            pdf.fontSize(7).fill('#ffffff').text('FOTO', 62, 80, { width: 80, align: 'center' });
            
            // Nome
            pdf.fontSize(11).fill('#ffffff').text(doc.nome, 5, 140, { width: 194, align: 'center' });
            
            // CPF
            if (doc.cpf) {
                pdf.fontSize(7).fill('#c8960c').text(`CPF: ${doc.cpf}`, 5, 158, { width: 194, align: 'center' });
            }
            
            // QR Code
            if (doc.qr_code_url) {
                const qrBuffer = Buffer.from(doc.qr_code_url.split(',')[1], 'base64');
                pdf.image(qrBuffer, 67, 172, { width: 70, height: 70 });
            }
            
            // Validade
            pdf.fontSize(6).fill('#c8960c').text(
                `Válido até: ${new Date(doc.data_validade).toLocaleDateString('pt-BR')}`,
                5, 248, { width: 194, align: 'center' }
            );
            
            // Código
            pdf.fontSize(5).fill('#999999').text(doc.codigo_validacao, 5, 305, { width: 194, align: 'center' });
            
            pdf.end();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao gerar PDF' });
        }
    }
    
    async imprimirCertificado(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const [docs] = await pool.query(
                `SELECT d.*, m.nome, i.nome as igreja_nome, i.logo_url
                 FROM documentos d
                 JOIN membros m ON d.membro_id = m.id
                 JOIN igrejas i ON d.igreja_id = i.id
                 WHERE d.id = ?`,
                [id]
            );
            
            if ((docs as any[]).length === 0) {
                return res.status(404).json({ error: 'Documento não encontrado' });
            }
            
            const doc = (docs as any)[0];
            
            const pdf = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=certificado_${doc.membro_id}.pdf`);
            
            pdf.pipe(res);
            
            // Borda decorativa
            pdf.rect(20, 20, pdf.page.width - 40, pdf.page.height - 40).lineWidth(3).stroke('#1e3a5f');
            pdf.rect(25, 25, pdf.page.width - 50, pdf.page.height - 50).lineWidth(1).stroke('#c8960c');
            
            // Título
            pdf.fontSize(28).fill('#1e3a5f').text('CERTIFICADO', 50, 80, {
                width: pdf.page.width - 100, align: 'center'
            });
            
            // Conteúdo
            pdf.fontSize(16).fill('#333').text(
                `Certificamos que ${doc.nome} ${doc.descricao || 'recebe este certificado'}.`,
                80, 160, { width: pdf.page.width - 160, align: 'center', lineGap: 8 }
            );
            
            // Data
            if (doc.data_evento) {
                pdf.fontSize(12).fill('#666').text(
                    `Data: ${new Date(doc.data_evento).toLocaleDateString('pt-BR')}`,
                    { width: pdf.page.width - 100, align: 'center' }
                );
            }
            
            // Assinatura
            pdf.moveTo(150, 350).lineTo(350, 350).stroke('#333');
            pdf.fontSize(10).text('Pastor Presidente', 150, 360, { width: 200, align: 'center' });
            
            // Código de validação
            pdf.fontSize(8).fill('#999').text(
                `Código: ${doc.codigo_validacao}`,
                50, 400, { width: pdf.page.width - 100, align: 'center' }
            );
            
            pdf.end();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao gerar PDF' });
        }
    }
    
    async validar(req: Request, res: Response) {
        try {
            const { codigo } = req.params;
            
            const [docs] = await pool.query(
                `SELECT d.*, m.nome as membro_nome
                 FROM documentos d
                 JOIN membros m ON d.membro_id = m.id
                 WHERE d.codigo_validacao = ?`,
                [codigo]
            );
            
            if ((docs as any[]).length === 0) {
                return res.status(404).json({ valido: false, error: 'Documento não encontrado' });
            }
            
            const doc = (docs as any)[0];
            const hoje = new Date();
            const validade = doc.data_validade ? new Date(doc.data_validade) : null;
            
            return res.json({
                valido: !validade || hoje <= validade,
                tipo: doc.tipo,
                membro: doc.membro_nome,
                data_emissao: doc.data_emissao,
                data_validade: doc.data_validade,
                vencido: validade ? hoje > validade : false
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao validar' });
        }
    }
}