USE igreja_crm;

-- Tabela: eventos
CREATE TABLE IF NOT EXISTS eventos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    igreja_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME,
    local VARCHAR(100),
    tipo VARCHAR(50),
    cor VARCHAR(7) DEFAULT '#1a237e',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE
);

-- Tabela: doacoes
CREATE TABLE IF NOT EXISTS doacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    igreja_id INT NOT NULL,
    membro_id INT,
    valor DECIMAL(10,2) NOT NULL,
    data_doacao DATE NOT NULL,
    forma_pagamento VARCHAR(50),
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    FOREIGN KEY (membro_id) REFERENCES membros(id) ON DELETE SET NULL
);

-- Tabela: financeiro
CREATE TABLE IF NOT EXISTS financeiro (
    id INT PRIMARY KEY AUTO_INCREMENT,
    igreja_id INT NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    tipo ENUM('receita', 'despesa') NOT NULL,
    categoria VARCHAR(50),
    valor DECIMAL(10,2) NOT NULL,
    data_lancamento DATE NOT NULL,
    forma_pagamento VARCHAR(50),
    status ENUM('pendente', 'pago', 'cancelado') DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE
);

-- Tabela: ministerios
CREATE TABLE IF NOT EXISTS ministerios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    igreja_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    lider_id INT,
    cor VARCHAR(7) DEFAULT '#1a237e',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    FOREIGN KEY (lider_id) REFERENCES membros(id) ON DELETE SET NULL
);

-- Tabela: configuracoes
CREATE TABLE IF NOT EXISTS configuracoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    igreja_id INT NOT NULL,
    chave VARCHAR(50) UNIQUE NOT NULL,
    valor TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE
);

-- Inserir dados de exemplo
INSERT INTO ministerios (igreja_id, nome, descricao) VALUES
(1, 'Louvor', 'Ministério de música e adoração'),
(1, 'Ensino', 'Ministério de ensino e discipulado'),
(1, 'Ação Social', 'Ministério de projetos sociais');

INSERT INTO configuracoes (igreja_id, chave, valor) VALUES
(1, 'tema_principal', '#1a237e'),
(1, 'versiculo_dia', 'João 3:16');

SELECT '✅ Tabelas criadas com sucesso!' as Mensagem;
SHOW TABLES;
