const Curso   = require('../../models/mongo/curso');
const Vinculo = require('../../models/mongo/vinculo');

async function inserir(dados) {
    const curso = new Curso({
        nome:   dados.nome,
        grau:   dados.grau,
        turno:  dados.turno,
        campus: dados.campus || null,
        nivel:  dados.nivel  || null
    });
    await curso.save();
    return curso;
}

async function listarTodos() {
    return await Curso.find().sort({ nome: 1 });
}

async function buscarPorId(id) {
    const curso = await Curso.findById(id);
    if (!curso) throw new Error(`Curso com id "${id}" não encontrado.`);
    return curso;
}

async function atualizar(dados) {
    const resultado = await Curso.findByIdAndUpdate(
        dados.idCurso,
        { $set: {
            ...(dados.nome   && { nome:   dados.nome }),
            ...(dados.grau   && { grau:   dados.grau }),
            ...(dados.turno  && { turno:  dados.turno }),
            ...(dados.campus !== undefined && { campus: dados.campus }),
            ...(dados.nivel  !== undefined && { nivel:  dados.nivel })
        }},
        { new: true, runValidators: true }
    );
    if (!resultado) throw new Error(`Curso com id "${dados.idCurso}" não encontrado para atualização.`);
    return resultado;
}

async function deletar(idCurso) {
    const vinculosExistentes = await Vinculo.countDocuments({ curso: idCurso });
    if (vinculosExistentes > 0) {
        throw new Error(`Não é possível remover o curso: existem ${vinculosExistentes} vínculo(s) associado(s).`);
    }
    const resultado = await Curso.findByIdAndDelete(idCurso);
    if (!resultado) throw new Error(`Curso com id "${idCurso}" não encontrado para remoção.`);
    return resultado;
}

module.exports = { inserir, listarTodos, buscarPorId, atualizar, deletar };
