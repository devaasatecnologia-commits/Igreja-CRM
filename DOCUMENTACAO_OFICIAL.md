# 🏛️ AASA SAGRADO - DOCUMENTAÇÃO OFICIAL v3.1

┌──────────────────────────────────────────────────────────────┐
│  SISTEMA: AASA SAGRADO                                       │
│  VERSÃO: 3.1                                                 │
│  DATA: 28/06/2026                                            │
│  DESENVOLVEDOR: AASA Tecnologia                              │
│  STATUS: Backend 100% | Frontend 85% | Banco 100%            │
└──────────────────────────────────────────────────────────────┘

## 🔑 TOKEN DE CONTINUIDADE
PROJETO-AASA-SAGRADO-V3-2026
DATA: 2026-06-28
STATUS: BACKEND-COMPLETO-FRONTEND-EM-DESENVOLVIMENTO
ULTIMA-ACAO: CONFIGURACAO-AMBIENTE-DESENVOLVIMENTO
PENDENTE: PAGINAS-MODULOS-MINISTERIOS-BLOG
HASH: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6

text

## 🗄️ BANCO DE DADOS

- **Host:** localhost
- **Porta:** 3306
- **Banco:** igreja_crm
- **Usuário:** root
- **Senha:** (vazia)
- **Tabelas:** 3 (igrejas, usuarios, membros)
- **Registros:** 1 igreja, 2 usuários, 3 membros

## 👤 CREDENCIAIS

| Acesso | Email | Senha |
|--------|-------|-------|
| Super Admin | admin@aasatecnologia.com.br | admin123 |
| Igreja Demo | admin@igreja.com | admin123 |

## 🔗 URLs DO SISTEMA

| Página | URL |
|--------|-----|
| API | http://localhost:3001 |
| Frontend Angular | http://localhost:4200 |
| phpMyAdmin | http://localhost/phpmyadmin |

## 🎨 IDENTIDADE VISUAL

- **Nome:** AASA SAGRADO
- **Cor Primária:** #1a237e (Azul AASA)
- **Cor Secundária:** #283593
- **Cor Destaque:** #f59e0b (Dourado)
- **Fonte Títulos:** Playfair Display
- **Fonte Corpo:** Inter

## 📁 ESTRUTURA DO PROJETO
~/projetos/Igreja-CRM/
├── backend/
│ ├── src/
│ │ ├── config/
│ │ ├── middleware/
│ │ ├── controllers/
│ │ ├── routes/
│ │ ├── utils/
│ │ ├── scripts/
│ │ ├── models/
│ │ └── server.ts
│ ├── server.js
│ ├── package.json
│ ├── tsconfig.json
│ └── .env
├── frontend/
│ └── (Angular 22)
├── database/
│ └── schema_completo.sql
└── docs/

text

## ✅ O QUE ESTÁ FUNCIONANDO (100%)

- ✅ API REST (Node.js + Express)
- ✅ Autenticação JWT (2 níveis)
- ✅ Multi-tenant (isolamento por igreja_id)
- ✅ Banco de dados MySQL (3 tabelas)
- ✅ Servidor backend na porta 3001
- ✅ Frontend Angular na porta 4200
- ✅ Git sincronizado com GitHub
- ✅ Ambiente de desenvolvimento configurado

## ⏳ PRÓXIMOS PASSOS

1. ✅ Configurar ambiente de desenvolvimento
2. 🔄 Criar componentes Angular
3. 🔄 Conectar frontend com backend
4. 🔄 Implementar CRUD completo
5. 🔄 Criar módulos adicionais

## 🚀 COMANDOS IMPORTANTES

### Iniciar servidor
```bash
cd ~/projetos/Igreja-CRM/backend
node server.js
Iniciar frontend
bash
cd ~/projetos/Igreja-CRM/frontend
ng serve
Testar API
bash
curl http://localhost:3001
Login
bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@igreja.com","senha":"admin123"}'
🔑 TOKEN (CÓPIA RÁPIDA)
text
PROJETO-AASA-SAGRADO-V3-2026
DATA: 2026-06-28
STATUS: BACKEND-COMPLETO-FRONTEND-EM-DESENVOLVIMENTO
ULTIMA-ACAO: CONFIGURACAO-AMBIENTE-DESENVOLVIMENTO
PENDENTE: PAGINAS-MODULOS-MINISTERIOS-BLOG
HASH: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6
Documentação atualizada em: 28/06/2026
Próxima revisão: 05/07/2026
