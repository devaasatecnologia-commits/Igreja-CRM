// ============================================
// UTILITÁRIOS GLOBAIS
// ============================================

class Utils {
    // Formatação
    static formatMoney(value) {
        return 'R$ ' + (Number(value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }
    
    static formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    }
    
    static formatDateTime(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('pt-BR');
    }
    
    // Data atual por extenso
    static getDataExtenso() {
        const data = new Date();
        const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
        const dias = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
        return `${dias[data.getDay()]}, ${data.getDate()} de ${meses[data.getMonth()]} de ${data.getFullYear()}`;
    }
    
    // Versículo aleatório
    static getVersiculo() {
        const versiculos = [
            {texto:"Tudo posso naquele que me fortalece.",ref:"Filipenses 4:13"},
            {texto:"O Senhor é o meu pastor, nada me faltará.",ref:"Salmos 23:1"},
            {texto:"Porque Deus amou o mundo de tal maneira.",ref:"João 3:16"},
            {texto:"Se Deus é por nós, quem será contra nós?",ref:"Romanos 8:31"},
            {texto:"O choro pode durar uma noite, mas a alegria vem pela manhã.",ref:"Salmos 30:5"},
            {texto:"Entrega o teu caminho ao Senhor, confia nele, e ele tudo fará.",ref:"Salmos 37:5"}
        ];
        return versiculos[Math.floor(Math.random() * versiculos.length)];
    }
    
    // Toast de notificação
    static showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position:fixed;bottom:24px;right:24px;z-index:999;
            padding:14px 20px;border-radius:14px;color:white;
            font-weight:600;font-size:13px;box-shadow:0 10px 30px rgba(0,0,0,.2);
            animation:slideUp .3s ease;
            background:${type==='success'?'#10b981':'#ef4444'};
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    // Cores para avatares
    static avatarColors = [
        'linear-gradient(135deg, #1a237e, #283593)',
        'linear-gradient(135deg, #f59e0b, #d97706)',
        'linear-gradient(135deg, #10b981, #059669)',
        'linear-gradient(135deg, #8b5cf6, #6366f1)',
        'linear-gradient(135deg, #ec4899, #db2777)',
        'linear-gradient(135deg, #06b6d4, #0891b2)'
    ];
    
    static getAvatarColor(index) {
        return this.avatarColors[index % this.avatarColors.length];
    }
}

// Disponibilizar globalmente
window.Utils = Utils;