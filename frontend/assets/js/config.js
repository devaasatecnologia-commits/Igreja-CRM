// ============================================
// CONFIGURAÇÃO CENTRAL - AASA SAGRADO
// Altere aqui e todas as páginas atualizam!
// ============================================

const CONFIG = {
    development: {
        API_URL: 'http://localhost:3001/api',
        SITE_URL: 'http://localhost/igreja-crm/frontend',
        APP_NAME: 'AASA SAGRADO',
        APP_VERSION: '3.0',
        COMPANY: 'AASA Tecnologia',
        COMPANY_LOGO: 'https://aasatecnologia.com.br/logo.png'
    },
    production: {
        API_URL: 'https://api.seudominio.com.br/api',
        SITE_URL: 'https://seudominio.com.br',
        APP_NAME: 'AASA SAGRADO',
        APP_VERSION: '3.0',
        COMPANY: 'AASA Tecnologia',
        COMPANY_LOGO: 'https://aasatecnologia.com.br/logo.png'
    }
};

// Detectar ambiente automaticamente
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const ENV = isProduction ? 'production' : 'development';

// Exportar configurações globais
window.APP_CONFIG = CONFIG[ENV];
window.API_URL = CONFIG[ENV].API_URL;
window.SITE_URL = CONFIG[ENV].SITE_URL;
window.APP_NAME = CONFIG[ENV].APP_NAME;
window.COMPANY_LOGO = CONFIG[ENV].COMPANY_LOGO;
window.COMPANY = CONFIG[ENV].COMPANY;

// ============================================
// SERVIÇO CENTRAL DE DADOS DA IGREJA
// ============================================

class ChurchData {
    static data = null;

    // Carregar dados da igreja
    static async load() {
        // Tentar do localStorage primeiro
        const cached = localStorage.getItem('igreja');
        if (cached) {
            try {
                this.data = JSON.parse(cached);
            } catch (e) {
                this.data = null;
            }
        }

        // Atualizar da API
        try {
            const token = localStorage.getItem('auth_token');
            if (token && window.API_URL) {
                const response = await fetch(`${window.API_URL}/igrejas/minha`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (response.ok) {
                    this.data = await response.json();
                    localStorage.setItem('igreja', JSON.stringify(this.data));
                }
            }
        } catch (e) {
            console.log('ChurchData: usando cache local');
        }

        // Aplicar cores e logo
        this.applyColors();
        this.applyLogo();
        this.applyName();

        return this.data;
    }

    // Getters estáticos
    static get nome() { return this.data?.nome || localStorage.getItem('igreja_nome') || 'Igreja'; }
    static get logo() { return this.data?.logo_url || window.COMPANY_LOGO || 'https://aasatecnologia.com.br/logo.png'; }
    static get corPrimaria() { return this.data?.cor_primaria || '#1a237e'; }
    static get corSecundaria() { return this.data?.cor_secundaria || '#f59e0b'; }
    static get cnpj() { return this.data?.cnpj || ''; }
    static get telefone() { return this.data?.telefone || ''; }
    static get email() { return this.data?.email || ''; }
    static get site() { return this.data?.site || ''; }
    static get tipo() { return this.data?.tipo || 'INDEPENDENTE'; }
    static get plano() { return this.data?.plano || 'FREE'; }
    static get id() { return this.data?.id || 1; }
    
    static get endereco() {
        if (!this.data) return '';
        const parts = [this.data.logradouro, this.data.numero, this.data.bairro, 
                       this.data.cidade, this.data.estado, this.data.cep].filter(Boolean);
        return parts.join(', ');
    }
    
    static get cidadeEstado() {
        if (!this.data) return '';
        return [this.data.cidade, this.data.estado].filter(Boolean).join('/');
    }

    // Aplicar cores CSS
    static applyColors() {
        if (!this.data) return;
        const root = document.documentElement;
        if (this.data.cor_primaria) {
            root.style.setProperty('--primary', this.data.cor_primaria);
            root.style.setProperty('--church-primary', this.data.cor_primaria);
            root.style.setProperty('--primary-dark', this.adjustColor(this.data.cor_primaria, -20));
        }
        if (this.data.cor_secundaria) {
            root.style.setProperty('--gold', this.data.cor_secundaria);
            root.style.setProperty('--church-secondary', this.data.cor_secundaria);
        }
    }

    // Aplicar logo
    static applyLogo() {
        if (!this.data?.logo_url) return;
        document.querySelectorAll('.church-logo, .igreja-logo, [data-church-logo]').forEach(el => {
            if (el.tagName === 'IMG') {
                el.src = this.data.logo_url;
            } else {
                el.style.backgroundImage = `url(${this.data.logo_url})`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
            }
        });
    }

    // Aplicar nome
    static applyName() {
        if (!this.data?.nome) return;
        document.querySelectorAll('.church-name, .igreja-nome, [data-church-name]').forEach(el => {
            el.textContent = this.data.nome;
        });
    }

    // Ajustar cor (clarear/escurecer)
    static adjustColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
}

// Disponibilizar globalmente
window.ChurchData = ChurchData;

// Auto-inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    if (window.API_URL) {
        await ChurchData.load();
    }
    // ============================================
// SWEETALERT2 - CONFIGURAÇÃO GLOBAL
// ============================================

// Carregar SweetAlert2 dinamicamente
(function loadSwal() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    script.onload = () => {
        // Configurar tema padrão
        Swal.mixin({
            background: '#ffffff',
            borderRadius: '24px',
            confirmButtonColor: ChurchData.corPrimaria || '#1a237e',
            cancelButtonColor: '#64748b',
            customClass: {
                title: 'font-serif font-bold',
                popup: 'shadow-2xl',
                confirmButton: 'rounded-xl px-6 py-3 font-semibold',
                cancelButton: 'rounded-xl px-6 py-3 font-semibold'
            }
        });
    };
    document.head.appendChild(script);
})();

// Helper global para alertas
window.SwalHelper = {
    toast(msg, icon = 'success') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon,
            title: msg,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    },
    
    async confirm(msg, text = '') {
        const { isConfirmed } = await Swal.fire({
            title: msg,
            text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não'
        });
        return isConfirmed;
    },
    
    loading(msg = 'Processando...') {
        Swal.fire({
            title: msg,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
    },
    
    close() { Swal.close(); }
};
});