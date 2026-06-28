import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router } from './routes/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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
        timestamp: new Date().toISOString()
    });
});

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