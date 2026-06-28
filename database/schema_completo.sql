<<<<<<< HEAD
-- ============================================
-- CRM IGREJA 3.0 - SCHEMA COMPLETO
-- Versão: 3.0
-- Data: 19/05/2026
-- Desenvolvedor: AASA Tecnologia
-- ============================================

DROP DATABASE IF EXISTS igreja_crm;
CREATE DATABASE igreja_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE igreja_crm;

-- ============================================
-- 1. SUPER ADMIN (Fornecedor/AASA)
-- ============================================
CREATE TABLE super_admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    status ENUM('ATIVO', 'INATIVO') DEFAULT 'ATIVO',
    ultimo_acesso TIMESTAMP NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 2. IGREJAS (Multi-Tenant)
-- ============================================
CREATE TABLE igrejas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    razao_social VARCHAR(200),
    cnpj VARCHAR(18) UNIQUE,
    email VARCHAR(150),
    telefone VARCHAR(20),
    site VARCHAR(200),
    matriz_id INT NULL,
    tipo ENUM('MATRIZ', 'FILIAL', 'INDEPENDENTE') DEFAULT 'INDEPENDENTE',
    cep VARCHAR(10),
    logradouro VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    cor_primaria VARCHAR(7) DEFAULT '#1e3a5f',
    cor_secundaria VARCHAR(7) DEFAULT '#c8960c',
    cor_terciaria VARCHAR(7) DEFAULT '#f8f6f0',
    modulos_liberados JSON,
    plano ENUM('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE') DEFAULT 'FREE',
    status ENUM('ATIVO', 'INATIVO', 'BLOQUEADO', 'TRIAL') DEFAULT 'TRIAL',
    data_expiracao_trial DATE,
    max_membros INT DEFAULT 50,
    max_usuarios INT DEFAULT 2,
    max_armazenamento_mb INT DEFAULT 100,
    config_json JSON,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (matriz_id) REFERENCES igrejas(id) ON DELETE SET NULL,
    INDEX idx_codigo (codigo),
    INDEX idx_status (status),
    INDEX idx_matriz (matriz_id)
) ENGINE=InnoDB;

-- ============================================
-- 3. USUÁRIOS DO SISTEMA
-- ============================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivel ENUM('ADMIN_MASTER', 'ADMIN', 'SECRETARIA', 'FINANCEIRO', 'LIDER', 'MEMBRO') DEFAULT 'MEMBRO',
    status ENUM('ATIVO', 'INATIVO', 'BLOQUEADO') DEFAULT 'ATIVO',
    avatar_url VARCHAR(500),
    ultimo_acesso TIMESTAMP NULL,
    token_reset VARCHAR(255),
    token_expiracao TIMESTAMP NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    UNIQUE KEY uk_email_igreja (email, igreja_id),
    INDEX idx_nivel (nivel)
) ENGINE=InnoDB;

-- ============================================
-- 4. FAMÍLIAS
-- ============================================
CREATE TABLE familias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    nome VARCHAR(200) NOT NULL,
    endereco_completo VARCHAR(500),
    telefone_principal VARCHAR(20),
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 5. MEMBROS
-- ============================================
CREATE TABLE membros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    codigo VARCHAR(20) UNIQUE,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(150),
    telefone VARCHAR(20),
    celular VARCHAR(20),
    data_nascimento DATE,
    sexo ENUM('MASCULINO', 'FEMININO') DEFAULT 'MASCULINO',
    estado_civil ENUM('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO') DEFAULT 'SOLTEIRO',
    profissao VARCHAR(100),
    cep VARCHAR(10),
    logradouro VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    foto_url VARCHAR(500),
    data_conversao DATE,
    data_batismo DATE,
    data_batismo_espirito_santo DATE,
    data_membro_desde DATE DEFAULT (CURRENT_DATE),
    familia_id INT,
    parentesco_familia VARCHAR(50),
    status ENUM('ATIVO', 'INATIVO', 'TRANSFERIDO', 'FALECIDO', 'VISITANTE') DEFAULT 'ATIVO',
    tipo_membro ENUM('VISITANTE', 'CONGREGADO', 'MEMBRO', 'LIDER', 'DIACONO', 'PRESBITERO', 'EVANGELISTA', 'PASTOR', 'BISPO') DEFAULT 'VISITANTE',
    observacoes TEXT,
    tags JSON,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE SET NULL,
    INDEX idx_nome (nome),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_tipo (tipo_membro)
) ENGINE=InnoDB;

-- ============================================
-- 6. MINISTÉRIOS
-- ============================================
CREATE TABLE ministerios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#6366f1',
    icone VARCHAR(10) DEFAULT '🕊️',
    dia_reuniao VARCHAR(20),
    horario TIME,
    local VARCHAR(200),
    status ENUM('ATIVO', 'INATIVO') DEFAULT 'ATIVO',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ministerios_membros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ministerio_id INT NOT NULL,
    membro_id INT NOT NULL,
    funcao ENUM('LIDER', 'VICE_LIDER', 'SECRETARIO', 'TESOUREIRO', 'MEMBRO') DEFAULT 'MEMBRO',
    data_entrada DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (ministerio_id) REFERENCES ministerios(id) ON DELETE CASCADE,
    FOREIGN KEY (membro_id) REFERENCES membros(id) ON DELETE CASCADE,
    UNIQUE KEY uk_min_membro (ministerio_id, membro_id)
) ENGINE=InnoDB;

-- ============================================
-- 7. CURSOS
-- ============================================
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    carga_horaria INT,
    tipo ENUM('BATISMO', 'CASAMENTO', 'LIDERANCA', 'TEOLOGIA', 'MINISTERIAL', 'OUTRO') DEFAULT 'OUTRO',
    status ENUM('ATIVO', 'INATIVO') DEFAULT 'ATIVO',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE membros_cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    membro_id INT NOT NULL,
    curso_id INT NOT NULL,
    data_inicio DATE DEFAULT (CURRENT_DATE),
    data_conclusao DATE,
    nota DECIMAL(4,2),
    status ENUM('CURSANDO', 'CONCLUIDO', 'DESISTENTE') DEFAULT 'CURSANDO',
    certificado_gerado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (membro_id) REFERENCES membros(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    UNIQUE KEY uk_membro_curso (membro_id, curso_id)
) ENGINE=InnoDB;

-- ============================================
-- 8. PROCESSOS (WORKFLOW)
-- ============================================
CREATE TABLE processos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    tipo ENUM('CASAMENTO', 'BATISMO', 'MEMBRESIA', 'CONSAGRACAO', 'TRANSFERENCIA', 'CURSO', 'OUTRO') NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    status ENUM('ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO', 'CONCLUIDO', 'CANCELADO', 'ARQUIVADO') DEFAULT 'ABERTO',
    prioridade ENUM('BAIXA', 'MEDIA', 'ALTA', 'URGENTE') DEFAULT 'MEDIA',
    responsavel_id INT,
    membro_principal_id INT,
    data_inicio DATE DEFAULT (CURRENT_DATE),
    data_conclusao DATE,
    dados_json JSON,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (membro_principal_id) REFERENCES membros(id) ON DELETE SET NULL,
    INDEX idx_tipo (tipo),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE processo_etapas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    processo_id INT NOT NULL,
    ordem INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    tipo ENUM('DOCUMENTO', 'AGENDAMENTO', 'ASSINATURA', 'APROVACAO', 'PAGAMENTO', 'REUNIAO', 'OUTRO') DEFAULT 'OUTRO',
    status ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'PENDENCIA', 'CANCELADO') DEFAULT 'PENDENTE',
    data_conclusao DATETIME,
    concluido_por INT,
    observacoes TEXT,
    FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE CASCADE,
    FOREIGN KEY (concluido_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_processo (processo_id)
) ENGINE=InnoDB;

-- ============================================
-- 9. DOCUMENTOS E ASSINATURAS
-- ============================================
CREATE TABLE documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    processo_id INT,
    etapa_id INT,
    membro_id INT,
    tipo ENUM('CARTEIRINHA', 'CERTIFICADO_BATISMO', 'CERTIFICADO_CASAMENTO', 'CERTIFICADO_CURSO', 
              'DECLARACAO', 'CARTA_TRANSFERENCIA', 'ATA', 'CONTRATO', 'RG', 'CPF', 
              'CERTIDAO', 'COMPROVANTE', 'FOTO', 'OUTRO') DEFAULT 'OUTRO',
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    url_arquivo VARCHAR(500),
    url_pdf_assinado VARCHAR(500),
    tamanho_bytes BIGINT,
    mimetype VARCHAR(100),
    codigo_validacao VARCHAR(50) UNIQUE,
    qr_code_url VARCHAR(500),
    dados_json JSON,
    status ENUM('GERADO', 'ASSINADO', 'ENTREGUE', 'CANCELADO') DEFAULT 'GERADO',
    data_emissao DATE DEFAULT (CURRENT_DATE),
    data_validade DATE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE SET NULL,
    FOREIGN KEY (etapa_id) REFERENCES processo_etapas(id) ON DELETE SET NULL,
    FOREIGN KEY (membro_id) REFERENCES membros(id) ON DELETE SET NULL,
    INDEX idx_codigo (codigo_validacao),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB;

CREATE TABLE assinaturas_digitais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documento_id INT NOT NULL,
    processo_id INT,
    assinante_tipo ENUM('MEMBRO', 'USUARIO', 'TESTEMUNHA', 'PASTOR', 'SECRETARIO') DEFAULT 'MEMBRO',
    assinante_id INT,
    nome_completo VARCHAR(200) NOT NULL,
    cpf VARCHAR(14),
    assinatura_imagem TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    hash_validacao VARCHAR(64),
    data_assinatura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE,
    FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE SET NULL,
    INDEX idx_documento (documento_id)
) ENGINE=InnoDB;

-- ============================================
-- 10. AGENDA E EVENTOS
-- ============================================
CREATE TABLE agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    tipo ENUM('CULTO', 'REUNIAO', 'CASAMENTO', 'BATISMO', 'EVENTO', 'CURSO', 
              'CIRCULO_ORACAO', 'ENSAIO', 'CONFRATERNIZACAO', 'OUTRO') DEFAULT 'OUTRO',
    status ENUM('AGENDADO', 'CONFIRMADO', 'EM_ANDAMENTO', 'REALIZADO', 'CANCELADO') DEFAULT 'AGENDADO',
    local_evento VARCHAR(300),
    cor VARCHAR(7) DEFAULT '#3788d8',
    responsavel_id INT,
    processo_id INT,
    capacidade INT,
    inscricoes_abertas BOOLEAN DEFAULT FALSE,
    recorrente BOOLEAN DEFAULT FALSE,
    frequencia ENUM('DIARIA', 'SEMANAL', 'MENSAL', 'ANUAL'),
    intervalo INT DEFAULT 1,
    dia_semana INT,
    data_fim_recorrencia DATE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id) REFERENCES membros(id) ON DELETE SET NULL,
    FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE SET NULL,
    INDEX idx_data (data_inicio),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB;

CREATE TABLE evento_participantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evento_id INT NOT NULL,
    membro_id INT NOT NULL,
    status ENUM('CONFIRMADO', 'PRESENTE', 'AUSENTE', 'JUSTIFICADO') DEFAULT 'CONFIRMADO',
    data_confirmacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checkin_realizado TIMESTAMP NULL,
    FOREIGN KEY (evento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (membro_id) REFERENCES membros(id) ON DELETE CASCADE,
    UNIQUE KEY uk_evento_membro (evento_id, membro_id)
) ENGINE=InnoDB;

-- ============================================
-- 11. ATAS
-- ============================================
CREATE TABLE atas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    evento_id INT,
    processo_id INT,
    titulo VARCHAR(200) NOT NULL,
    conteudo LONGTEXT,
    data_reuniao DATETIME NOT NULL,
    local VARCHAR(200),
    presidente VARCHAR(100),
    secretario VARCHAR(100),
    participantes JSON,
    topicos JSON,
    decisoes JSON,
    encaminhamentos JSON,
    status ENUM('RASCUNHO', 'FINALIZADA', 'APROVADA', 'ARQUIVADA') DEFAULT 'RASCUNHO',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    FOREIGN KEY (evento_id) REFERENCES agendamentos(id) ON DELETE SET NULL,
    FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE ata_assinaturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ata_id INT NOT NULL,
    assinante_nome VARCHAR(200) NOT NULL,
    assinante_funcao VARCHAR(100),
    assinatura_imagem TEXT,
    data_assinatura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ata_id) REFERENCES atas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- 12. FINANCEIRO
-- ============================================
CREATE TABLE plano_contas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    nome VARCHAR(200) NOT NULL,
    tipo ENUM('RECEITA', 'DESPESA') NOT NULL,
    categoria ENUM('DIZIMO', 'OFERTA', 'DOACAO', 'CAMPANHA', 'VENDA', 
                   'SALARIO', 'ALUGUEL', 'AGUA', 'LUZ', 'INTERNET', 'MANUTENCAO', 'OUTRO') DEFAULT 'OUTRO',
    parent_id INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES plano_contas(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE lancamentos_financeiros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    tipo ENUM('RECEBER', 'PAGAR') NOT NULL,
    descricao VARCHAR(500) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status ENUM('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO') DEFAULT 'PENDENTE',
    plano_conta_id INT NOT NULL,
    membro_id INT,
    processo_id INT,
    forma_pagamento ENUM('DINHEIRO', 'PIX', 'BOLETO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'TRANSFERENCIA'),
    comprovante_url VARCHAR(500),
    pix_copia_cola TEXT,
    pix_qr_code_url VARCHAR(500),
    pix_txid VARCHAR(100),
    boleto_url VARCHAR(500),
    boleto_codigo_barras VARCHAR(100),
    nosso_numero VARCHAR(50),
    parcela_atual INT DEFAULT 1,
    total_parcelas INT DEFAULT 1,
    lancamento_pai_id INT,
    conciliado BOOLEAN DEFAULT FALSE,
    data_conciliacao DATE,
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    FOREIGN KEY (plano_conta_id) REFERENCES plano_contas(id),
    FOREIGN KEY (membro_id) REFERENCES membros(id) ON DELETE SET NULL,
    FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE SET NULL,
    FOREIGN KEY (lancamento_pai_id) REFERENCES lancamentos_financeiros(id) ON DELETE SET NULL,
    INDEX idx_vencimento (data_vencimento),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- 13. LOJA / VENDAS
-- ============================================
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    preco_venda DECIMAL(10,2) NOT NULL,
    preco_custo DECIMAL(10,2),
    estoque_atual INT DEFAULT 0,
    estoque_minimo INT DEFAULT 10,
    categoria VARCHAR(100),
    imagem_url VARCHAR(500),
    status ENUM('ATIVO', 'INATIVO') DEFAULT 'ATIVO',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE vendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    numero VARCHAR(50) UNIQUE NOT NULL,
    data DATE DEFAULT (CURRENT_DATE),
    total DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    status ENUM('PENDENTE', 'PAGO', 'CANCELADO') DEFAULT 'PENDENTE',
    membro_id INT,
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    FOREIGN KEY (membro_id) REFERENCES membros(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE itens_venda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venda_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
) ENGINE=InnoDB;

-- ============================================
-- 14. BLOG / CONTEÚDO
-- ============================================
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    conteudo LONGTEXT,
    resumo VARCHAR(500),
    imagem_url VARCHAR(500),
    categoria ENUM('DEVOCIONAL', 'ESTUDO', 'EVENTO', 'TESTEMUNHO', 'NOTICIA', 'OUTRO') DEFAULT 'DEVOCIONAL',
    tags JSON,
    autor_id INT,
    status ENUM('RASCUNHO', 'PUBLICADO', 'ARQUIVADO') DEFAULT 'PUBLICADO',
    visualizacoes INT DEFAULT 0,
    data_publicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE galeria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    titulo VARCHAR(200),
    descricao TEXT,
    tipo ENUM('FOTO', 'VIDEO', 'ALBUM') DEFAULT 'FOTO',
    url_arquivo VARCHAR(500),
    thumbnail_url VARCHAR(500),
    evento_id INT,
    tags JSON,
    curtidas INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    FOREIGN KEY (evento_id) REFERENCES agendamentos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- 15. INTEGRAÇÕES
-- ============================================
CREATE TABLE integracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    tipo ENUM('YOUTUBE', 'FACEBOOK', 'INSTAGRAM', 'WHATSAPP', 'TELEGRAM', 
              'TIKTOK', 'EMAIL', 'SMS', 'PIX_GERENCIANET', 'BOLETO_GERENCIANET',
              'GOOGLE_CALENDAR', 'OPENAI') NOT NULL,
    nome VARCHAR(100),
    api_key TEXT,
    api_secret TEXT,
    access_token TEXT,
    refresh_token TEXT,
    webhook_url VARCHAR(500),
    status ENUM('ATIVO', 'INATIVO', 'ERRO') DEFAULT 'ATIVO',
    config_json JSON,
    ultima_sincronizacao TIMESTAMP NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    UNIQUE KEY uk_igreja_tipo (igreja_id, tipo)
) ENGINE=InnoDB;

-- ============================================
-- 16. PLANOS E ASSINATURAS
-- ============================================
CREATE TABLE planos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao TEXT,
    valor_mensal DECIMAL(10,2),
    valor_anual DECIMAL(10,2),
    max_membros INT,
    max_usuarios INT,
    max_armazenamento_mb INT,
    funcionalidades JSON,
    status ENUM('ATIVO', 'INATIVO') DEFAULT 'ATIVO',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE assinaturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT NOT NULL,
    plano_id INT NOT NULL,
    status ENUM('ATIVA', 'CANCELADA', 'EXPIRADA', 'PENDENTE') DEFAULT 'PENDENTE',
    data_inicio DATE,
    data_fim DATE,
    valor DECIMAL(10,2),
    forma_pagamento ENUM('BOLETO', 'PIX', 'CARTAO') DEFAULT 'PIX',
    ultimo_pagamento DATE,
    proximo_vencimento DATE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE,
    FOREIGN KEY (plano_id) REFERENCES planos(id)
) ENGINE=InnoDB;

-- ============================================
-- 17. LOGS
-- ============================================
CREATE TABLE logs_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    igreja_id INT,
    usuario_id INT,
    acao VARCHAR(100),
    tabela_afetada VARCHAR(50),
    registro_id INT,
    dados_antigos JSON,
    dados_novos JSON,
    ip VARCHAR(45),
    user_agent TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_igreja (igreja_id),
    INDEX idx_data (criado_em)
) ENGINE=InnoDB;

-- ============================================
-- DADOS INICIAIS
-- ============================================
INSERT INTO planos (nome, codigo, descricao, valor_mensal, valor_anual, max_membros, max_usuarios, funcionalidades) VALUES
('Gratuito', 'FREE', 'Para começar', 0, 0, 50, 2, '{"membros":true,"financeiro":false,"agenda":true,"documentos":false,"vendas":false,"ministerios":false}'),
('Básico', 'BASIC', 'Igrejas de médio porte', 49.90, 499.00, 200, 5, '{"membros":true,"financeiro":true,"agenda":true,"documentos":true,"vendas":false,"ministerios":true}'),
('Premium', 'PREMIUM', 'Igrejas grandes', 99.90, 999.00, 1000, 10, '{"membros":true,"financeiro":true,"agenda":true,"documentos":true,"vendas":true,"ministerios":true}'),
('Empresarial', 'ENTERPRISE', 'Redes e denominações', 199.90, 1999.00, 99999, 50, '{"membros":true,"financeiro":true,"agenda":true,"documentos":true,"vendas":true,"ministerios":true,"multi_igreja":true,"white_label":true}');

INSERT INTO igrejas (codigo, nome, email, tipo, plano, status, max_membros, max_usuarios, cor_primaria, cor_secundaria) VALUES
('ELSHADAY', 'El Shaday', 'igreja@elshaday.com', 'INDEPENDENTE', 'PREMIUM', 'ATIVO', 1000, 10, '#1e3a5f', '#c8960c');
=======
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
>>>>>>> 9e13619899ddb940e0fbd90656e44c18539d5d9c
