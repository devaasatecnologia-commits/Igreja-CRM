// ============================================
// SIDEBAR DINÂMICA - CARREGA MÓDULOS DA API
// ============================================

const API_URL = window.API_URL || 'http://localhost:3001/api';

// Configuração de todos os módulos possíveis com ícones Lucide
const ALL_MODULES = [
    {
        id: 'dashboard',
        section: '<i data-lucide="book-open" class="w-4 h-4 inline"></i> Principal',
        icon: 'layout-dashboard',
        label: 'Altar',
        href: 'dashboard.html',
        page: 'dashboard'
    },
    {
        id: 'membros',
        section: '<i data-lucide="book-open" class="w-4 h-4 inline"></i> Principal',
        icon: 'users',
        label: 'Rebanho',
        href: 'membros.html',
        page: 'membros',
        badge: true
    },
    {
        id: 'celulas',
        section: '<i data-lucide="book-open" class="w-4 h-4 inline"></i> Principal',
        icon: 'home',
        label: 'Células',
        href: 'celulas.html',
        page: 'celulas'
    },
    {
        id: 'financeiro',
        section: '<i data-lucide="shield" class="w-4 h-4 inline"></i> Módulos',
        icon: 'wallet',
        label: 'Tesouraria',
        href: 'financeiro.html',
        page: 'financeiro'
    },
    {
        id: 'agenda',
        section: '<i data-lucide="shield" class="w-4 h-4 inline"></i> Módulos',
        icon: 'calendar-days',
        label: 'Agenda',
        href: 'agenda.html',
        page: 'agenda'
    },
    {
        id: 'documentos',
        section: '<i data-lucide="shield" class="w-4 h-4 inline"></i> Módulos',
        icon: 'scroll-text',
        label: 'Documentos',
        href: 'documentos.html',
        page: 'documentos'
    },
    {
        id: 'vendas',
        section: '<i data-lucide="shield" class="w-4 h-4 inline"></i> Módulos',
        icon: 'shopping-cart',
        label: 'Loja',
        href: 'vendas.html',
        page: 'vendas'
    },
    {
        id: 'ministerios',
        section: '<i data-lucide="shield" class="w-4 h-4 inline"></i> Módulos',
        icon: 'music',
        label: 'Ministérios',
        href: '#',
        page: 'ministerios'
    },
    {
        id: 'relatorios',
       section: '<i data-lucide="settings" class="w-4 h-4 inline"></i> Sistema',
        icon: 'bar-chart-3',
        label: 'Relatórios',
        href: '#',
        page: 'relatorios'
    },
    {
        id: 'blog',
       section: '<i data-lucide="settings" class="w-4 h-4 inline"></i> Sistema',
        icon: 'file-text',
        label: 'Blog',
        href: '#',
        page: 'blog'
    },
    {
        id: 'configuracoes',
       section: '<i data-lucide="settings" class="w-4 h-4 inline"></i> Sistema',
        icon: 'settings',
        label: 'Configurações',
        href: '#',
        page: 'configuracoes'
    }
];

class Sidebar {
    static async load() {
        try {
            const response = await fetch('../assets/components/sidebar.html');
            const html = await response.text();
            
            const appLayout = document.querySelector('.app-layout');
            if (appLayout) {
                appLayout.insertAdjacentHTML('afterbegin', html);
            }
            
            await this.loadModules();
            this.updateUser();
            
            // Inicializar ícones Lucide após carregar a sidebar
            if (typeof lucide !== 'undefined') {
                setTimeout(() => lucide.createIcons(), 100);
            }
            
        } catch (error) {
            console.error('Erro ao carregar sidebar:', error);
            this.renderDefaultModules();
        }
    }
    
    static async loadModules() {
        const token = localStorage.getItem('auth_token');
        if (!token) return;
        
        try {
            const res = await fetch(API_URL + '/igrejas/modulos', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            
            this.renderModules(data.modulos || {}, data.plano);
            
        } catch (error) {
            console.log('Usando módulos padrão');
            const allOn = {};
            ALL_MODULES.forEach(m => allOn[m.id] = true);
            this.renderModules(allOn, 'PREMIUM');
        }
    }
    
    static renderModules(modulos, plano) {
        const nav = document.getElementById('sidebarNav');
        if (!nav) return;
        
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        let html = '';
        let currentSection = '';
        
        ALL_MODULES.forEach(mod => {
            if (!modulos[mod.id]) return;
            
            if (mod.section !== currentSection) {
                currentSection = mod.section;
                html += `<div class="nav-section-title">${currentSection}</div>`;
            }
            
            const isActive = mod.page === currentPage;
            
            html += `
            <a href="${mod.href}" class="nav-item ${isActive ? 'active' : ''}" data-page="${mod.page}">
                <span class="nav-icon"><i data-lucide="${mod.icon}" class="w-5 h-5"></i></span>
                <span>${mod.label}</span>
                ${mod.badge ? '<span class="nav-badge" id="badgeMembros" style="display:none;">0</span>' : ''}
            </a>`;
        });
        
        nav.innerHTML = html || '<div class="text-center py-8 text-gray-400 text-sm">Nenhum módulo liberado</div>';
        
        // Inicializar ícones Lucide nos itens da navegação
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 100);
        }
    }
    
    static renderDefaultModules() {
        const allOn = {};
        ALL_MODULES.forEach(m => allOn[m.id] = true);
        this.renderModules(allOn, 'PREMIUM');
    }
    
static updateUser() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    const userInicial = document.getElementById('userInicial');
    const userNome = document.getElementById('userNome');
    const userPlano = document.getElementById('userPlano');
    const igrejaNome = document.getElementById('igrejaNome');
    const igrejaLogo = document.getElementById('igrejaLogo');
    
    if (userInicial) userInicial.textContent = usuario.nome ? usuario.nome[0].toUpperCase() : 'A';
    if (userNome) userNome.textContent = usuario.nome || 'Admin';
    if (userPlano) userPlano.textContent = ChurchData.plano || 'Plano';
    if (igrejaNome) igrejaNome.textContent = ChurchData.nome;
    if (igrejaLogo && ChurchData.logo) igrejaLogo.src = ChurchData.logo;
}
    
    static toggle() {
        document.getElementById('sidebar')?.classList.toggle('open');
        document.getElementById('overlay')?.classList.toggle('active');
    }
}

// Funções globais
function toggleSidebar() { Sidebar.toggle(); }
function logout() { localStorage.clear(); window.location.href = '../login.html'; }

// Auto-inicializar
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('auth_token');
    if (!token) { window.location.href = '../login.html'; return; }
    Sidebar.load();
});