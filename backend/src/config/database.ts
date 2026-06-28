import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'igreja_crm',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// Testar conexão
pool.getConnection()
    .then(conn => {
        console.log('✅ MySQL conectado!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Erro MySQL:', err.message);
    });

export default pool;