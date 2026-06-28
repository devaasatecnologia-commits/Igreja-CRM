// ============================================
// PÁGINA: MEMBROS
// ============================================

function initPage() {
    carregarMembros();
    carregarStats();
}

async function carregarStats() {
    try {
        const d = await window.api.get('/membros/estatisticas');
        document.getElementById('statTotal').textContent = d.total || 0;
        document.getElementById('statAtivos').textContent = d.ativos || 0;
        document.getElementById('statVisitantes').textContent = d.porTipo?.find(t => t.tipo_membro === 'VISITANTE')?.total || 0;
        document.getElementById('statLideres').textContent = d.porTipo?.find(t => t.tipo_membro === 'LIDER')?.total || 0;
    } catch (e) {}
}

async function carregarMembros() {
    const busca = document.getElementById('searchInput')?.value || '';
    try {
        const d = await window.api.get('/membros?busca=' + encodeURIComponent(busca));
        let html = '';
        if (d.membros && d.membros.length > 0) {
            d.membros.forEach((m, i) => {
                html += `
                <tr class="border-t hover:bg-gray-50 cursor-pointer" onclick="editarMembro(${m.id})">
                    <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style="background:${Utils.getAvatarColor(i)}">${m.nome[0]}</div>
                            <strong class="text-sm">${m.nome}</strong>
                        </div>
                    </td>
                    <td class="px-4 py-3 text-sm">${m.email || '-'}</td>
                    <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">${m.tipo_membro}</span></td>
                    <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-semibold ${m.status==='ATIVO'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}">${m.status}</span></td>
                    <td class="px-4 py-3"><button onclick="event.stopPropagation();excluirMembro(${m.id})" class="text-red-500 hover:bg-red-50 p-2 rounded-lg">🗑️</button></td>
                </tr>`;
            });
        } else {
            html = '<tr><td colspan="5" class="text-center py-8 text-gray-400">Nenhum membro encontrado</td></tr>';
        }
        document.getElementById('tabelaMembros').innerHTML = html;
    } catch (e) {}
}

async function salvarMembro() {
    const id = document.getElementById('membroId').value;
    const dados = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        celular: document.getElementById('celular').value,
        tipo_membro: document.getElementById('tipo_membro').value,
        data_nascimento: document.getElementById('data_nascimento').value
    };
    try {
        if (id) {
            await window.api.put('/membros/' + id, dados);
        } else {
            await window.api.post('/membros', dados);
        }
        fecharModal();
        carregarMembros();
        carregarStats();
        Utils.showToast(id ? 'Membro atualizado!' : 'Membro cadastrado!');
    } catch (e) {
        Utils.showToast('Erro ao salvar', 'error');
    }
}

async function excluirMembro(id) {
    if (!confirm('Desativar este membro?')) return;
    try {
        await window.api.delete('/membros/' + id);
        carregarMembros();
        carregarStats();
        Utils.showToast('Membro desativado!');
    } catch (e) {
        Utils.showToast('Erro ao excluir', 'error');
    }
}

async function editarMembro(id) {
    try {
        const m = await window.api.get('/membros/' + id);
        document.getElementById('modalTitle').textContent = '✏️ Editar Membro';
        document.getElementById('membroId').value = m.id;
        document.getElementById('nome').value = m.nome || '';
        document.getElementById('email').value = m.email || '';
        document.getElementById('celular').value = m.celular || '';
        document.getElementById('tipo_membro').value = m.tipo_membro || 'MEMBRO';
        document.getElementById('data_nascimento').value = m.data_nascimento ? m.data_nascimento.split('T')[0] : '';
        document.getElementById('modalMembro').style.display = 'flex';
    } catch (e) {}
}

function abrirModal() {
    document.getElementById('modalTitle').textContent = '➕ Novo Membro';
    document.getElementById('membroId').value = '';
    ['nome','email','celular'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('tipo_membro').value = 'MEMBRO';
    document.getElementById('data_nascimento').value = '';
    document.getElementById('modalMembro').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modalMembro').style.display = 'none';
}