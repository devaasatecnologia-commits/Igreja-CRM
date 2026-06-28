# 🙏 Igreja-CRM

Sistema de Gestão para Igrejas e Comunidades Religiosas

## 🎯 Objetivo
Gerenciar membros, eventos, doações e comunicações da igreja.

## 🛠️ Tecnologias
- Frontend: Angular + TypeScript
- Backend: Node.js + Express
- Database: MySQL
- Deploy: XAMPP

## 👨‍💻 Desenvolvido por
**AASA TECNOLOGIA**
- Email: devaasatecnologia@gmail.com
- GitHub: @devaasatecnologia-commits

## 📋 Funcionalidades Planejadas
- [ ] Cadastro de Membros
- [ ] Gestão de Eventos
- [ ] Controle de Doações
- [ ] Comunicação via WhatsApp
- [ ] Relatórios Gerenciais
- [ ] Controle de Presenças

## 🚀 Como executar
```bash
# Frontend
cd frontend
npm install
ng serve

# Backend
cd backend
npm install
npm start

# 1. Clonar o projeto do GitHub
cd ~/projetos
gh repo clone devaasatecnologia-commits/Igreja-CRM
# ou se o nome for diferente:
gh repo clone devaasatecnologia-commits/aasa-sagrado

# 2. Se não estiver no GitHub, vamos criar a estrutura manualmente
mkdir -p ~/projetos/igreja-crm
cd ~/projetos/igreja-crm
# Dentro de ~/projetos/Igreja-CRM (onde você está)
cd ~/projetos/Igreja-CRM

# Criar estrutura de pastas
mkdir -p backend/src/{config,middleware,controllers,routes,utils,scripts,models}
mkdir -p frontend/{app,admin,assets/{js,css,images,components}}
mkdir -p database

# Criar estrutura do frontend (HTML puro como no projeto original)
mkdir -p frontend/app/{membros,celulas,financeiro,agenda,documentos,vendas,ministerios}
cd ~/projetos/Igreja-CRM/backend

cat > package.json << 'EOF'
{
  "name": "igreja-crm-backend",
  "version": "3.0.0",
  "description": "API do Sistema Igreja-CRM - AASA TECNOLOGIA",
  "main": "dist/server.js",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "setup": "npx ts-node src/scripts/setup.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "mysql2": "^3.2.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.7.0"
  },
  "devDependencies": {
    "@types/node": "^18.15.0",
    "@types/express": "^4.17.17",
    "typescript": "^5.0.0",
    "nodemon": "^2.0.22",
    "ts-node": "^10.9.1"
  }
}
