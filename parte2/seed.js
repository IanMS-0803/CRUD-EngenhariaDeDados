const mongoose = require('mongoose');
const config = require('./config/database');
const uri = config.uri;
const Usuario = require('./models/usuario');
const Estudante = require('./models/estudante');
const Curso = require('./models/curso');
const Vinculo = require('./models/vinculo');

async function popularBanco() {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB!");

        // Limpa tudo para evitar duplicação
        await Vinculo.deleteMany({});
        await Estudante.deleteMany({});
        await Curso.deleteMany({});
        await Usuario.deleteMany({});

        // 1. INSERE USUÁRIOS E MAPEIA OS IDs
        const dadosUsuarios = [
            { cpf: "22222222201", nome: "Steve Jobs", dataNascimento: "1990-03-05", email: ["steve@email.com", "steve@apple.com"], login: "steve", senha: "s1" },
            { cpf: "22222222202", nome: "Paul Bell", dataNascimento: "1999-09-15", email: ["bell@email.com"], login: "paul", senha: "s2" },
            { cpf: "22222222203", nome: "Alan Turing", dataNascimento: "1912-07-23", login: "alan", senha: "s3" },
            { cpf: "22222222204", nome: "John Hopcroft", dataNascimento: "1939-10-07", email: ["hopcroft@lfc.com"], login: "john", senha: "s4" },
            { cpf: "22222222205", nome: "Ada Lovelace", dataNascimento: "1985-11-27", login: "ada", senha: "s5" },
            { cpf: "22222222206", nome: "Grace Hooper", dataNascimento: "1996-12-10", email: ["hooper@linguagens.com"], login: "grace", senha: "s5" },
            { cpf: "22222222207", nome: "Charles Babbage", dataNascimento: "1971-12-26", login: "charles", senha: "s6" },
            { cpf: "22222222208", nome: "Musa al-Khwarizmi", dataNascimento: "1950-12-26", login: "musa", senha: "s7" },
            { cpf: "22222222209", nome: "Cesar Lattes", dataNascimento: "1924-06-11", email: ["cesar@cnpq.com", "lattes@curriculo.com"], login: "lattes", senha: "s8" },
            { cpf: "22222222210", nome: "Donald Knuth", dataNascimento: "1938-01-10", email: ["knuth@algorithms.com"], login: "knuth", senha: "s9" },
            { cpf: "22222222211", nome: "Abraham Silberschatz", dataNascimento: "1956-01-10", email: ["silberchatz@sgbd.com"], login: "abraham", senha: "s10" },
            { cpf: "22222222212", nome: "Elmasri Navathe", dataNascimento: "1944-03-24", login: "elmasri", senha: "s11" },
            { cpf: "22222222213", nome: "Ramakrishnam Raghu", dataNascimento: "1965-08-22", login: "raghu", senha: "s12" }
        ];
        const users = await Usuario.insertMany(dadosUsuarios);
        
        // Dicionário relacionando o CPF do SQL com o _id do MongoDB
        const userMap = {};
        users.forEach(u => userMap[u.cpf] = u._id);

        // 2. INSERE CURSOS E MAPEIA OS IDs
        const dadosCursos = [
            { nome: "Ciência da Computação", grau: "Bacharelado", turno: "Vespertino", campus: "São Cristóvão", nivel: "Graduação" },
            { nome: "Sistemas de Informação", grau: "Bacharelado", turno: "Noturno", campus: "São Cristóvão", nivel: "Graduação" },
            { nome: "Sistemas de Informação", grau: "Bacharelado", turno: "Matutino", campus: "Itabaiana", nivel: "Graduação" },
            { nome: "Engenharia de Computação", grau: "Bacharelado", turno: "Vespertino", campus: "São Cristóvão", nivel: "Graduação" },
            { nome: "Inteligência Artificial", grau: "Bacharelado", turno: "Vespertino", campus: "São Cristóvão", nivel: "Graduação" }
        ];
        const cursos = await Curso.insertMany(dadosCursos);
        
        // Dicionário relacionando os IDs originais do SQL (1 a 5) com os novos _ids
        const cursoMap = {
            1: cursos[0]._id,
            2: cursos[1]._id,
            3: cursos[2]._id,
            4: cursos[3]._id,
            5: cursos[4]._id
        };

        // 3. INSERE ESTUDANTES (USANDO AS CHAVES GERADAS ACIMA)
        const dadosEstudantes = [
            { matricula: 'E101', usuario: userMap['22222222201'], mc: 7.0, anoIngresso: 2021 },
            { matricula: 'E102', usuario: userMap['22222222202'], mc: 8.3, anoIngresso: 2021 },
            { matricula: 'E103', usuario: userMap['22222222203'], mc: 6.7, anoIngresso: 2021 },
            { matricula: 'E104', usuario: userMap['22222222204'], mc: 0, anoIngresso: 2021 },
            { matricula: 'E105', usuario: userMap['22222222205'], mc: 9, anoIngresso: 2022 },
            { matricula: 'E106', usuario: userMap['22222222206'], mc: 7.7, anoIngresso: 2022 },
            { matricula: 'E107', usuario: userMap['22222222207'], mc: 5.5, anoIngresso: 2022 },
            { matricula: 'E108', usuario: userMap['22222222208'], mc: 6.5, anoIngresso: 2023 },
            { matricula: 'E109', usuario: userMap['22222222209'], mc: 6.0, anoIngresso: 2023 },
            { matricula: 'E110', usuario: userMap['22222222210'], mc: 2.1, anoIngresso: 2023 },
            { matricula: 'E111', usuario: userMap['22222222211'], mc: 3.3, anoIngresso: 2023 },
            { matricula: 'E112', usuario: userMap['22222222212'], mc: 4.5, anoIngresso: 2024 },
            { matricula: 'E113', usuario: userMap['22222222213'], mc: 8.1, anoIngresso: 2024 }
        ];
        const estudantes = await Estudante.insertMany(dadosEstudantes);
        
        // Dicionário relacionando matrícula ao _id
        const estMap = {};
        estudantes.forEach(e => estMap[e.matricula] = e._id);

        // 4. INSERE VÍNCULOS
        const dadosVinculos = [
            { estudante: estMap['E101'], curso: cursoMap[3], status: 'Ativo' },
            { estudante: estMap['E102'], curso: cursoMap[2], status: 'Ativo' },
            { estudante: estMap['E103'], curso: cursoMap[1], status: 'Ativo' },
            { estudante: estMap['E104'], curso: cursoMap[4], status: 'Ativo' },
            { estudante: estMap['E105'], curso: cursoMap[1], status: 'Ativo' },
            { estudante: estMap['E106'], curso: cursoMap[1], status: 'Ativo' },
            { estudante: estMap['E107'], curso: cursoMap[1], status: 'Ativo' },
            { estudante: estMap['E108'], curso: cursoMap[5], status: 'Ativo' },
            { estudante: estMap['E109'], curso: cursoMap[1], status: 'Ativo' },
            { estudante: estMap['E110'], curso: cursoMap[5], status: 'Ativo' },
            { estudante: estMap['E111'], curso: cursoMap[4], status: 'Ativo' },
            { estudante: estMap['E112'], curso: cursoMap[2], status: 'Ativo' },
            { estudante: estMap['E113'], curso: cursoMap[2], status: 'Ativo' }
        ];
        await Vinculo.insertMany(dadosVinculos);

        console.log("Seed concluído com SUCESSO! Banco populado perfeitamente.");
        process.exit(0);
    } catch (error) {
        console.error("Erro no seed:", error);
        process.exit(1);
    }
}

popularBanco();