// Página: Financeiro
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(carregarFinanceiro, 300);
});

async function carregarFinanceiro() {
    const token = localStorage.getItem('auth_token');
    try {
        const res = await fetch('http://localhost:3001/api/financeiro/fluxo-caixa', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const d = await res.json();
        console.log('📊 Financeiro:', d);
    } catch(e) {
        console.log('Financeiro demo');
    }
}