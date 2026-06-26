/**
 * ================================================================
 *  REPOSITORY: cursoRepo
 *  Gerencia todas as operações CRUD da coleção "cursos"
 * ================================================================
 */

const Curso   = require('../models/curso');
const Vinculo = require('../models/vinculo');

// ── CREATE ──────────────────────────────────────────────────────
/**
 * Insere um novo curso.
 * O Mongoose valida grau, turno e nivel via enum (restrição de domínio).
 */
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

// ── READ ─────────────────────────────────────────────────────────
/** Lista todos os cursos ordenados por nome. */
async function listarTodos() {
    return await Curso.find().sort({ nome: 1 });
}

/** Busca um curso pelo _id do MongoDB. */
async function buscarPorId(id) {
    const curso = await Curso.findById(id);
    if (!curso) throw new Error(`Curso com id "${id}" não encontrado.`);
    return curso;
}

// ── UPDATE ───────────────────────────────────────────────────────
/** Atualiza os dados de um curso pelo seu _id. */
async function atualizar(dados) {
    const resultado = await Curso.findByIdAndUpdate(
        dados.idCurso,
        {
            $set: {
                ...(dados.nome   && { nome:   dados.nome }),
                ...(dados.grau   && { grau:   dados.grau }),
                ...(dados.turno  && { turno:  dados.turno }),
                ...(dados.campus !== undefined && { campus: dados.campus }),
                ...(dados.nivel  !== undefined && { nivel:  dados.nivel })
            }
        },
        { new: true, runValidators: true }
    );

    if (!resultado) throw new Error(`Curso com id "${dados.idCurso}" não encontrado para atualização.`);
    return resultado;
}

// ── DELETE ───────────────────────────────────────────────────────
/**
 * Remove um curso SOMENTE SE não existirem vínculos associados.
 *
 * ✅ INTEGRIDADE REFERENCIAL (ON DELETE RESTRICT):
 *    Equivalente ao comportamento de uma FK com RESTRICT no SQL.
 *    Se existir qualquer vínculo apontando para este curso,
 *    a operação é bloqueada com erro explicativo.
 */
async function deletar(idCurso) {
    const vinculosExistentes = await Vinculo.countDocuments({ curso: idCurso });

    if (vinculosExistentes > 0) {
        throw new Error(
            `Não é possível remover o curso: existem ${vinculosExistentes} vínculo(s) associado(s). ` +
            'Remova ou transfira os vínculos antes de deletar o curso.'
        );
    }

    const resultado = await Curso.findByIdAndDelete(idCurso);
    if (!resultado) throw new Error(`Curso com id "${idCurso}" não encontrado para remoção.`);
    return resultado;
}

module.exports = { inserir, listarTodos, buscarPorId, atualizar, deletar };
