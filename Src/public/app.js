// ─── Estado Global ────────────────────────────────────────────────────────────
let cacheDados = [];
let entidadeAtiva = 'usuario';
let idSelecionado = null;
let modoFormulario = 'ADD';
let bancoAtivo = null; // 'postgres' | 'mongo'
let configAtual = {}; // Configurações de host
let enumsDisponíveis = {}; // Enums carregados do servidor

// ─── Utilitários ──────────────────────────────────────────────────────────────
function normalizarLista(valor) {
    if (!valor) return [];
    if (Array.isArray(valor)) return valor;
    return String(valor).split(',').map(i => i.trim()).filter(Boolean);
}

function getIdSelecionado() {
    return idSelecionado !== null && idSelecionado !== undefined ? String(idSelecionado) : null;
}

function getValorCampo(item, aliases, fallback = '') {
    if (!item) return fallback;
    for (const alias of aliases) {
        const valor = item[alias];
        if (valor !== null && valor !== undefined && valor !== '') return valor;
    }
    return fallback;
}

function getValorCampoInput(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

// ─── Gerenciamento de Configurações (localStorage) ───────────────────────────

// Valores padrão de configuração
const CONFIG_DEFAULTS = {
    mongoHost: '192.168.1.1:27017',
    postgresHost: 'postgres-ufs-ed.crhmjqwbzcke.us-east-1.rds.amazonaws.com'
};

const STORAGE_KEY = 'crud-config';

/**
 * Carrega as configurações do localStorage
 */
function carregarConfigurações() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        
        if (stored) {
            configAtual = JSON.parse(stored);
        } else {
            configAtual = { ...CONFIG_DEFAULTS };
        }
        
        // Preenche os campos com valores salvos
        document.getElementById('pg-host').value = configAtual.postgresHost || CONFIG_DEFAULTS.postgresHost;
        document.getElementById('mg-host').value = configAtual.mongoHost || CONFIG_DEFAULTS.mongoHost;
        
        console.log('✓ Configurações carregadas do localStorage');
    } catch (err) {
        console.warn('Erro ao carregar configurações:', err);
        configAtual = { ...CONFIG_DEFAULTS };
        document.getElementById('pg-host').value = CONFIG_DEFAULTS.postgresHost;
        document.getElementById('mg-host').value = CONFIG_DEFAULTS.mongoHost;
    }
}

/**
 * Salva as configurações no localStorage
 */
function salvarConfigurações() {
    const postgresHost = document.getElementById('pg-host').value.trim();
    const mongoHost = document.getElementById('mg-host').value.trim();

    if (!postgresHost || !mongoHost) {
        alert('⚠️ Preencha ambos os endereços de host para salvar as configurações.');
        return false;
    }

    try {
        const config = {
            postgresHost,
            mongoHost
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        configAtual = config;
        
        alert('✓ Configurações salvas localmente!');
        console.log('✓ Configurações salvas no localStorage');
        return true;
    } catch (err) {
        alert('❌ Erro ao salvar: ' + err.message);
        return false;
    }
}

/**
 * Toggle para mostrar/ocultar campo de editar host PostgreSQL
 */
function toggleConfigPG() {
    const chk = document.getElementById('chk-editar-config-pg');
    const input = document.getElementById('pg-host');
    input.style.display = chk.checked ? 'block' : 'none';
    
    if (chk.checked) {
        input.focus();
    }
}

/**
 * Toggle para mostrar/ocultar campo de editar host MongoDB
 */
function toggleConfigMG() {
    const chk = document.getElementById('chk-editar-config-mg');
    const input = document.getElementById('mg-host');
    input.style.display = chk.checked ? 'block' : 'none';

    if (chk.checked) {
        input.focus();
    }
}

// ─── Gerenciamento de Enums ──────────────────────────────────────────────────

/**
 * Carrega os enums disponíveis do servidor
 */
async function carregarEnums() {
    try {
        const res = await fetch('/api/enums');
        if (res.ok) {
            const data = await res.json();
            enumsDisponíveis = data.enums || {};
            console.log('✓ Enums carregados:', enumsDisponíveis);
        }
    } catch (err) {
        console.warn('Erro ao carregar enums:', err);
    }
}


// ─── Seleção de Banco ─────────────────────────────────────────────────────────
function escolherBanco(tipo) {
    document.getElementById('tela-selecao').style.display = 'none';
    if (tipo === 'postgres') {
        document.getElementById('tela-login-postgres').style.display = 'flex';
        carregarConfigurações(); // Carrega as configurações salvas
    } else {
        document.getElementById('tela-login-mongo').style.display = 'flex';
        carregarConfigurações(); // Carrega as configurações salvas
    }
}

function voltarSelecao() {
    document.getElementById('tela-login-postgres').style.display = 'none';
    document.getElementById('tela-login-mongo').style.display = 'none';
    document.getElementById('chk-editar-config-pg').checked = false;
    document.getElementById('chk-editar-config-mg').checked = false;
    toggleConfigPG();
    toggleConfigMG();
    document.getElementById('tela-selecao').style.display = 'flex';
}

/**
 * Retorna à tela de seleção de banco após estar no dashboard
 * Limpa o estado da aplicação
 */
function trocarBancoDados() {
    // Limpa estado global
    cacheDados = [];
    entidadeAtiva = 'usuario';
    idSelecionado = null;
    modoFormulario = 'ADD';
    bancoAtivo = null;
    
    // Oculta dashboard e modal
    document.getElementById('tela-dashboard').style.display = 'none';
    document.getElementById('modal-formulario').style.display = 'none';
    
    // Limpa campos de login
    document.getElementById('pg-user').value = '';
    document.getElementById('pg-pass').value = '';
    document.getElementById('mg-user').value = '';
    document.getElementById('mg-pass').value = '';
    document.getElementById('mg-host').value = '';
    document.getElementById('pg-host').value = '';
    
    // Limpa checkboxes de configuração
    document.getElementById('chk-editar-config-pg').checked = false;
    document.getElementById('chk-editar-config-mg').checked = false;
    toggleConfigPG();
    toggleConfigMG();
    
    // Volta à seleção
    document.getElementById('tela-selecao').style.display = 'flex';
}

// ─── Conexão PostgreSQL ───────────────────────────────────────────────────────
document.getElementById('btn-conectar-postgres').addEventListener('click', async () => {
    const usuario = document.getElementById('pg-user').value.trim();
    const senha   = document.getElementById('pg-pass').value;
    const host    = document.getElementById('pg-host').value.trim();
    const editando = document.getElementById('chk-editar-config-pg').checked;

    if (!usuario || !senha) return alert('Preencha usuário e senha.');
    
    // Se está editando, salva a nova configuração no localStorage
    if (editando && host) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                postgresHost: host,
                mongoHost: configAtual.mongoHost || CONFIG_DEFAULTS.mongoHost
            }));
            console.log('✓ Configuração PostgreSQL salva');
        } catch (err) {
            return alert('Erro ao salvar configuração: ' + err.message);
        }
    }

    const res = await fetch('/api/conectar/postgres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha, host: host || configAtual.postgresHost })
    });

    if (res.ok) {
        bancoAtivo = 'postgres';
        document.getElementById('tela-login-postgres').style.display = 'none';
        document.getElementById('tela-dashboard').style.display = 'grid';
        document.getElementById('status-banco').innerHTML =
            `<span class="badge-postgres">🐘 PostgreSQL RDS</span> &nbsp; Usuário: ${usuario}`;
        carregarDados();
    } else {
        const err = await res.json();
        alert(err.mensagem || 'Falha ao conectar.');
    }
});

// ─── Conexão MongoDB ──────────────────────────────────────────────────────────
document.getElementById('btn-conectar-mongo').addEventListener('click', async () => {
    const usuario = document.getElementById('mg-user').value.trim();
    const senha   = document.getElementById('mg-pass').value;
    const host    = document.getElementById('mg-host').value.trim();
    const editando = document.getElementById('chk-editar-config-mg').checked;

    if (!usuario || !senha || !host) return alert('Preencha usuário, senha e endereço IPv4.');

    // Se está editando, salva a nova configuração no localStorage
    if (editando) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                postgresHost: configAtual.postgresHost || CONFIG_DEFAULTS.postgresHost,
                mongoHost: host
            }));
            console.log('✓ Configuração MongoDB salva');
        } catch (err) {
            return alert('Erro ao salvar configuração: ' + err.message);
        }
    }

    const res = await fetch('/api/conectar/mongo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha, host })
    });

    if (res.ok) {
        bancoAtivo = 'mongo';
        document.getElementById('tela-login-mongo').style.display = 'none';
        document.getElementById('tela-dashboard').style.display = 'grid';
        document.getElementById('status-banco').innerHTML =
            `<span class="badge-mongo">🍃 MongoDB</span> &nbsp; ${host}`;
        carregarDados();
    } else {
        const err = await res.json();
        alert(err.mensagem || 'Falha ao conectar.');
    }
});

// ─── Endpoints e Títulos ──────────────────────────────────────────────────────
function getEndpointEntidade() {
    return { usuario: '/api/usuario', curso: '/api/curso', estudante: '/api/estudante', vinculo: '/api/vinculo' }[entidadeAtiva] || '/api/usuario';
}

function getTituloEntidade() {
    return { usuario: 'Usuário', curso: 'Curso', estudante: 'Estudante', vinculo: 'Vínculo' }[entidadeAtiva] || 'Usuário';
}

// ─── Campos de Formulário ─────────────────────────────────────────────────────

/**
 * Mapeia IDs de formulário para nomes de campos da entidade
 */
function getMapaFormulario() {
    const mapa = {
        usuario: {
            'form-cpf': 'cpf',
            'form-nome': 'nome',
            'form-data': 'data_nascimento',
            'form-email': 'email',
            'form-telefone': 'telefone',
            'form-login': 'login',
            'form-senha': 'senha'
        },
        curso: {
            'form-nome': 'nome',
            'form-grau': 'grau',
            'form-turno': 'turno',
            'form-campus': 'campus',
            'form-nivel': 'nivel'
        },
        estudante: {
            'form-matricula': 'matricula',
            'form-cpf': 'cpf',
            'form-nome': 'nome',
            'form-login': 'login',
            'form-senha': 'senha',
            'form-mc': 'mc',
            'form-ano': 'anoIngresso',
            'form-curso': 'idCurso',
            'form-status': 'status'
        },
        vinculo: {
            'form-idvinculo': 'idVinculo',
            'form-matricula': 'matricula',
            'form-curso': 'idCurso',
            'form-data-entrada': 'dataIngresso',
            'form-status': 'status',
            'form-data-saida': 'dataSaida'
        }
    };
    return mapa[entidadeAtiva] || mapa.usuario;
}

/**
 * Obtém o nome do campo da entidade pelo ID do formulário
 */
function getCampoEntidade(formId) {
    const mapa = getMapaFormulario();
    return mapa[formId] || formId;
}

/**
 * Obtém as opções de enum para um campo do formulário
 */
function getOpcoesEnum(formId) {
    const nomeCampo = getCampoEntidade(formId);
    return (enumsDisponíveis[entidadeAtiva]?.[nomeCampo]) || [];
}

function getCamposFormulario() {
    const campos = {
        usuario: [
            { id: 'form-cpf',      label: 'CPF',               type: 'text',     required: true },
            { id: 'form-nome',     label: 'Nome',              type: 'text',     required: true },
            { id: 'form-data',     label: 'Data de Nascimento',type: 'date' },
            { id: 'form-email',    label: 'E-mails (vírgula)', type: 'text' },
            { id: 'form-telefone', label: 'Telefones (vírgula)',type: 'text' },
            { id: 'form-login',    label: 'Login',             type: 'text',     required: true },
            { id: 'form-senha',    label: 'Senha',             type: 'password', required: true }
        ],
        curso: [
            { id: 'form-nome',   label: 'Nome',  type: 'text', required: true },
            { id: 'form-grau',   label: 'Grau',  type: 'select', required: true },
            { id: 'form-turno',  label: 'Turno', type: 'select', required: true },
            { id: 'form-campus', label: 'Campus',type: 'text' },
            { id: 'form-nivel',  label: 'Nível', type: 'select' }
        ],
        estudante: [
            { id: 'form-matricula', label: 'Matrícula',        type: 'text',    required: true },
            { id: 'form-cpf',       label: 'CPF',              type: 'text',    required: true },
            { id: 'form-nome',      label: 'Nome',             type: 'text',    required: true },
            { id: 'form-login',     label: 'Login',            type: 'text',    required: true },
            { id: 'form-senha',     label: 'Senha',            type: 'password',required: true },
            { id: 'form-mc',        label: 'MC',               type: 'text' },
            { id: 'form-ano',       label: 'Ano de Ingresso',  type: 'number' },
            { id: 'form-curso',     label: 'ID do Curso',      type: 'text',    required: true },
            { id: 'form-status',    label: 'Status do Vínculo',type: 'text',    required: true }
        ],
        vinculo: [
            { id: 'form-idvinculo',    label: 'ID do Vínculo (auto)',      type: 'text' },
            { id: 'form-matricula',    label: 'Matrícula do Estudante',    type: 'text', required: true },
            { id: 'form-curso',        label: 'ID do Curso',               type: 'text', required: true },
            { id: 'form-data-entrada', label: 'Data de Entrada',           type: 'date' },
            { id: 'form-status',       label: 'Status',                    type: 'select', required: true },
            { id: 'form-data-saida',   label: 'Data de Saída',             type: 'date' }
        ]
    };
    return campos[entidadeAtiva] || campos.usuario;
}

function renderizarFormulario() {
    const container = document.getElementById('campos-formulario');
    if (!container) return;
    container.innerHTML = '';
    
    getCamposFormulario().forEach(campo => {
        // Se é um campo de select (enum)
        if (campo.type === 'select') {
            const select = document.createElement('select');
            select.id = campo.id;
            select.name = campo.id;
            select.required = Boolean(campo.required);
            select.className = 'form-field';
            
            // Adiciona opção vazia
            const optionVazia = document.createElement('option');
            optionVazia.value = '';
            optionVazia.textContent = `Selecione ${campo.label.toLowerCase()}`;
            optionVazia.disabled = true;
            optionVazia.selected = true;
            select.appendChild(optionVazia);
            
            // Adiciona opções do enum
            const opcoes = getOpcoesEnum(campo.id);
            opcoes.forEach(opcao => {
                const option = document.createElement('option');
                option.value = opcao.value;
                option.textContent = opcao.label;
                select.appendChild(option);
            });
            
            container.appendChild(select);
        } else {
            // Campos normais (text, password, date, etc.)
            const input = document.createElement('input');
            input.id = campo.id;
            input.name = campo.id;
            input.type = campo.type;
            input.placeholder = campo.label;
            input.required = Boolean(campo.required);
            input.className = 'form-field';
            container.appendChild(input);
        }
    });
}

function preencherFormulario(item) {
    const aliasesPorCampo = {
        'form-cpf':         ['cpf'],
        'form-nome':        ['nome', 'usuarioNome'],
        'form-data':        ['data_nascimento', 'dataNascimento'],
        'form-email':       ['email'],
        'form-telefone':    ['telefone'],
        'form-login':       ['login'],
        'form-senha':       ['senha'],
        'form-grau':        ['grau'],
        'form-turno':       ['turno'],
        'form-campus':      ['campus'],
        'form-nivel':       ['nivel'],
        'form-matricula':   ['mat_estudante', 'matricula'],
        'form-mc':          ['mc', 'MC'],
        'form-ano':         ['ano_ingresso', 'anoIngresso'],
        'form-curso':       ['curso', 'idCurso', 'idcurso'],
        'form-status':      ['status'],
        'form-idvinculo':   ['idVinculo', 'idvinculo'],
        'form-data-entrada':['data_entrada', 'dataIngresso'],
        'form-data-saida':  ['data_saida', 'dataSaida']
    };

    getCamposFormulario().forEach(campo => {
        const input = document.getElementById(campo.id);
        if (!input) return;
        const valor = getValorCampo(item, aliasesPorCampo[campo.id] || [], '');
        if (input.type === 'date' && valor) {
            input.value = String(valor).substring(0, 10);
        } else {
            input.value = Array.isArray(valor) ? valor.join(', ') : (valor || '');
        }
    });
}

function getPayloadFormulario() {
    const payloads = {
        usuario: {
            cpf:             getValorCampoInput('form-cpf').trim(),
            nome:            getValorCampoInput('form-nome').trim(),
            data_nascimento: getValorCampoInput('form-data') || null,
            dataNascimento:  getValorCampoInput('form-data') || null,
            email:           normalizarLista(getValorCampoInput('form-email')),
            telefone:        normalizarLista(getValorCampoInput('form-telefone')),
            login:           getValorCampoInput('form-login').trim(),
            senha:           getValorCampoInput('form-senha')
        },
        curso: {
            nome:   getValorCampoInput('form-nome').trim(),
            grau:   getValorCampoInput('form-grau').trim(),
            turno:  getValorCampoInput('form-turno').trim(),
            campus: getValorCampoInput('form-campus').trim(),
            nivel:  getValorCampoInput('form-nivel').trim()
        },
        estudante: {
            matricula:    getValorCampoInput('form-matricula').trim(),
            mat_estudante:getValorCampoInput('form-matricula').trim(),
            cpf:          getValorCampoInput('form-cpf').trim(),
            mc:           getValorCampoInput('form-mc') || null,
            ano_ingresso: getValorCampoInput('form-ano') || null,
            anoIngresso:  getValorCampoInput('form-ano') || null,
            nome:         getValorCampoInput('form-nome').trim(),
            login:        getValorCampoInput('form-login').trim(),
            senha:        getValorCampoInput('form-senha') || '123456',
            curso:        getValorCampoInput('form-curso') || null,
            idCurso:      getValorCampoInput('form-curso') || null,
            status:       getValorCampoInput('form-status').trim() || 'Ativo'
        },
        vinculo: {
            idVinculo:    getValorCampoInput('form-idvinculo') || null,
            mat_estudante:getValorCampoInput('form-matricula').trim(),
            matricula:    getValorCampoInput('form-matricula').trim(),
            curso:        getValorCampoInput('form-curso') || null,
            idCurso:      getValorCampoInput('form-curso') || null,
            data_entrada: getValorCampoInput('form-data-entrada') || null,
            status:       getValorCampoInput('form-status').trim(),
            data_saida:   getValorCampoInput('form-data-saida') || null
        }
    };
    return payloads[entidadeAtiva] || payloads.usuario;
}

// ─── Renderização da Tabela ───────────────────────────────────────────────────
const corpoTabela    = document.getElementById('corpo-tabela');
const cabecalhoTabela= document.getElementById('cabecalho-tabela');

async function carregarDados() {
    idSelecionado = null;
    
    // Carrega enums para preencher os selects corretamente
    await carregarEnums();
    
    try {
        const res = await fetch(getEndpointEntidade());
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.mensagem || `Erro ao carregar ${getTituloEntidade().toLowerCase()}.`);
        }
        const dados = await res.json();
        cacheDados = Array.isArray(dados) ? dados : [];
    } catch (err) {
        cacheDados = [];
        corpoTabela.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#c0392b;">${err.message}</td></tr>`;
        return;
    }

    const headers = {
        usuario:   ['CPF', 'NOME', 'NASCIMENTO', 'EMAIL', 'TELEFONE', 'LOGIN'],
        curso:     ['ID', 'NOME', 'GRAU', 'TURNO', 'CAMPUS', 'NÍVEL'],
        estudante: ['MATRÍCULA', 'CPF', 'NOME', 'CURSO', 'STATUS', 'MC', 'ANO DE INGRESSO'],
        vinculo:   ['ID', 'ESTUDANTE', 'CURSO', 'DATA DE ENTRADA', 'STATUS', 'DATA DE SAÍDA']
    };

    cabecalhoTabela.innerHTML = headers[entidadeAtiva].map(h => `<th>${h}</th>`).join('');
    renderizarLinhas(cacheDados);
}

function renderizarLinhas(lista) {
    corpoTabela.innerHTML = '';
    lista.forEach(item => {
        const tr = document.createElement('tr');
        const itemId = getValorCampo(item, ['cpf', 'idCurso', 'idcurso', 'mat_estudante', 'matricula', 'idVinculo', 'idvinculo'], '');
        let conteudo = '';

        if (entidadeAtiva === 'usuario') {
            const dataFormt = item.data_nascimento ? new Date(item.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '';
            conteudo = `
                <td>${item.cpf || ''}</td>
                <td>${item.nome || ''}</td>
                <td>${dataFormt}</td>
                <td>${normalizarLista(item.email).join(', ')}</td>
                <td>${normalizarLista(item.telefone).join(', ')}</td>
                <td>${item.login || ''}</td>`;
        } else if (entidadeAtiva === 'curso') {
            conteudo = `
                <td>${getValorCampo(item, ['idCurso', 'idcurso'], '')}</td>
                <td>${item.nome || ''}</td>
                <td>${item.grau || ''}</td>
                <td>${item.turno || ''}</td>
                <td>${item.campus || ''}</td>
                <td>${item.nivel || ''}</td>`;
        } else if (entidadeAtiva === 'estudante') {
            conteudo = `
                <td>${getValorCampo(item, ['mat_estudante', 'matricula'], '')}</td>
                <td>${item.cpf || ''}</td>
                <td>${item.nome || ''}</td>
                <td>${item.nome_curso || item.curso || ''}</td>
                <td>${item.status || ''}</td>
                <td>${item.mc ?? ''}</td>
                <td>${item.ano_ingresso ?? item.anoIngresso ?? ''}</td>`;
        } else if (entidadeAtiva === 'vinculo') {
            conteudo = `
                <td>${getValorCampo(item, ['idVinculo', 'idvinculo'], '')}</td>
                <td>${item.nome_estudante || item.mat_estudante || ''}</td>
                <td>${item.nome_curso || item.curso || ''}</td>
                <td>${item.data_entrada ? new Date(item.data_entrada).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}</td>
                <td>${item.status || ''}</td>
                <td>${item.data_saida ? new Date(item.data_saida).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}</td>`;
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

// ─── Filtro em tempo real ─────────────────────────────────────────────────────
document.getElementById('txt-busca').addEventListener('input', e => {
    const termo = e.target.value.toLowerCase();
    renderizarLinhas(cacheDados.filter(item => JSON.stringify(item).toLowerCase().includes(termo)));
});

// ─── Seleção de Entidade ──────────────────────────────────────────────────────
function selecionarEntidade(novaEntidade) {
    entidadeAtiva = novaEntidade;
    document.querySelectorAll('.sidebar button').forEach(btn =>
        btn.classList.toggle('active', btn.dataset.entidade === novaEntidade));
    document.getElementById('modal-titulo').innerText = `Cadastrar Novo ${getTituloEntidade()}`;
    carregarDados();
}

// ─── Modal: Abrir / Fechar ────────────────────────────────────────────────────
const form  = document.getElementById('form-usuario');
const modal = document.getElementById('modal-formulario');

document.getElementById('open-add-modal').addEventListener('click', () => {
    modoFormulario = 'ADD';
    document.getElementById('modal-titulo').innerText = `Cadastrar Novo ${getTituloEntidade()}`;
    renderizarFormulario();
    form.reset();
    modal.style.display = 'flex';
});

document.getElementById('open-edit-modal').addEventListener('click', () => {
    if (!getIdSelecionado()) return alert(`Selecione um ${getTituloEntidade().toLowerCase()} na tabela primeiro!`);
    modoFormulario = 'EDIT';
    document.getElementById('modal-titulo').innerText = `Editar ${getTituloEntidade()} Existente`;
    const item = cacheDados.find(d =>
        String(getValorCampo(d, ['cpf', 'idCurso', 'idcurso', 'mat_estudante', 'matricula', 'idVinculo', 'idvinculo'], '')) === getIdSelecionado()
    );
    if (!item) return alert(`${getTituloEntidade()} não encontrado no cache local.`);
    renderizarFormulario();
    preencherFormulario(item);
    modal.style.display = 'flex';
});

document.getElementById('close-modal').addEventListener('click', () => modal.style.display = 'none');

// Botão de trocar banco de dados
document.getElementById('btn-trocar-banco').addEventListener('click', () => {
    if (confirm('Deseja retornar à seleção de banco de dados? Os dados não salvos serão perdidos.')) {
        trocarBancoDados();
    }
});

// ─── Formulário: Salvar / Atualizar ──────────────────────────────────────────
form.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = getPayloadFormulario();
    const url     = modoFormulario === 'ADD' ? getEndpointEntidade() : `${getEndpointEntidade()}/${idSelecionado}`;
    const metodo  = modoFormulario === 'ADD' ? 'POST' : 'PUT';

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
        alert('Erro: ' + (err.mensagem || 'Requisição falhou.'));
    }
});

// ─── Excluir ──────────────────────────────────────────────────────────────────
document.getElementById('execute-delete').addEventListener('click', async () => {
    if (!idSelecionado) return alert(`Selecione um ${getTituloEntidade().toLowerCase()} para remover!`);
    if (!confirm(`Tem certeza que deseja deletar o ${getTituloEntidade().toLowerCase()} selecionado?`)) return;

    const res = await fetch(`${getEndpointEntidade()}/${idSelecionado}`, { method: 'DELETE' });
    if (res.ok) {
        carregarDados();
    } else {
        const err = await res.json();
        alert('Erro ao deletar: ' + (err.mensagem || 'Falha na requisição.'));
    }
});
