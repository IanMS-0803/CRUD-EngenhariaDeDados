const Estudante   = require('../../models/mongo/estudante');
const Usuario     = require('../../models/mongo/usuario');
const Vinculo     = require('../../models/mongo/vinculo');
const usuarioRepo = require('./usuarioRepo');

async function inserir(dados) {
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
    const estudante = new Estudante({
        matricula:   dados.matricula,
        usuario:     usuario._id,
        mc:          dados.mc ?? null,
        anoIngresso: dados.anoIngresso || dados.ano_ingresso
    });
    await estudante.save();
    return estudante;
}

async function listarTodos() {
    return await Estudante
        .find()
        .populate('usuario', 'nome cpf dataNascimento email telefone login')
        .sort({ matricula: 1 });
}

async function buscarPorMatricula(matricula) {
    const estudante = await Estudante
        .findOne({ matricula })
        .populate('usuario', 'nome cpf dataNascimento email telefone login');
    if (!estudante) throw new Error(`Estudante com matrícula "${matricula}" não encontrado.`);
    return estudante;
}

async function atualizar(dados) {
    const estudante = await Estudante.findOne({ matricula: dados.matricula });
    if (!estudante) throw new Error(`Estudante com matrícula "${dados.matricula}" não encontrado.`);

    await Estudante.findByIdAndUpdate(
        estudante._id,
        { $set: {
            ...(dados.mc          !== undefined && { mc:          dados.mc }),
            ...(dados.anoIngresso !== undefined && { anoIngresso: dados.anoIngresso }),
            ...(dados.ano_ingresso !== undefined && { anoIngresso: dados.ano_ingresso })
        }},
        { new: true, runValidators: true }
    );

    const camposUsuario = {};
    if (dados.nome)           camposUsuario.nome           = dados.nome;
    if (dados.dataNascimento) camposUsuario.dataNascimento = dados.dataNascimento;
    if (dados.email)          camposUsuario.email          = dados.email;
    if (dados.telefone)       camposUsuario.telefone       = dados.telefone;
    if (dados.login)          camposUsuario.login          = dados.login;
    if (dados.senha)          camposUsuario.senha          = dados.senha;

    if (Object.keys(camposUsuario).length > 0) {
        await Usuario.findByIdAndUpdate(estudante.usuario, { $set: camposUsuario }, { runValidators: true });
    }
    return await buscarPorMatricula(dados.matricula);
}

async function deletar(matricula) {
    const estudante = await Estudante.findOne({ matricula });
    if (!estudante) throw new Error(`Estudante com matrícula "${matricula}" não encontrado.`);
    const vinculosExistentes = await Vinculo.countDocuments({ estudante: estudante._id });
    if (vinculosExistentes > 0) {
        throw new Error(`Não é possível remover o estudante: existem ${vinculosExistentes} vínculo(s) associado(s).`);
    }
    await Estudante.findByIdAndDelete(estudante._id);
    await Usuario.findByIdAndDelete(estudante.usuario);
    return { mensagem: `Estudante "${matricula}" e seu usuário foram removidos com sucesso.` };
}

module.exports = { inserir, listarTodos, buscarPorMatricula, atualizar, deletar };
