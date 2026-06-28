-- Banco de Dados: igreja_crm
CREATE DATABASE IF NOT EXISTS igreja_crm;
USE igreja_crm;

-- Tabela: igrejas
CREATE TABLE IF NOT EXISTS igrejas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    endereco TEXT,
    logo VARCHAR(255),
    cor_primaria VARCHAR(7) DEFAULT '#1a237e',
    cor_secundaria VARCHAR(7) DEFAULT '#283593',
    cor_destaque VARCHAR(7) DEFAULT '#f59e0b',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    igreja_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'super_admin', 'usuario') DEFAULT 'usuario',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE
);

-- Inserir igreja padrão
INSERT INTO igrejas (nome, slug, email) 
VALUES ('Igreja Demo', 'igreja-demo', 'admin@igreja.com');

-- Inserir admin
INSERT INTO usuarios (igreja_id, nome, email, senha, tipo) 
VALUES (1, 'Admin', 'admin@igreja.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.Z3HjvXG4zN5xQY4xQY4xQY4xQY4', 'admin');

-- Inserir super admin
INSERT INTO usuarios (igreja_id, nome, email, senha, tipo) 
VALUES (1, 'Super Admin', 'admin@aasatecnologia.com.br', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.Z3HjvXG4zN5xQY4xQY4xQY4xQY4', 'super_admin');

-- Tabela: membros
CREATE TABLE IF NOT EXISTS membros (
    id INT PRIMARY KEY AUTO_INCREMENT,
    igreja_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    data_nascimento DATE,
    endereco TEXT,
    cargo VARCHAR(50),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE
);

-- Inserir membros de exemplo
INSERT INTO membros (igreja_id, nome, email, telefone, cargo) VALUES
(1, 'João Silva', 'joao@igreja.com', '(11) 99999-9999', 'Pastor'),
(1, 'Maria Santos', 'maria@igreja.com', '(11) 98888-8888', 'Líder de Louvor'),
(1, 'Pedro Oliveira', 'pedro@igreja.com', '(11) 97777-7777', 'Diácono');
