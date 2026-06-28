const Vinculo   = require('../../models/mongo/vinculo');
const Estudante = require('../../models/mongo/estudante');
const Curso     = require('../../models/mongo/curso');

async function inserir(dados) {
    const estudante = await Estudante.findById(dados.estudanteId);
    if (!estudante) throw new Error(`Estudante com id "${dados.estudanteId}" não encontrado.`);
    const curso = await Curso.findById(dados.cursoId);
    if (!curso) throw new Error(`Curso com id "${dados.cursoId}" não encontrado.`);

    const vinculo = new Vinculo({
        estudante:    estudante._id,
        curso:        curso._id,
        dataIngresso: dados.dataIngresso || Date.now(),
        status:       dados.status || 'Ativo',
        dataSaida:    dados.dataSaida || null
    });
    await vinculo.save();
    return vinculo;
}

async function listarTodos() {
    return await Vinculo
        .find()
        .populate({ path: 'estudante', populate: { path: 'usuario', select: 'nome cpf' } })
        .populate('curso', 'nome grau turno campus')
        .sort({ dataIngresso: -1 });
}

async function buscarPorId(id) {
    const vinculo = await Vinculo
        .findById(id)
        .populate({ path: 'estudante', populate: { path: 'usuario', select: 'nome cpf' } })
        .populate('curso', 'nome grau turno campus');
    if (!vinculo) throw new Error(`Vínculo com id "${id}" não encontrado.`);
    return vinculo;
}

async function atualizar(dados) {
    if (dados.cursoId) {
        const curso = await Curso.findById(dados.cursoId);
        if (!curso) throw new Error(`Curso com id "${dados.cursoId}" não encontrado.`);
    }
    const resultado = await Vinculo.findByIdAndUpdate(
        dados.idVinculo,
        { $set: {
            ...(dados.cursoId      && { curso:        dados.cursoId }),
            ...(dados.status       && { status:       dados.status }),
            ...(dados.dataIngresso && { dataIngresso: dados.dataIngresso }),
            ...(dados.dataSaida !== undefined && { dataSaida: dados.dataSaida })
        }},
        { new: true, runValidators: true }
    );
    if (!resultado) throw new Error(`Vínculo com id "${dados.idVinculo}" não encontrado para atualização.`);
    return resultado;
}

async function deletar(idVinculo) {
    const resultado = await Vinculo.findByIdAndDelete(idVinculo);
    if (!resultado) throw new Error(`Vínculo com id "${idVinculo}" não encontrado para remoção.`);
    return resultado;
}

module.exports = { inserir, listarTodos, buscarPorId, atualizar, deletar };
