const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fixPassword() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'igreja_crm'
    });

    // Gerar nova senha hash para 'admin123'
    const senha = 'admin123';
    const hash = bcrypt.hashSync(senha, 10);
    console.log('✅ Nova senha hash gerada:', hash);

    // Atualizar usuários
    await connection.execute(
        'UPDATE usuarios SET senha = ? WHERE email = ?',
        [hash, 'admin@igreja.com']
    );
    await connection.execute(
        'UPDATE usuarios SET senha = ? WHERE email = ?',
        [hash, 'admin@aasatecnologia.com.br']
    );

    console.log('✅ Senhas atualizadas para: admin123');

    // Verificar
    const [rows] = await connection.execute(
        'SELECT id, email, senha FROM usuarios'
    );
    console.table(rows);

    await connection.end();
}

fixPassword().catch(console.error);
