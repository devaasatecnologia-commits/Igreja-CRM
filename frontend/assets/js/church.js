// ============================================
// SERVIÇO CENTRAL DE DADOS DA IGREJA
// ============================================

class ChurchData {
    static data = null;
    
    // Carregar dados da igreja (do localStorage ou API)
    static async load() {
        // Primeiro tenta do localStorage (salvo no login)
        const cached = localStorage.getItem('igreja');
        if (cached) {
            this.data = JSON.parse(cached);
        }
        
        // Depois atualiza da API
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                const response = await fetch(`${window.API_URL}/igrejas/minha`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (response.ok) {
                    this.data = await response.json();
                    localStorage.setItem('igreja', JSON.stringify(this.data));
                }
            }
        } catch (e) {
            console.log('Usando dados em cache');
        }
        
        return this.data;
    }
    
    // Getters
    static get nome() { return this.data?.nome || 'Igreja'; }
    static get logo() { return this.data?.logo_url || 'https://aasatecnologia.com.br/logo.png'; }
    static get corPrimaria() { return this.data?.cor_primaria || '#1a237e'; }
    static get corSecundaria() { return this.data?.cor_secundaria || '#f59e0b'; }
    static get cnpj() { return this.data?.cnpj || '00.000.000/0000-00'; }
    static get endereco() { 
        if (!this.data) return '';
        const parts = [this.data.logradouro, this.data.numero, this.data.bairro, this.data.cidade, this.data.estado].filter(Boolean);
        return parts.join(', ');
    }
    static get telefone() { return this.data?.telefone || ''; }
    static get email() { return this.data?.email || ''; }
    static get tipo() { return this.data?.tipo || 'INDEPENDENTE'; }
    static get plano() { return this.data?.plano || 'FREE'; }
    static get id() { return this.data?.id || 1; }
    
    // Aplicar cores no CSS
    static applyColors() {
        if (!this.data) return;
        const root = document.documentElement;
        if (this.data.cor_primaria) {
            root.style.setProperty('--primary', this.data.cor_primaria);
            root.style.setProperty('--church-primary', this.data.cor_primaria);
        }
        if (this.data.cor_secundaria) {
            root.style.setProperty('--gold', this.data.cor_secundaria);
            root.style.setProperty('--church-secondary', this.data.cor_secundaria);
        }
    }
    
    // Aplicar logo nos elementos
    static applyLogo() {
        if (!this.data?.logo_url) return;
        document.querySelectorAll('.church-logo, .igreja-logo, [data-church-logo]').forEach(el => {
            if (el.tagName === 'IMG') {
                el.src = this.data.logo_url;
            } else {
                el.style.backgroundImage = `url(${this.data.logo_url})`;
            }
        });
    }
}

// Disponibilizar globalmente
window.ChurchData = ChurchData;

// Auto-inicializar
document.addEventListener('DOMContentLoaded', async () => {
    await ChurchData.load();
    ChurchData.applyColors();
    ChurchData.applyLogo();
});