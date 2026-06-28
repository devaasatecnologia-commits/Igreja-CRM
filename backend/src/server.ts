import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do banco de dados
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

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de saúde da API
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'API Igreja-CRM - AASA SAGRADO está rodando! 🚀',
        version: '3.0.0',
        endpoints: {
            auth: '/api/auth',
            membros: '/api/membros',
            eventos: '/api/eventos',
            financeiro: '/api/financeiro'
        }
    });
});

// Rota de teste
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando perfeitamente!',
        timestamp: new Date().toISOString()
    });
});

// Rota de teste do banco
app.get('/api/db-test', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        res.json({
            success: true,
            message: 'Banco de dados conectado!',
            result: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao conectar ao banco',
            error: error.message
        });
    }
});

// Rota para listar usuários (teste)
app.get('/api/usuarios', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, nome, email, tipo FROM usuarios LIMIT 10');
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar usuários',
            error: error.message
        });
    }
});

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`🚀 CRM Igreja 3.0 API`);
    console.log(`📡 http://localhost:${PORT}`);
    console.log(`📝 http://localhost:${PORT}/api`);
    console.log(`✅ MySQL conectado!`);
});

// Tratamento de erros
server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Porta ${PORT} já está em uso. Tente outra porta.`);
        process.exit(1);
    } else {
        console.error('❌ Erro no servidor:', error);
    }
});

export default app;
