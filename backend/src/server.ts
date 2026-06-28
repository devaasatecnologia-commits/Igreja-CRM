import express from 'express';
import cors from 'cors';
<<<<<<< HEAD
import dotenv from 'dotenv';
import { router } from './routes/index';

=======
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente
>>>>>>> 9e13619899ddb940e0fbd90656e44c18539d5d9c
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

<<<<<<< HEAD
// Middlewares globais
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'));

// Rotas
app.use('/api', router);

// Rota de health check
app.get('/', (req, res) => {
    res.json({
        name: 'CRM Igreja 3.0 API',
        version: '3.0.0',
        status: 'online',
=======
// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de saúde da API
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'API Igreja-CRM está rodando! 🚀',
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
>>>>>>> 9e13619899ddb940e0fbd90656e44c18539d5d9c
        timestamp: new Date().toISOString()
    });
});

<<<<<<< HEAD
// Tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Erro:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log('🚀 CRM Igreja 3.0 API');
    console.log(`📡 http://localhost:${PORT}`);
    console.log(`📝 http://localhost:${PORT}/api`);
});
=======
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor Igreja-CRM rodando na porta ${PORT}`);
    console.log(`📌 http://localhost:${PORT}`);
    console.log(`📌 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
>>>>>>> 9e13619899ddb940e0fbd90656e44c18539d5d9c
