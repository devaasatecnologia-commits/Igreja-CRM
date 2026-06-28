// Página: Agenda
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(carregarAgenda, 300);
});

async function carregarAgenda() {
    const token = localStorage.getItem('auth_token');
    try {
        const res = await fetch('http://localhost:3001/api/agenda/proximos?limite=5', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const eventos = await res.json();
        console.log('📅 Eventos:', eventos);
    } catch(e) {
        console.log('Agenda demo');
    }
}