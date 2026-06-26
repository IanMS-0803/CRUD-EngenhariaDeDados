/**
 * ================================================================
 *  REPOSITORY: usuarioRepo
 *  Gerencia todas as operações CRUD da coleção "usuarios"
 * ================================================================
 */

const Usuario = require('../models/usuario');

// ── CREATE ──────────────────────────────────────────────────────
/**
 * Insere um novo usuário no banco.
 * O Mongoose valida automaticamente: CPF (11 dígitos), login único,
 * campos obrigatórios (NOT NULL) e formato dos e-mails (domínio).
 */
async function inserir(dados) {
    const usuario = new Usuario({
        cpf:            dados.cpf,
        nome:           dados.nome,
        dataNascimento: dados.dataNascimento || null,
        email:          dados.email   || [],
        telefone:       dados.telefone || [],
        login:          dados.login,
        senha:          dados.senha
    });

    await usuario.save(); // Dispara todas as validações do Schema
    return usuario;
}

// ── READ ─────────────────────────────────────────────────────────
/** Lista todos os usuários ordenados por nome. */
async function listarTodos() {
    return await Usuario.find().sort({ nome: 1 });
}

/** Busca um único usuário pelo CPF (chave natural). */
async function buscarPorCpf(cpf) {
    const usuario = await Usuario.findOne({ cpf });
    if (!usuario) throw new Error(`Usuário com CPF "${cpf}" não encontrado.`);
    return usuario;
}

// ── UPDATE ───────────────────────────────────────────────────────
/**
 * Atualiza os dados de um usuário identificado pelo CPF.
 * runValidators: true garante que as restrições de domínio e NOT NULL
 * também são aplicadas nas atualizações parciais.
 */
async function atualizar(dados) {
    const resultado = await Usuario.findOneAndUpdate(
        { cpf: dados.cpf },
        {
            $set: {
                ...(dados.nome           && { nome: dados.nome }),
                ...(dados.dataNascimento !== undefined && { dataNascimento: dados.dataNascimento }),
                ...(dados.email          && { email: dados.email }),
                ...(dados.telefone       && { telefone: dados.telefone }),
                ...(dados.login          && { login: dados.login }),
                ...(dados.senha          && { senha: dados.senha })
            }
        },
        { new: true, runValidators: true }
    );

    if (!resultado) throw new Error(`Usuário com CPF "${dados.cpf}" não encontrado para atualização.`);
    return resultado;
}

// ── DELETE ───────────────────────────────────────────────────────
/**
 * Remove um usuário pelo CPF.
 * ATENÇÃO: a deleção em cascata (remover o Estudante vinculado)
 * é coordenada pelo estudanteRepo para manter a integridade referencial.
 */
async function deletar(cpf) {
    const resultado = await Usuario.findOneAndDelete({ cpf });
    if (!resultado) throw new Error(`Usuário com CPF "${cpf}" não encontrado para remoção.`);
    return resultado;
}

module.exports = { inserir, listarTodos, buscarPorCpf, atualizar, deletar };
