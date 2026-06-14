// Gerenciadores de Estado Globais
let cacheDados = [];
let entidadeAtiva = 'usuario';
let idSelecionado = null;
let modoFormulario = 'ADD';

function normalizarLista(valor) {
    if (!valor) return [];
    if (Array.isArray(valor)) return valor;
    return String(valor).split(',').map(item => item.trim()).filter(Boolean);
}

function getIdSelecionado() {
    return idSelecionado !== null && idSelecionado !== undefined ? String(idSelecionado) : null;
}

function getValorCampo(item, aliases, fallback = '') {
    if (!item) return fallback;

    for (const alias of aliases) {
        const valor = item[alias];
        if (valor !== null && valor !== undefined && valor !== '') {
            return valor;
        }
    }

    return fallback;
}

function getEndpointEntidade() {
    const endpoints = {
        usuario: '/api/usuario',
        curso: '/api/curso',
        estudante: '/api/estudante',
        vinculo: '/api/vinculo'
    };
    return endpoints[entidadeAtiva] || '/api/usuario';
}

function getTituloEntidade() {
    const titulos = {
        usuario: 'Usuário',
        curso: 'Curso',
        estudante: 'Estudante',
        vinculo: 'Vínculo'
    };
    return titulos[entidadeAtiva] || 'Usuário';
}

function getCamposFormulario() {
    const camposPorEntidade = {
        usuario: [
            { id: 'form-cpf', label: 'CPF', type: 'text', required: true },
            { id: 'form-nome', label: 'Nome', type: 'text', required: true },
            { id: 'form-data', label: 'Data de Nascimento', type: 'date' },
            { id: 'form-email', label: 'E-mails', type: 'text' },
            { id: 'form-telefone', label: 'Telefones', type: 'text' },
            { id: 'form-login', label: 'Login', type: 'text', required: true },
            { id: 'form-senha', label: 'Senha', type: 'password', required: true }
        ],
        curso: [
            { id: 'form-nome', label: 'Nome', type: 'text', required: true },
            { id: 'form-grau', label: 'Grau', type: 'text', required: true },
            { id: 'form-turno', label: 'Turno', type: 'text', required: true },
            { id: 'form-campus', label: 'Campus', type: 'text' },
            { id: 'form-nivel', label: 'Nível', type: 'text' }
        ],
        estudante: [
            { id: 'form-matricula', label: 'Matrícula', type: 'text', required: true },
            { id: 'form-cpf', label: 'CPF', type: 'text', required: true },
            { id: 'form-nome', label: 'Nome do Usuário', type: 'text', required: true },
            { id: 'form-login', label: 'Login do Usuário', type: 'text', required: true },
            { id: 'form-senha', label: 'Senha do Usuário', type: 'password', required: true },
            { id: 'form-mc', label: 'MC', type: 'text' },
            { id: 'form-ano', label: 'Ano de Ingresso', type: 'number' },
            { id: 'form-curso', label: 'ID do Curso', type: 'number', required: true },
            { id: 'form-status', label: 'Status do Vínculo', type: 'text', required: true }
        ],
        vinculo: [
            { id: 'form-idvinculo', label: 'ID do Vínculo', type: 'text' },
            { id: 'form-matricula', label: 'Matrícula do Estudante', type: 'text', required: true },
            { id: 'form-curso', label: 'ID do Curso', type: 'number', required: true },
            { id: 'form-data-entrada', label: 'Data de Entrada', type: 'date' },
            { id: 'form-status', label: 'Status', type: 'text', required: true },
            { id: 'form-data-saida', label: 'Data de Saída', type: 'date' }
        ]
    };

    return camposPorEntidade[entidadeAtiva] || camposPorEntidade.usuario;
}

function renderizarFormulario() {
    const container = document.getElementById('campos-formulario');
    if (!container) return;
    container.innerHTML = '';

    getCamposFormulario().forEach(campo => {
        const input = document.createElement('input');
        input.id = campo.id;
        input.name = campo.id;
        input.type = campo.type;
        input.placeholder = campo.label;
        input.required = Boolean(campo.required);
        container.appendChild(input);
    });
}

function preencherFormulario(item) {
    const campos = getCamposFormulario();
    const aliasesPorCampo = {
        'form-cpf': ['cpf'],
        'form-nome': ['nome', 'usuarioNome'],
        'form-data': ['data_nascimento', 'dataNascimento'],
        'form-email': ['email'],
        'form-telefone': ['telefone'],
        'form-login': ['login'],
        'form-senha': ['senha'],
        'form-grau': ['grau'],
        'form-turno': ['turno'],
        'form-campus': ['campus'],
        'form-nivel': ['nivel'],
        'form-matricula': ['mat_estudante', 'matricula'],
        'form-mc': ['mc', 'MC'],
        'form-ano': ['ano_ingresso', 'anoIngresso'],
        'form-curso': ['curso', 'idCurso', 'idcurso'],
        'form-status': ['status'],
        'form-idvinculo': ['idVinculo', 'idvinculo'],
        'form-data-entrada': ['data_entrada', 'dataIngresso'],
        'form-data-saida': ['data_saida', 'dataSaida']
    };

    campos.forEach(campo => {
        const input = document.getElementById(campo.id);
        if (!input) return;

        const valor = getValorCampo(item, aliasesPorCampo[campo.id] || [], '');

        if (input.type === 'date' && valor) {
            input.value = String(valor).substring(0, 10);
        } else if (input.type === 'number' && valor !== null && valor !== undefined) {
            input.value = valor;
        } else {
            input.value = valor || '';
        }
    });
}

function getValorCampoInput(id) {
    const input = document.getElementById(id);
    return input ? input.value : '';
}

function getPayloadFormulario() {
    const payloads = {
        usuario: {
            cpf: getValorCampoInput('form-cpf').trim(),
            nome: getValorCampoInput('form-nome').trim(),
            data_nascimento: getValorCampoInput('form-data') || null,
            email: normalizarLista(getValorCampoInput('form-email')),
            telefone: normalizarLista(getValorCampoInput('form-telefone')),
            login: getValorCampoInput('form-login').trim(),
            senha: getValorCampoInput('form-senha')
        },
        curso: {
            nome: getValorCampoInput('form-nome').trim(),
            grau: getValorCampoInput('form-grau').trim(),
            turno: getValorCampoInput('form-turno').trim(),
            campus: getValorCampoInput('form-campus').trim(),
            nivel: getValorCampoInput('form-nivel').trim()
        },
        estudante: {
            matricula: getValorCampoInput('form-matricula').trim(),
            mat_estudante: getValorCampoInput('form-matricula').trim(),
            cpf: getValorCampoInput('form-cpf').trim(),
            mc: getValorCampoInput('form-mc'),
            ano_ingresso: getValorCampoInput('form-ano'),
            nome: getValorCampoInput('form-nome').trim(),
            login: getValorCampoInput('form-login').trim(),
            senha: getValorCampoInput('form-senha') || '123456',
            curso: getValorCampoInput('form-curso') || null,
            idCurso: getValorCampoInput('form-curso') || null,
            status: getValorCampoInput('form-status').trim() || 'Ativo'
        },
        vinculo: {
            idVinculo: getValorCampoInput('form-idvinculo') || null,
            mat_estudante: getValorCampoInput('form-matricula').trim(),
            matricula: getValorCampoInput('form-matricula').trim(),
            curso: getValorCampoInput('form-curso') || null,
            idCurso: getValorCampoInput('form-curso') || null,
            data_entrada: getValorCampoInput('form-data-entrada') || null,
            status: getValorCampoInput('form-status').trim(),
            data_saida: getValorCampoInput('form-data-saida') || null
        }
    };

    return payloads[entidadeAtiva] || payloads.usuario;
}

function normalizarValor(item, chave) {
    return item?.[chave] ?? item?.[chave.toLowerCase()] ?? '';
}

// Elementos DOM
const form = document.getElementById('form-usuario');
const modal = document.getElementById('modal-formulario');
const corpoTabela = document.getElementById('corpo-tabela');
const cabecalhoTabela = document.getElementById('cabecalho-tabela');

// --- FLUXO DE LOGIN ---
document.getElementById('btn-conectar').addEventListener('click', async () => {
    const usuario = document.getElementById('db-user').value.trim();
    const senha = document.getElementById('db-pass').value;

    if (!usuario || !senha) {
        return alert('Preencha usuário e senha para conectar ao banco.');
    }

    const res = await fetch('/api/conectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
    });
    
    if (res.ok) {
        document.getElementById('tela-login').style.display = 'none';
        document.getElementById('tela-dashboard').style.display = 'grid';
        document.getElementById('status-banco').innerText = `RDS PostgreSQL | Usuário: ${usuario}`;
        carregarDados();
    } else {
        const err = await res.json();
        alert(err.mensagem || 'Falha ao conectar ao banco.');
    }
});

// --- RENDERIZAÇÃO DA TABELA ---
async function carregarDados() {
    idSelecionado = null;
    try {
        const res = await fetch(getEndpointEntidade());
        if (!res.ok) {
            const erro = await res.json().catch(() => ({}));
            throw new Error(erro.mensagem || `Erro ao carregar ${getTituloEntidade().toLowerCase()}.`);
        }
        const dados = await res.json();
        cacheDados = Array.isArray(dados) ? dados : [];
    } catch (erro) {
        cacheDados = [];
        corpoTabela.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#c0392b;">${erro.message}</td></tr>`;
        return;
    }

    const headers = {
        usuario: ['CPF', 'NOME', 'NASCIMENTO', 'EMAIL', 'TELEFONE', 'LOGIN'],
        curso: ['ID', 'NOME', 'GRAU', 'TURNO', 'CAMPUS', 'NÍVEL'],
        estudante: ['MATRÍCULA', 'CPF', 'NOME', 'CURSO', 'STATUS', 'MC', 'ANO DE INGRESSO'],
        vinculo: ['ID', 'ESTUDANTE', 'CURSO', 'DATA DE ENTRADA', 'STATUS', 'DATA DE SAÍDA']
    };

    cabecalhoTabela.innerHTML = headers[entidadeAtiva].map(h => `<th>${h}</th>`).join('');
    renderizarLinhas(cacheDados);
}

function renderizarLinhas(lista) {
    corpoTabela.innerHTML = '';

    lista.forEach(item => {
        const tr = document.createElement('tr');
        let conteudo = '';
        const itemId = getValorCampo(item, ['cpf', 'idCurso', 'idcurso', 'mat_estudante', 'matricula', 'idVinculo', 'idvinculo'], '');

        if (entidadeAtiva === 'usuario') {
            const dataFormt = item.data_nascimento ? new Date(item.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '';
            conteudo = `
                <td>${item.cpf}</td>
                <td>${item.nome || ''}</td>
                <td>${dataFormt}</td>
                <td>${normalizarLista(item.email).join(', ')}</td>
                <td>${normalizarLista(item.telefone).join(', ')}</td>
                <td>${item.login || ''}</td>
            `;
        } else if (entidadeAtiva === 'curso') {
            conteudo = `
                <td>${getValorCampo(item, ['idCurso', 'idcurso'], '')}</td>
                <td>${item.nome || ''}</td>
                <td>${item.grau || ''}</td>
                <td>${item.turno || ''}</td>
                <td>${item.campus || ''}</td>
                <td>${item.nivel || ''}</td>
            `;
        } else if (entidadeAtiva === 'estudante') {
            conteudo = `
                <td>${getValorCampo(item, ['mat_estudante', 'matricula'], '')}</td>
                <td>${item.cpf || ''}</td>
                <td>${item.nome || ''}</td>
                <td>${item.nome_curso || item.curso || ''}</td>
                <td>${item.status || ''}</td>
                <td>${item.mc ?? ''}</td>
                <td>${item.ano_ingresso ?? item.anoIngresso ?? ''}</td>
            `;
        } else if (entidadeAtiva === 'vinculo') {
            conteudo = `
                <td>${getValorCampo(item, ['idVinculo', 'idvinculo'], '')}</td>
                <td>${item.nome_estudante || item.mat_estudante || ''}</td>
                <td>${item.nome_curso || item.curso || ''}</td>
                <td>${item.data_entrada ? new Date(item.data_entrada).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}</td>
                <td>${item.status || ''}</td>
                <td>${item.data_saida ? new Date(item.data_saida).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}</td>
            `;
        }

        tr.innerHTML = conteudo;
        tr.addEventListener('click', () => {
            document.querySelectorAll('#corpo-tabela tr').forEach(r => r.classList.remove('selecionado'));
            tr.classList.add('selecionado');
            idSelecionado = String(itemId || '');
        });
        corpoTabela.appendChild(tr);
    });
}

// --- BARRA DE FILTRO ---
document.getElementById('txt-busca').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = cacheDados.filter(item => {
        const texto = JSON.stringify(item).toLowerCase();
        return texto.includes(termo);
    });
    renderizarLinhas(filtrados);
});

function selecionarEntidade(novaEntidade) {
    entidadeAtiva = novaEntidade;
    document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.toggle('active', btn.dataset.entidade === novaEntidade));
    document.getElementById('modal-titulo').innerText = `Cadastrar Novo ${getTituloEntidade()}`;
    carregarDados();
}

// --- OPERAÇÕES DOS MODAIS (ABRIR / FECHAR) ---
document.getElementById('open-add-modal').addEventListener('click', () => {
    modoFormulario = 'ADD';
    document.getElementById('modal-titulo').innerText = `Cadastrar Novo ${getTituloEntidade()}`;
    renderizarFormulario();
    form.reset();
    modal.style.display = 'flex';
});

document.getElementById('open-edit-modal').addEventListener('click', () => {
    const idSelecionadoAtual = getIdSelecionado();
    if (!idSelecionadoAtual) return alert(`Selecione um ${getTituloEntidade().toLowerCase()} na tabela primeiro!`);

    modoFormulario = 'EDIT';
    document.getElementById('modal-titulo').innerText = `Editar ${getTituloEntidade()} Existente`;

    const item = cacheDados.find(d => String(getValorCampo(d, ['cpf', 'idCurso', 'idcurso', 'mat_estudante', 'matricula', 'idVinculo', 'idvinculo'], '')) === idSelecionadoAtual);
    if (!item) return alert(`${getTituloEntidade()} não encontrado no cache local.`);

    renderizarFormulario();
    preencherFormulario(item);
    modal.style.display = 'flex';
});

document.getElementById('close-modal').addEventListener('click', () => modal.style.display = 'none');

// --- SUBMISSÃO DO FORMULÁRIO (SALVAR / ATUALIZAR) ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = getPayloadFormulario();
    const url = modoFormulario === 'ADD' ? getEndpointEntidade() : `${getEndpointEntidade()}/${idSelecionado}`;
    const metodo = modoFormulario === 'ADD' ? 'POST' : 'PUT';

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
        alert('Erro ao processar requisição: ' + err.mensagem);
    }
});

// --- EXCLUSÃO (REMOVER SELECIONADO) ---
document.getElementById('execute-delete').addEventListener('click', async () => {
    if (!idSelecionado) return alert(`Selecione um ${getTituloEntidade().toLowerCase()} para remover!`);

    if (confirm(`Tem certeza que deseja deletar o ${getTituloEntidade().toLowerCase()} selecionado?`)) {
        const res = await fetch(`${getEndpointEntidade()}/${idSelecionado}`, { method: 'DELETE' });
        if (res.ok) {
            carregarDados();
        } else {
            const err = await res.json();
            alert('Erro ao deletar: ' + err.mensagem);
        }
    }
});