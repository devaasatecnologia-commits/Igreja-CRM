// ============================================
// CARREGADOR DE COMPONENTES
// ============================================

class Components {
    static async loadSidebar() {
        try {
            // Determinar caminho base
            const path = window.location.pathname;
            let basePath = '../';
            if (path.includes('/app/')) basePath = '../';
            if (path.includes('/admin/')) basePath = '../';
            
            const response = await fetch(basePath + 'assets/components/sidebar.html');
            const html = await response.text();
            
            // Inserir sidebar no início da app-layout
            const appLayout = document.querySelector('.app-layout');
            if (appLayout) {
                appLayout.insertAdjacentHTML('afterbegin', html);
            }
            
            // Marcar item ativo
            this.setActiveMenuItem();
            
            // Dados do usuário
            this.updateUserInfo();
            
            // Carregar personalização da igreja
            await Auth.loadIgreja();
            
        } catch (e) {
            console.error('Erro ao carregar sidebar:', e);
        }
    }

    static setActiveMenuItem() {
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        document.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href') || '';
            if (href.includes(currentPage)) {
                item.classList.add('active');
            }
        });
    }

    static updateUserInfo() {
        const usuario = Auth.getUser();
        const userInicial = document.getElementById('userInicial');
        const userNome = document.getElementById('userNome');
        if (userInicial) userInicial.textContent = usuario.nome ? usuario.nome[0].toUpperCase() : 'A';
        if (userNome) userNome.textContent = usuario.nome || 'Admin';
    }

    static toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        if (sidebar) sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
    }

    static showToast(message, type = 'success') {
        // Remover toast existente
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }

    static formatMoney(value) {
        return 'R$ ' + (Number(value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }

    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }
}

// Funções globais para onclick
function toggleSidebar() { Components.toggleSidebar(); }
function logout() { Auth.logout(); }