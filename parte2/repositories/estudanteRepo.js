/**
 * ================================================================
 *  REPOSITORY: estudanteRepo
 *  Gerencia todas as operações CRUD da coleção "estudantes"
 * ================================================================
 *
 *  Como no SQL, todo Estudante é também um Usuário (herança/especialização).
 *  Portanto:
 *  - inserir()  → cria primeiro o Usuario, depois o Estudante referenciando-o
 *  - deletar()  → remove o Estudante E o Usuario em cascata (se não houver vínculos)
 *  - listarTodos() → usa populate() para fazer JOIN com usuarios
 * ================================================================
 */

const Estudante   = require('../models/estudante');
const Usuario     = require('../models/usuario');
const Vinculo     = require('../models/vinculo');
const usuarioRepo = require('./usuarioRepo');

// ── CREATE ──────────────────────────────────────────────────────
/**
 * Insere um Estudante com TODOS os campos do esquema SQL:
 *   - matricula, anoIngresso, mc (campos próprios de Estudante)
 *   - cpf, nome, dataNascimento, email, telefone, login, senha (campos de Usuario)
 *
 * Fluxo:
 *   1. Cria o Usuario com os dados pessoais (ou reutiliza se o CPF já existe)
 *   2. Cria o Estudante referenciando o _id do Usuario criado
 */
async function inserir(dados) {
    // Passo 1: cria o Usuario (dados pessoais — lado "pai" da herança)
    let usuario = await Usuario.findOne({ cpf: dados.cpf });

    if (!usuario) {
        usuario = await usuarioRepo.inserir({
            cpf:            dados.cpf,
            nome:           dados.nome,
            dataNascimento: dados.dataNascimento || null,
            email:          dados.email    || [],
            telefone:       dados.telefone || [],
            login:          dados.login    || dados.matricula.toLowerCase(),
            senha:          dados.senha    || '123456'
        });
    }

    // Passo 2: cria o Estudante com TODOS os campos do esquema SQL
    const estudante = new Estudante({
        matricula:   dados.matricula,
        usuario:     usuario._id,        // FK → Usuario (integridade referencial)
        mc:          dados.mc ?? null,   // Média de Conclusão (pode ser null inicialmente)
        anoIngresso: dados.anoIngresso
    });

    await estudante.save();
    return estudante;
}

// ── READ ─────────────────────────────────────────────────────────
/**
 * Lista todos os estudantes fazendo JOIN com usuarios via populate().
 * Equivalente ao SELECT com JOIN no SQL.
 */
async function listarTodos() {
    return await Estudante
        .find()
        .populate('usuario', 'nome cpf dataNascimento email telefone login')
        .sort({ matricula: 1 });
}

/** Busca um estudante pela matrícula (chave primária natural). */
async function buscarPorMatricula(matricula) {
    const estudante = await Estudante
        .findOne({ matricula })
        .populate('usuario', 'nome cpf dataNascimento email telefone login');
    if (!estudante) throw new Error(`Estudante com matrícula "${matricula}" não encontrado.`);
    return estudante;
}

// ── UPDATE ───────────────────────────────────────────────────────
/**
 * Atualiza dados do Estudante e/ou do seu Usuario vinculado.
 * Campos de Estudante: mc, anoIngresso
 * Campos de Usuario: nome, dataNascimento, email, telefone, login, senha
 */
async function atualizar(dados) {
    const estudante = await Estudante.findOne({ matricula: dados.matricula });
    if (!estudante) throw new Error(`Estudante com matrícula "${dados.matricula}" não encontrado.`);

    // Atualiza campos próprios do Estudante
    await Estudante.findByIdAndUpdate(
        estudante._id,
        {
            $set: {
                ...(dados.mc          !== undefined && { mc:          dados.mc }),
                ...(dados.anoIngresso !== undefined && { anoIngresso: dados.anoIngresso })
            }
        },
        { new: true, runValidators: true }
    );

    // Atualiza campos do Usuario vinculado (se informados)
    const camposUsuario = {};
    if (dados.nome)           camposUsuario.nome           = dados.nome;
    if (dados.dataNascimento) camposUsuario.dataNascimento = dados.dataNascimento;
    if (dados.email)          camposUsuario.email          = dados.email;
    if (dados.telefone)       camposUsuario.telefone       = dados.telefone;
    if (dados.login)          camposUsuario.login          = dados.login;
    if (dados.senha)          camposUsuario.senha          = dados.senha;

    if (Object.keys(camposUsuario).length > 0) {
        await Usuario.findByIdAndUpdate(
            estudante.usuario,
            { $set: camposUsuario },
            { runValidators: true }
        );
    }

    return await buscarPorMatricula(dados.matricula);
}

// ── DELETE ───────────────────────────────────────────────────────
/**
 * Remove o Estudante E seu Usuario em cascata.
 *
 * ✅ INTEGRIDADE REFERENCIAL:
 *    - RESTRICT: bloqueia se houver vínculos ativos com cursos
 *    - CASCADE:  ao deletar o Estudante, remove também o Usuario
 *                (equivalente ao ON DELETE CASCADE no SQL)
 */
async function deletar(matricula) {
    const estudante = await Estudante.findOne({ matricula });
    if (!estudante) throw new Error(`Estudante com matrícula "${matricula}" não encontrado.`);

    // Verifica vínculos antes de deletar (ON DELETE RESTRICT)
    const vinculosExistentes = await Vinculo.countDocuments({ estudante: estudante._id });
    if (vinculosExistentes > 0) {
        throw new Error(
            `Não é possível remover o estudante: existem ${vinculosExistentes} vínculo(s) associado(s). ` +
            'Remova os vínculos antes de deletar o estudante.'
        );
    }

    // Remove o Estudante
    await Estudante.findByIdAndDelete(estudante._id);

    // Remove o Usuario associado (ON DELETE CASCADE)
    await Usuario.findByIdAndDelete(estudante.usuario);

    return { mensagem: `Estudante "${matricula}" e seu usuário foram removidos com sucesso.` };
}

module.exports = { inserir, listarTodos, buscarPorMatricula, atualizar, deletar };
