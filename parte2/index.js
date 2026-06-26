const mongoose = require('mongoose');

// URL da AWS
const uri = "mongodb://admin:senha_projeto_321@54.80.143.37:27017/universidade?authSource=admin";

mongoose.connect(uri)
  .then(() => console.log('✅ Conectado ao MongoDB no EC2 (AWS) com sucesso!\n---'))
  .catch(err => console.error('❌ Erro de conexão:', err));

// --- SCHEMAS ---
const cursoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  codigo: { type: String, required: true, unique: true }
});

const estudanteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  matricula: { type: String, required: true, unique: true }
});

const usuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  tipo: { type: String, enum: ['Admin', 'Comum'], required: true }
});

const vinculoSchema = new mongoose.Schema({
  estudante_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Estudante', required: true },
  curso_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Curso', required: true },
  status: { type: String, enum: ['Ativo', 'Trancado', 'Concluído'], required: true }
});

const Curso = mongoose.model('Curso', cursoSchema);
const Estudante = mongoose.model('Estudante', estudanteSchema);
const Usuario = mongoose.model('Usuario', usuarioSchema);
const Vinculo = mongoose.model('Vinculo', vinculoSchema);

// --- CRUD ---
async function executarApresentacao() {
  // Espera 1 segundo para garantir a conexão
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('--- 🧹 LIMPANDO BANCO (Desativado para preservar os dados) ---');
  /*await Curso.deleteMany({});
  await Estudante.deleteMany({});
  await Vinculo.deleteMany({});*/

  console.log('\n--- 1. INSERINDO DADOS (CREATE) ---');
  // Gera um número único com base no milissegundo atual
  const timestamp = Date.now();
  const codigoUnico = `ED101-${timestamp}`;
  const matriculaUnica = `2026001-${timestamp}`;

  const cursoED = new Curso({ nome: 'Engenharia de Dados', codigo: codigoUnico });
  await cursoED.save();
  
  const alunoIan = new Estudante({ nome: 'Ian Marcel Santos Santana', matricula: matriculaUnica });
  await alunoIan.save();

  const novoVinculo = new Vinculo({
    estudante_id: alunoIan._id,
    curso_id: cursoED._id,
    status: 'Ativo'
  });
  await novoVinculo.save();
  console.log('Estudante, Curso e Vínculo criados na nuvem!');

  console.log('\n--- 2. BUSCANDO DADOS (READ) ---');
  // Busca exatamente o vínculo que acabamos de criar
  const vinculoSalvo = await Vinculo.findById(novoVinculo._id).populate('curso_id estudante_id');
  console.log('Vínculo ativo encontrado:', vinculoSalvo.estudante_id.nome, '->', vinculoSalvo.curso_id.nome);

  console.log('\n--- 3. ATUALIZANDO DADOS (UPDATE) ---');
  // Atualiza usando o código único gerado nesta execução
  const cursoAtualizado = await Curso.findOneAndUpdate(
    { codigo: codigoUnico }, 
    { nome: 'Engenharia de Dados Avançada' }, 
    { returnDocument: 'after' } 
  );
  console.log(`Nome do curso alterado para: ${cursoAtualizado.nome}`);

  console.log('\n--- 4. DELETANDO DADOS (DELETE) ---');
  const vinculosAtivos = await Vinculo.countDocuments({ curso_id: cursoAtualizado._id });
  
  if (vinculosAtivos > 0) {
    console.log(`🔒 BLOQUEADO (Integridade Referencial): Não é possível excluir o curso. Existem ${vinculosAtivos} vínculo(s) dependendo dele.`);
  } else {
    await Curso.findByIdAndDelete(cursoAtualizado._id);
    console.log('Curso excluído com sucesso!');
  }

  console.log('\n✅ Apresentação finalizada. Pode apertar Ctrl+C.');
  process.exit(0); // Força o encerramento limpo do script
}

executarApresentacao();