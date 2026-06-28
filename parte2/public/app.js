// ================================================================
//  app.js — Frontend Definitivo com Dropdowns Automáticos
// ================================================================

let cacheDados = [];
let entidadeAtiva = 'usuario';
let idSelecionado = null;
let modoFormulario = 'ADD';

function normalizarLista(valor) {
    if (!valor) return [];
    if (Array.isArray(valor)) return valor;
    return String(valor).split(',').map(i => i.trim()).filter(Boolean);
}

function getIdSelecionado() { return idSelecionado !== null ? String(idSelecionado) : null; }

function getValorCampo(item, aliases, fallback = '') {
    if (!item) return fallback;
    for (const alias of aliases) {
        const v = item[alias];
        if (v !== null && v !== undefined && v !== '') return v;
    }
    return fallback;
}

function getEndpoint() {
    return { usuario: '/api/usuario', curso: '/api/curso', estudante: '/api/estudante', vinculo: '/api/vinculo' }[entidadeAtiva];
}

function getTitulo() {
    return { usuario: 'Usuário', curso: 'Curso', estudante: 'Estudante', vinculo: 'Vínculo' }[entidadeAtiva];
}

function getValorInput(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

// ----------------------------------------------------------------
//  AQUI ESTÁ A MÁGICA: Definição dos campos como 'select' (dropdowns)
// ----------------------------------------------------------------
function getCampos() {
    return {
        usuario: [
            { id: 'form-cpf',      label: 'CPF (11 dígitos)',      type: 'text',     required: true },
            { id: 'form-nome',     label: 'Nome completo',          type: 'text',     required: true },
            { id: 'form-data',     label: 'Data de Nascimento',     type: 'date' },
            { id: 'form-email',    label: 'E-mails (separar por vírgula)', type: 'text' },
            { id: 'form-telefone', label: 'Telefones (separar por vírgula)', type: 'text' },
            { id: 'form-login',    label: 'Login',                  type: 'text',     required: true },
            { id: 'form-senha',    label: 'Senha',                  type: 'password', required: true }
        ],
        curso: [
            { id: 'form-nome',   label: 'Nome do curso',  type: 'text', required: true },
            { id: 'form-grau',   label: 'Grau (Bacharelado / Licenciatura / Tecnólogo)', type: 'text', required: true },
            { id: 'form-turno',  label: 'Turno (Matutino / Vespertino / Noturno / Integral)', type: 'text', required: true },
            { id: 'form-campus', label: 'Campus',          type: 'text' },
            { id: 'form-nivel',  label: 'Nível (Graduação / Pós-Graduação)', type: 'text' }
        ],
        estudante: [
            { id: 'form-matricula', label: 'Matrícula (ex: E101)', type: 'text', required: true },
            // Menu suspenso puxando os usuários reais do banco
            { id: 'form-cpf',       label: 'Selecione o Usuário',   type: 'select',   required: true, endpoint: '/api/usuario', render: d => `${d.nome} (CPF: ${d.cpf})` },
            { id: 'form-mc',        label: 'MC (0 a 10)',          type: 'number', step: '0.1' },
            { id: 'form-ano',       label: 'Ano de Ingresso',      type: 'number',   required: true }
        ],
        vinculo: [
            // Menu suspenso puxando Estudantes e Cursos reais do banco
            { id: 'form-estudante-id', label: 'Selecione o Estudante', type: 'select', required: true, endpoint: '/api/estudante', render: d => `Matrícula: ${d.matricula} (${d.usuario?.nome || 'Sem nome'})` },
            { id: 'form-curso-id',     label: 'Selecione o Curso',     type: 'select', required: true, endpoint: '/api/curso', render: d => `${d.nome} - ${d.turno}` },
            { id: 'form-data-entrada', label: 'Data de Ingresso',              type: 'date' },
            { id: 'form-status',       label: 'Status (Ativo / Cancelada / Graduado)', type: 'text', required: true },
            { id: 'form-data-saida',   label: 'Data de Saída',                type: 'date' }
        ]
    }[entidadeAtiva] || [];
}

async function renderizarFormulario() {
    const container = document.getElementById('campos-formulario');
    container.innerHTML = '';
    const campos = getCampos();

    for (const campo of campos) {
        if (campo.type === 'select') {
            const select = document.createElement('select');
            select.id = campo.id;
            select.required = campo.required;
            select.style = "padding: 8px; margin-bottom: 5px; border: 1px solid #ccc; border-radius: 4px;";
            select.innerHTML = '<option value="">Carregando opções do banco...</option>';
            container.appendChild(select);

            try {
                const res = await fetch(campo.endpoint);
                const dados = await res.json();
                
                // MÁGICA AQUI: Se for o form de CPF, envia o CPF para o backend, senão envia o _id
                select.innerHTML = '<option value="">' + campo.label + '...</option>' +
                    dados.map(d => {
                        const valorOpcao = campo.id === 'form-cpf' ? d.cpf : d._id;
                        return `<option value="${valorOpcao}">${campo.render(d)}</option>`;
                    }).join('');
            } catch(e) {
                select.innerHTML = '<option value="">Erro ao carregar opções</option>';
            }
        } else {
            const input = document.createElement('input');
            input.id = campo.id;
            input.type = campo.type;
            input.placeholder = campo.label;
            input.required = Boolean(campo.required);
            if(campo.step) input.step = campo.step;
            input.style = "padding: 8px; margin-bottom: 5px; border: 1px solid #ccc; border-radius: 4px;";
            container.appendChild(input);
        }
    }
}

function preencherFormulario(item) {
    const aliases = {
        'form-cpf':         ['cpf', 'usuario'],
        'form-nome':        ['nome'],
        'form-data':        ['dataNascimento'],
        'form-email':       ['email'],
        'form-telefone':    ['telefone'],
        'form-login':       ['login'],
        'form-senha':       ['senha'],
        'form-grau':        ['grau'],
        'form-turno':       ['turno'],
        'form-campus':      ['campus'],
        'form-nivel':       ['nivel'],
        'form-matricula':   ['matricula'],
        'form-mc':          ['mc'],
        'form-ano':         ['anoIngresso'],
        'form-estudante-id':['estudante'],
        'form-curso-id':    ['curso'],
        'form-status':      ['status'],
        'form-data-entrada':['dataIngresso'],
        'form-data-saida':  ['dataSaida']
    };

    getCampos().forEach(campo => {
        const input = document.getElementById(campo.id);
        if (!input) return;
        let valor = getValorCampo(item, aliases[campo.id] || [], '');

        // Puxa corretamente os dados dos relacionamentos para preencher o formulário
        if (campo.id === 'form-cpf' && item.usuario) valor = item.usuario.cpf;
        if (campo.id === 'form-estudante-id' && item.estudante) valor = item.estudante._id;
        if (campo.id === 'form-curso-id' && item.curso) valor = item.curso._id;

        if (input.type === 'date' && valor) {
            input.value = String(valor).substring(0, 10);
        } else if (Array.isArray(valor)) {
            input.value = valor.join(', ');
        } else {
            input.value = valor || '';
        }
    });
}

function getPayload() {
    return {
        usuario: {
            cpf:             getValorInput('form-cpf').trim(),
            nome:            getValorInput('form-nome').trim(),
            dataNascimento:  getValorInput('form-data') || null,
            email:           normalizarLista(getValorInput('form-email')),
            telefone:        normalizarLista(getValorInput('form-telefone')),
            login:           getValorInput('form-login').trim(),
            senha:           getValorInput('form-senha')
        },
        curso: {
            nome:   getValorInput('form-nome').trim(),
            grau:   getValorInput('form-grau').trim(),
            turno:  getValorInput('form-turno').trim(),
            campus: getValorInput('form-campus').trim() || null,
            nivel:  getValorInput('form-nivel').trim() || null
        },
        estudante: {
            matricula:    getValorInput('form-matricula').trim(),
            cpf:          getValorInput('form-cpf').trim(), // Envia "cpf" como o seu backend exige
            mc:           parseFloat(getValorInput('form-mc')) || null,
            anoIngresso:  parseInt(getValorInput('form-ano')) || null
        },
        vinculo: {
            estudanteId:  getValorInput('form-estudante-id').trim(), // Envia "estudanteId" como o backend exige
            cursoId:      getValorInput('form-curso-id').trim(),     // Envia "cursoId" como o backend exige
            dataIngresso: getValorInput('form-data-entrada') || null,
            status:       getValorInput('form-status').trim() || 'Ativo',
            dataSaida:    getValorInput('form-data-saida') || null
        }
    }[entidadeAtiva];
}

function getItemId(item) {
    if (item._id) return item._id;
    return item.cpf || item.matricula || '';
}

const corpoTabela    = document.getElementById('corpo-tabela');
const cabecalhoTabela = document.getElementById('cabecalho-tabela');

async function carregarDados() {
    idSelecionado = null;
    try {
        const res = await fetch(getEndpoint());
        if (!res.ok) throw new Error('Erro na requisição');
        cacheDados = await res.json();
    } catch (e) {
        cacheDados = [];
        corpoTabela.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#c0392b;">Erro ao conectar com o banco.</td></tr>`;
        return;
    }

    const headers = {
        usuario:   ['ID MONGODB', 'CPF', 'NOME', 'NASCIMENTO', 'EMAIL', 'LOGIN'],
        curso:     ['ID', 'NOME', 'GRAU', 'TURNO', 'CAMPUS', 'NÍVEL'],
        estudante: ['ID', 'MATRÍCULA', 'USUÁRIO REF', 'MC', 'ANO INGRESSO'],
        vinculo:   ['ID', 'ESTUDANTE REF', 'CURSO REF', 'STATUS']
    };

    cabecalhoTabela.innerHTML = headers[entidadeAtiva].map(h => `<th style="padding: 10px; border: 1px solid #ccc;">${h}</th>`).join('');
    renderizarLinhas(cacheDados);
}

function renderizarLinhas(lista) {
    corpoTabela.innerHTML = '';
    lista.forEach(item => {
        const tr = document.createElement('tr');
        tr.style = "cursor: pointer; border-bottom: 1px solid #eee;";
        let conteudo = '';

        if (entidadeAtiva === 'usuario') {
            const nasc = item.dataNascimento ? new Date(item.dataNascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '';
            conteudo = `
                <td style="padding: 10px; font-family: monospace; color: #555;">${item._id || ''}</td>
                <td style="padding: 10px;">${item.cpf || ''}</td>
                <td style="padding: 10px;">${item.nome || ''}</td>
                <td style="padding: 10px;">${nasc}</td>
                <td style="padding: 10px;">${normalizarLista(item.email).join(', ')}</td>
                <td style="padding: 10px;">${item.login || ''}</td>`;
        } else if (entidadeAtiva === 'curso') {
            conteudo = `
                <td style="padding: 10px;" title="${item._id}">${String(item._id).slice(-6)}</td>
                <td style="padding: 10px;">${item.nome || ''}</td>
                <td style="padding: 10px;">${item.grau || ''}</td>
                <td style="padding: 10px;">${item.turno || ''}</td>
                <td style="padding: 10px;">${item.campus || ''}</td>
                <td style="padding: 10px;">${item.nivel || ''}</td>`;
        } else if (entidadeAtiva === 'estudante') {
            const refUsuario = item.usuario ? (item.usuario.nome || item.usuario) : '';
            conteudo = `
                <td style="padding: 10px;" title="${item._id}">${String(item._id).slice(-6)}</td>
                <td style="padding: 10px;">${item.matricula || ''}</td>
                <td style="padding: 10px; font-weight: bold;">${refUsuario}</td>
                <td style="padding: 10px;">${item.mc ?? ''}</td>
                <td style="padding: 10px;">${item.anoIngresso || ''}</td>`;
        } else if (entidadeAtiva === 'vinculo') {
            const refEst = item.estudante ? (item.estudante.matricula || item.estudante) : '';
            const refCurso = item.curso ? (item.curso.nome || item.curso) : '';
            conteudo = `
                <td style="padding: 10px;" title="${item._id}">${String(item._id).slice(-6)}</td>
                <td style="padding: 10px; font-weight: bold;">${refEst}</td>
                <td style="padding: 10px; font-weight: bold;">${refCurso}</td>
                <td style="padding: 10px;">${item.status || ''}</td>`;
        }

        tr.innerHTML = conteudo;
        tr.addEventListener('click', () => {
            document.querySelectorAll('#corpo-tabela tr').forEach(r => r.style.background = 'none');
            tr.style.background = '#d1e7dd';
            idSelecionado = getItemId(item);
        });
        corpoTabela.appendChild(tr);
    });
}

document.getElementById('txt-busca').addEventListener('input', e => {
    const termo = e.target.value.toLowerCase();
    renderizarLinhas(cacheDados.filter(item => JSON.stringify(item).toLowerCase().includes(termo)));
});

function selecionarEntidade(nova) {
    entidadeAtiva = nova;
    document.querySelectorAll('.sidebar button').forEach(b => {
        b.style.fontWeight = b.dataset.entidade === nova ? 'bold' : 'normal';
    });
    carregarDados();
}

const form  = document.getElementById('form-usuario');
const modal = document.getElementById('modal-formulario');

// Aqui nós usamos 'await' para dar tempo dos dropdowns carregarem as opções do banco
document.getElementById('open-add-modal').addEventListener('click', async () => {
    modoFormulario = 'ADD';
    document.getElementById('modal-titulo').innerText = `Cadastrar Novo ${getTitulo()}`;
    await renderizarFormulario(); 
    form.reset();
    modal.style.display = 'flex';
});

document.getElementById('open-edit-modal').addEventListener('click', async () => {
    if (!getIdSelecionado()) return alert(`Selecione um ${getTitulo().toLowerCase()} na tabela primeiro!`);
    modoFormulario = 'EDIT';
    document.getElementById('modal-titulo').innerText = `Editar ${getTitulo()} Existente`;
    const item = cacheDados.find(d => String(getItemId(d)) === getIdSelecionado());
    if (!item) return alert(`${getTitulo()} não encontrado.`);
    await renderizarFormulario();
    preencherFormulario(item);
    modal.style.display = 'flex';
});

document.getElementById('close-modal').addEventListener('click', () => modal.style.display = 'none');

form.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = getPayload();
    const url    = modoFormulario === 'ADD' ? getEndpoint() : `${getEndpoint()}/${idSelecionado}`;
    const metodo = modoFormulario === 'ADD' ? 'POST' : 'PUT';

    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            modal.style.display = 'none';
            carregarDados();
        } else {
            const err = await res.json();
            // Agora o alerta vai mostrar exatamente o que o Node.js está reclamando
            alert(`O banco de dados recusou. Motivo: ${err.mensagem || JSON.stringify(err)}`);
        }
    } catch(e) {
        alert(`Erro de comunicação com o servidor: ${e.message}`);
    }
});

document.getElementById('execute-delete').addEventListener('click', async () => {
    if (!idSelecionado) return alert(`Selecione um ${getTitulo().toLowerCase()} para remover!`);
    if (!confirm(`Tem certeza que deseja deletar?`)) return;

    const res = await fetch(`${getEndpoint()}/${idSelecionado}`, { method: 'DELETE' });
    if (res.ok) {
        carregarDados();
    } else {
        alert('Erro ao deletar.');
    }
});

carregarDados();