// ============================================
// INICIALIZADOR PRINCIPAL DO SISTEMA
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação primeiro
    if (!Auth.check()) return;
    
    // Carregar dados da igreja
    await ChurchData.load();
    
    // Carregar componentes (sidebar)
    await Components.loadSidebar();
    
    // Inicializar ícones Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Atualizar data
    const dataEl = document.getElementById('dataAtual');
    if (dataEl) {
        dataEl.textContent = Utils.getDataExtenso();
    }
    
    // Atualizar footer
    const footerEl = document.getElementById('footerText');
    if (footerEl) {
        footerEl.textContent = `${window.APP_NAME} v${window.APP_CONFIG?.APP_VERSION || '3.0'} • ${window.COMPANY} © 2026`;
    }
    
    console.log('✅ Sistema inicializado com sucesso!');
    console.log('🏛️ Igreja:', ChurchData.nome);
});