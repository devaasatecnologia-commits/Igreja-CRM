// ============================================
// PÁGINA: DASHBOARD
// ============================================

let chartInstance = null;

document.addEventListener('DOMContentLoaded', async function() {
    // O app.js já inicializou a sidebar e auth
    // Agora carregamos dados específicos do dashboard
    await carregarDados();
});

async function carregarDados() {
    try {
        const d = await api.request('/dashboard');
        
        document.getElementById('totalMembros').textContent = d.membros?.total || 0;
        document.getElementById('receitaMes').textContent = Components.formatMoney(d.financeiro?.receitas_mes);
        document.getElementById('eventosSemana').textContent = d.eventos?.esta_semana || 0;
        document.getElementById('totalDocumentos').textContent = d.documentos?.total || 0;
        
        // Tabela de membros
        if (d.ultimos_membros && d.ultimos_membros.length > 0) {
            const cores = ['#6366f1,#8b5cf6', '#ec4899,#f43f5e', '#10b981,#06b6d4', '#f59e0b,#ef4444', '#8b5cf6,#6366f1'];
            let html = '';
            d.ultimos_membros.forEach((m, i) => {
                html += `
                <tr onclick="location.href='membros.html'" style="cursor:pointer;">
                    <td><strong>${m.nome}</strong></td>
                    <td>${m.email || '-'}</td>
                    <td><span class="badge badge-info">${m.tipo_membro || 'Membro'}</span></td>
                    <td><span class="badge badge-success">${m.status || 'Ativo'}</span></td>
                </tr>`;
            });
            document.getElementById('tabelaMembros').innerHTML = html;
        }
        
        // Gráfico
        if (d.grafico_membros && d.grafico_membros.length > 0) {
            const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const categorias = d.grafico_membros.map(item => meses[item.mes - 1] || 'Mês ' + item.mes);
            const valores = d.grafico_membros.map(item => item.total);
            renderChart(categorias, valores);
        } else {
            renderChart(['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], [980, 1020, 1080, 1120, 1180, 1234]);
        }
    } catch (error) {
        console.log('Modo demo');
        renderChart(['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'], [980, 1020, 1080, 1120, 1180, 1234]);
    }
}

function renderChart(categories, dataMembros) {
    if (chartInstance) chartInstance.destroy();
    
    chartInstance = new ApexCharts(document.getElementById('chartMembros'), {
        chart: { type: 'area', height: 300, toolbar: { show: false }, fontFamily: 'Inter', animations: { enabled: true, speed: 800 } },
        series: [{ name: 'Total Membros', data: dataMembros }],
        colors: ['#6366f1'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0.01 } },
        stroke: { curve: 'smooth', width: 3 },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        xaxis: { categories: categories, labels: { style: { colors: '#94a3b8', fontSize: '12px' } } },
        yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '12px' } } },
        tooltip: { theme: 'light' }
    });
    chartInstance.render();
}