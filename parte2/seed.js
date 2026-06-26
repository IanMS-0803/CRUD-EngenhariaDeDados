const mongoose = require('mongoose');

const uri = "mongodb://admin:senha_projeto_321@54.80.143.37:27017/universidade?authSource=admin";

// 1. Schemas Básicos
const CursoSchema = new mongoose.Schema({
    nome: String,
    codigo: String
});
const Curso = mongoose.model('Curso', CursoSchema);

const EstudanteSchema = new mongoose.Schema({
    nome: String,
    matricula: String
});
const Estudante = mongoose.model('Estudante', EstudanteSchema);

const VinculoSchema = new mongoose.Schema({
    estudanteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Estudante' },
    cursoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Curso' },
    status: String
});
const Vinculo = mongoose.model('Vinculo', VinculoSchema);

async function popularBanco() {
    try {
        await mongoose.connect(uri);
        console.log("✅ Conectado ao MongoDB no EC2 (AWS) para popular os dados!");

        // 2. Cursos
        const cursos = await Curso.insertMany([
            { nome: "Arquitetura de Computadores e Portas Lógicas", codigo: "COMP101" },
            { nome: "Desenvolvimento de Motores de Jogos", codigo: "JOG202" },
            { nome: "Análise Estatística Esportiva", codigo: "EST303" }
        ]);
        console.log("📚 Cursos adicionados!");

        // 3. Estudantes
        const estudantes = await Estudante.insertMany([
            { nome: "Ian Marcel Santos Santana", matricula: "20260001" },
            { nome: "Edno", matricula: "20260002" },
            { nome: "José Mazzola", matricula: "20260003" }
        ]);
        console.log("🎓 Estudantes adicionados!");

        // 4. Vínculos
        await Vinculo.insertMany([
            { estudanteId: estudantes[0]._id, cursoId: cursos[0]._id, status: "Ativo" }, // Ian em Arquitetura
            { estudanteId: estudantes[1]._id, cursoId: cursos[1]._id, status: "Ativo" }, // Edno em Jogos
            { estudanteId: estudantes[2]._id, cursoId: cursos[2]._id, status: "Trancado" } // Mazzola trancado
        ]);
        console.log("🔗 Vínculos criados com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao popular banco:", error);
    } finally {
        await mongoose.disconnect();
        console.log("👋 Conexão encerrada.");
    }
}

popularBanco();