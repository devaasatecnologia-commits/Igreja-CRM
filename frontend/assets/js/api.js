// ============================================
// CLIENTE API CENTRALIZADO
// ============================================

class APIClient {
    constructor() {
        this.token = localStorage.getItem('auth_token');
    }

    async request(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': this.token ? `Bearer ${this.token}` : ''
        };

        const config = { method, headers };
        if (body) config.body = JSON.stringify(body);

        const response = await fetch(`${window.API_URL}${endpoint}`, config);
        
        if (response.status === 401) {
            this.logout();
            throw new Error('Sessão expirada');
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro na requisição');
        
        return data;
    }

    // Atalhos para métodos HTTP
    async get(endpoint) { return this.request(endpoint, 'GET'); }
    async post(endpoint, body) { return this.request(endpoint, 'POST', body); }
    async put(endpoint, body) { return this.request(endpoint, 'PUT', body); }
    async delete(endpoint) { return this.request(endpoint, 'DELETE'); }

    // Auth
    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    setUserData(usuario, igreja) {
        localStorage.setItem('usuario', JSON.stringify(usuario));
        localStorage.setItem('igreja', JSON.stringify(igreja));
        localStorage.setItem('igreja_nome', igreja.nome || '');
    }

    logout() {
        localStorage.clear();
        window.location.href = window.SITE_URL + '/login.html';
    }

    isAuthenticated() {
        return !!this.token;
    }
}

// Instância global única
window.api = new APIClient();