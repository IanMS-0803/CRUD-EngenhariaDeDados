/**
 * ================================================================
 *  REPOSITORY: vinculoRepo
 *  Gerencia todas as operações CRUD da coleção "vinculos"
 * ================================================================
 */

const Vinculo   = require('../models/vinculo');
const Estudante = require('../models/estudante');
const Curso     = require('../models/curso');

// ── CREATE ──────────────────────────────────────────────────────
/**
 * Cria um vínculo entre um Estudante e um Curso.
 *
 * ✅ INTEGRIDADE REFERENCIAL (verificação explícita antes de inserir):
 *    Busca o Estudante e o Curso pelos IDs fornecidos. Se qualquer um
 *    não existir no banco, lança erro — impedindo vínculos órfãos.
 *    Equivalente à violação de FK no modelo relacional.
 */
async function inserir(dados) {
    // Verifica se o Estudante existe
    const estudante = await Estudante.findById(dados.estudanteId);
    if (!estudante) {
        throw new Error(
            `Integridade referencial violada: Estudante com id "${dados.estudanteId}" não encontrado.`
        );
    }

    // Verifica se o Curso existe
    const curso = await Curso.findById(dados.cursoId);
    if (!curso) {
        throw new Error(
            `Integridade referencial violada: Curso com id "${dados.cursoId}" não encontrado.`
        );
    }

    const vinculo = new Vinculo({
        estudante:   estudante._id,
        curso:       curso._id,
        dataIngresso: dados.dataIngresso || Date.now(),
        status:      dados.status || 'Ativo',
        dataSaida:   dados.dataSaida || null
    });

    await vinculo.save(); // Mongoose valida enum (status) e required
    return vinculo;
}

// ── READ ─────────────────────────────────────────────────────────
/**
 * Lista todos os vínculos com JOIN aninhado:
 *   vinculos → estudantes → usuarios (para obter o nome do estudante)
 *   vinculos → cursos
 */
async function listarTodos() {
    return await Vinculo
        .find()
        .populate({
            path: 'estudante',
            populate: { path: 'usuario', select: 'nome cpf' }
        })
        .populate('curso', 'nome grau turno campus')
        .sort({ dataIngresso: -1 });
}

/** Busca um vínculo pelo seu _id com dados completos. */
async function buscarPorId(id) {
    const vinculo = await Vinculo
        .findById(id)
        .populate({ path: 'estudante', populate: { path: 'usuario', select: 'nome cpf' } })
        .populate('curso', 'nome grau turno campus');
    if (!vinculo) throw new Error(`Vínculo com id "${id}" não encontrado.`);
    return vinculo;
}

// ── UPDATE ───────────────────────────────────────────────────────
/**
 * Atualiza um vínculo.
 * Se o cursoId for alterado, valida se o novo curso existe (integridade referencial).
 */
async function atualizar(dados) {
    // Se o curso for alterado, valida existência
    if (dados.cursoId) {
        const curso = await Curso.findById(dados.cursoId);
        if (!curso) {
            throw new Error(
                `Integridade referencial violada: Curso com id "${dados.cursoId}" não encontrado.`
            );
        }
    }

    const resultado = await Vinculo.findByIdAndUpdate(
        dados.idVinculo,
        {
            $set: {
                ...(dados.cursoId      && { curso:        dados.cursoId }),
                ...(dados.status       && { status:       dados.status }),
                ...(dados.dataIngresso && { dataIngresso: dados.dataIngresso }),
                ...(dados.dataSaida !== undefined && { dataSaida: dados.dataSaida })
            }
        },
        { new: true, runValidators: true }
    );

    if (!resultado) throw new Error(`Vínculo com id "${dados.idVinculo}" não encontrado para atualização.`);
    return resultado;
}

// ── DELETE ───────────────────────────────────────────────────────
/** Remove um vínculo pelo seu _id. */
async function deletar(idVinculo) {
    const resultado = await Vinculo.findByIdAndDelete(idVinculo);
    if (!resultado) throw new Error(`Vínculo com id "${idVinculo}" não encontrado para remoção.`);
    return resultado;
}

module.exports = { inserir, listarTodos, buscarPorId, atualizar, deletar };
