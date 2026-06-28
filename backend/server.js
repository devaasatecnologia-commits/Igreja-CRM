const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor Igreja-CRM rodando na porta ${PORT}`);
    console.log(`📌 http://localhost:${PORT}`);
    console.log(`📌 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
