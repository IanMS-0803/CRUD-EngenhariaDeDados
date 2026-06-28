const Usuario = require('../../models/mongo/usuario');

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
    await usuario.save();
    return usuario;
}

async function listarTodos() {
    return await Usuario.find().sort({ nome: 1 });
}

async function buscarPorCpf(cpf) {
    const usuario = await Usuario.findOne({ cpf });
    if (!usuario) throw new Error(`Usuário com CPF "${cpf}" não encontrado.`);
    return usuario;
}

async function atualizar(dados) {
    const resultado = await Usuario.findOneAndUpdate(
        { cpf: dados.cpf },
        { $set: {
            ...(dados.nome           && { nome: dados.nome }),
            ...(dados.dataNascimento !== undefined && { dataNascimento: dados.dataNascimento }),
            ...(dados.email          && { email: dados.email }),
            ...(dados.telefone       && { telefone: dados.telefone }),
            ...(dados.login          && { login: dados.login }),
            ...(dados.senha          && { senha: dados.senha })
        }},
        { new: true, runValidators: true }
    );
    if (!resultado) throw new Error(`Usuário com CPF "${dados.cpf}" não encontrado para atualização.`);
    return resultado;
}

async function deletar(cpf) {
    const resultado = await Usuario.findOneAndDelete({ cpf });
    if (!resultado) throw new Error(`Usuário com CPF "${cpf}" não encontrado para remoção.`);
    return resultado;
}

module.exports = { inserir, listarTodos, buscarPorCpf, atualizar, deletar };
