// ============================================
// MÓDULO DE AUTENTICAÇÃO E PERSONALIZAÇÃO
// ============================================

class Auth {
    static check() {
        if (!api.isAuthenticated()) {
            window.location.href = '../login.html';
            return false;
        }
        return true;
    }

    static getUser() {
        return api.getUsuario();
    }

    static async loadIgreja() {
        try {
            const igreja = await api.request('/igrejas/minha');
            
            // Aplicar cores da igreja
            if (igreja.cor_primaria) {
                const root = document.documentElement;
                root.style.setProperty('--primary', igreja.cor_primaria);
                root.style.setProperty('--primary-dark', this.adjustColor(igreja.cor_primaria, -20));
                root.style.setProperty('--primary-light', this.adjustColor(igreja.cor_primaria, 20));
                root.style.setProperty('--primary-bg', igreja.cor_primaria + '15');
                root.style.setProperty('--primary-bg-hover', igreja.cor_primaria + '25');
            }
            
            if (igreja.cor_secundaria) {
                document.documentElement.style.setProperty('--accent', igreja.cor_secundaria);
            }
            
            // Logo da igreja
            if (igreja.logo_url) {
                const logoEl = document.getElementById('sidebarLogo');
                if (logoEl) {
                    logoEl.textContent = '';
                    logoEl.style.backgroundImage = `url(${igreja.logo_url})`;
                    logoEl.style.backgroundSize = 'cover';
                    logoEl.style.backgroundPosition = 'center';
                }
            }
            
            // Nome da igreja
            if (igreja.nome) {
                localStorage.setItem('igreja_nome', igreja.nome);
                const nomeEl = document.getElementById('igrejaNome');
                if (nomeEl) nomeEl.textContent = igreja.nome;
            }
            
            // Tipo (matriz/filial)
            if (igreja.tipo) {
                localStorage.setItem('igreja_tipo', igreja.tipo);
            }
            
            return igreja;
        } catch (e) {
            console.log('Configurações padrão');
            return null;
        }
    }

    static adjustColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static logout() {
        if (confirm('Deseja sair do sistema?')) {
            api.logout();
        }
    }
}