# 🏛️ AASA SAGRADO - CRM Igreja v3.0

## 📋 VISÃO GERAL
Sistema de gestão completo para igrejas, desenvolvido com foco em multi-tenancy, modularidade e facilidade de uso.

## 🚀 STATUS ATUAL (30/06/2026)

### ✅ CONCLUÍDO
- **Backend**: 100% funcional com Node.js + Express + TypeScript
- **Banco de Dados**: MySQL com 28 tabelas estruturadas
- **Autenticação**: JWT com dois níveis (Super Admin e Usuário)
- **Multi-Tenant**: Isolamento por igreja_id
- **Frontend**: Estrutura completa com Tailwind + Lucide
- **Sidebar**: Dinâmico com navegação entre módulos
- **Módulos Implementados**:
  - Dashboard com gráficos e versículo do dia
  - Membros (CRUD completo com filtros)
  - Células (CRUD completo)
  - Ministérios (CRUD completo)
  - Financeiro (CRUD completo com gráficos)
  - Agenda (CRUD completo com calendário)
  - Documentos (Sistema de templates)
  - Vendas (Estrutura base)

### ⏳ EM DESENVOLVIMENTO
- **Sistema de Templates**:
  - Carteirinhas (Masculina, Feminina, Infantil, Jovem)
  - Certificados (Batismo Masc/Fem, Casamento, Curso)
  - Cartas (Recomendação, Transferência)
- **GED (Gestão Eletrônica de Documentos)**
- **Portal do Membro**
- **Integrações (PIX, WhatsApp, YouTube)**

## 📁 ESTRUTURA DO PROJETO
igreja-crm/
├── backend/
│ ├── src/
│ │ ├── config/ # Configurações (database, etc)
│ │ ├── controllers/ # Controladores
│ │ ├── middleware/ # Middlewares (auth, tenant)
│ │ ├── routes/ # Rotas da API
│ │ ├── utils/ # Utilitários
│ │ └── server.ts # Servidor principal
│ ├── package.json
│ └── .env
├── frontend/
│ ├── app/ # Páginas do sistema
│ ├── assets/
│ │ ├── css/
│ │ ├── js/
│ │ ├── components/ # Componentes reutilizáveis
│ │ └── templates/ # Templates de documentos
│ ├── login.html
│ └── cadastro.html
├── database/
│ ├── schema_completo.sql
│ └── seed_dados.sql
└── DOCUMENTACAO.md

text

## 🔑 CREDENCIAIS DE ACESSO

### Super Admin
- **Email**: admin@aasatecnologia.com.br
- **Senha**: admin123

### Igreja Demo
- **Email**: admin@igreja.com
- **Senha**: admin123

## 🔗 URLs DO SISTEMA

| Página | URL |
|--------|-----|
| Login Igreja | http://localhost/igreja-crm/frontend/login.html |
| Dashboard | http://localhost/igreja-crm/frontend/app/dashboard.html |
| Super Admin | http://localhost/igreja-crm/frontend/admin/login.html |
| Membros | http://localhost/igreja-crm/frontend/app/membros.html |
| Células | http://localhost/igreja-crm/frontend/app/celulas.html |
| Ministérios | http://localhost/igreja-crm/frontend/app/ministerios.html |
| Financeiro | http://localhost/igreja-crm/frontend/app/financeiro.html |
| Agenda | http://localhost/igreja-crm/frontend/app/agenda.html |
| Documentos | http://localhost/igreja-crm/frontend/app/documentos.html |
| Vendas | http://localhost/igreja-crm/frontend/app/vendas.html |

## 🎨 IDENTIDADE VISUAL

- **Cor Primária**: #1a237e (Azul AASA)
- **Cor Secundária**: #283593
- **Cor Destaque**: #f59e0b (Dourado)
- **Fonte Títulos**: Playfair Display
- **Fonte Corpo**: Inter

## 📊 MÓDULOS IMPLEMENTADOS

### Dashboard
- Cards com estatísticas (membros, financeiro, agenda, documentos)
- Gráfico de crescimento de membros
- Versículo do dia com troca
- Últimos membros cadastrados
- Ações rápidas

### Membros
- CRUD completo
- Filtros por tipo (membro, visitante, líder, pastor, inativo)
- Busca por nome, email, CPF, celular
- Estatísticas em cards
- Exportar CSV
- WhatsApp integrado

### Células
- CRUD completo
- Vínculo com líder (membro)
- Horários e dias da semana
- Contagem de membros

### Ministérios
- CRUD completo
- Cards com ícones e cores
- Membros vinculados

### Financeiro
- CRUD completo de lançamentos
- Gráficos de fluxo de caixa
- Filtros por tipo e status
- Cards com totais
- Exportar CSV

### Agenda
- CRUD completo de eventos
- Visualização em calendário e lista
- Filtros por tipo
- Participantes

### Documentos
- Sistema de templates
- Geração de documentos (carteirinhas, certificados, cartas)
- Listagem com status

## 🐛 PRÓXIMOS PASSOS

1. **Sistema de Templates** - Completar todos os modelos com dados dinâmicos
2. **Upload de Fotos** - Para membros e documentos
3. **Portal do Membro** - Acesso com login e senha
4. **Integração PIX** - Para doações e ofertas
5. **Exportação de Relatórios** - PDF e Excel
6. **Deploy** - Configurar para produção

## 📦 COMANDOS ÚTEIS

```bash
# Iniciar servidor backend
cd backend
npm run dev

# Setup inicial
npx ts-node src/scripts/setup.ts

# Testar API
curl http://localhost:3001/health
🔧 TECNOLOGIAS
Backend: Node.js, Express, TypeScript, JWT, bcrypt

Frontend: HTML5, Tailwind CSS, JavaScript, Lucide Icons

Banco de Dados: MySQL (MariaDB 10.4)

Gráficos: ApexCharts

Calendário: FullCalendar

AASA Tecnologia • www.aasatecnologia.com.br
