import pool from '../config/database';
import { hashPassword } from '../utils/jwt';

async function createAdmin() {
    try {
        const senhaHash = await hashPassword('admin123');
        
        await pool.query(`
            INSERT INTO usuarios (nome, email, senha, nivel) 
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE senha = VALUES(senha)
        `, ['Administrador', 'admin@igreja.com', senhaHash, 'ADMIN']);
        
        console.log('✅ Usuário admin criado com sucesso!');
        console.log('Email: admin@igreja.com');
        console.log('Senha: admin123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar admin:', error);
        process.exit(1);
    }
}

createAdmin();