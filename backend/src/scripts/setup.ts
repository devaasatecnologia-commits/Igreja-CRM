import pool from '../config/database';
import { hashPassword } from '../utils/jwt';

async function setup() {
    console.log('🔧 Iniciando configuração inicial...\n');

    try {
        // 1. Criar Super Admin
        const senhaSuper = await hashPassword('admin123');
        
        const [superExists]: any = await pool.query(
            'SELECT id FROM super_admin WHERE email = ?',
            ['admin@aasatecnologia.com.br']
        );
        
        if (superExists.length === 0) {
            await pool.query(
                'INSERT INTO super_admin (nome, email, senha) VALUES (?, ?, ?)',
                ['AASA Tecnologia', 'admin@aasatecnologia.com.br', senhaSuper]
            );
            console.log('✅ Super Admin criado!');
        } else {
            await pool.query(
                'UPDATE super_admin SET senha = ? WHERE email = ?',
                [senhaSuper, 'admin@aasatecnologia.com.br']
            );
            console.log('✅ Senha do Super Admin atualizada!');
        }

        // 2. Criar usuário admin para igreja demo
        const senhaAdmin = await hashPassword('admin123');
        
        const [igreja]: any = await pool.query(
            "SELECT id FROM igrejas WHERE codigo = 'ELSHADAY'"
        );
        
        if (igreja.length > 0) {
            const igrejaId = igreja[0].id;
            
            const [userExists]: any = await pool.query(
                'SELECT id FROM usuarios WHERE email = ? AND igreja_id = ?',
                ['admin@igreja.com', igrejaId]
            );
            
            if (userExists.length === 0) {
                await pool.query(
                    'INSERT INTO usuarios (igreja_id, nome, email, senha, nivel) VALUES (?, ?, ?, ?, ?)',
                    [igrejaId, 'Administrador', 'admin@igreja.com', senhaAdmin, 'ADMIN_MASTER']
                );
                console.log('✅ Admin da igreja criado!');
            } else {
                await pool.query(
                    'UPDATE usuarios SET senha = ?, nivel = ? WHERE email = ? AND igreja_id = ?',
                    [senhaAdmin, 'ADMIN_MASTER', 'admin@igreja.com', igrejaId]
                );
                console.log('✅ Senha do admin atualizada!');
            }
        }

        console.log('\n📋 CREDENCIAIS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👑 SUPER ADMIN:');
        console.log('   Email: admin@aasatecnologia.com.br');
        console.log('   Senha: admin123');
        console.log('');
        console.log('⛪ IGREJA DEMO:');
        console.log('   Email: admin@igreja.com');
        console.log('   Senha: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n✅ SETUP CONCLUÍDO!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro no setup:', error);
        process.exit(1);
    }
}

setup();