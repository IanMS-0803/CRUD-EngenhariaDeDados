const express = require('express');
const path = require('path');
const db = require('./config/database');
const usuarioRepo = require('./repositories/usuarioRepo');
const cursoRepo = require('./repositories/cursoRepo');
const estudanteRepo = require('./repositories/estudanteRepo');
const vinculoRepo = require('./repositories/vinculoRepo');

const app = express();
const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Rota de Conexão/Login
app.post('/api/conectar', async (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ status: 'erro', mensagem: 'Usuário e senha são obrigatórios.' });
    }

    try {
        const pool = db.conectarPostgres(usuario, senha);
        await pool.query('SELECT 1');
        res.json({ status: 'sucesso', mensagem: 'Conexão estabelecida com sucesso.' });
    } catch (error) {
        res.status(401).json({ status: 'erro', mensagem: 'Erro de autenticação: ' + error.message });
    }
});

// Rotas do CRUD de Usuários
app.get('/api/usuario', async (req, res) => {
    try {
        const dados = await usuarioRepo.listarTodos();
        res.json(dados);
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

app.post('/api/usuario', async (req, res) => {
    try {
        await usuarioRepo.inserir(req.body);
        res.json({ status: 'sucesso', mensagem: 'Usuário inserido!' });
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

app.put('/api/usuario/:cpf', async (req, res) => {
    try {
        await usuarioRepo.atualizar({ ...req.body, cpf: req.params.cpf });
        res.json({ status: 'sucesso', message: 'Usuário atualizado!' });
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

app.delete('/api/usuario/:cpf', async (req, res) => {
    try {
        await usuarioRepo.deletar(req.params.cpf);
        res.json({ status: 'sucesso', mensagem: 'Usuário removido!' });
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

// Rotas do CRUD de Cursos
app.get('/api/curso', async (req, res) => {
    try {
        const dados = await cursoRepo.listarTodos();
        res.json(dados);
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

app.post('/api/curso', async (req, res) => {
    try {
        await cursoRepo.inserir(req.body);
        res.json({ status: 'sucesso', mensagem: 'Curso inserido!' });
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

app.put('/api/curso/:id', async (req, res) => {
    try {
        await cursoRepo.atualizar({ ...req.body, idCurso: req.params.id });
        res.json({ status: 'sucesso', mensagem: 'Curso atualizado!' });
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

app.delete('/api/curso/:id', async (req, res) => {
    try {
        await cursoRepo.deletar(req.params.id);
        res.json({ status: 'sucesso', mensagem: 'Curso removido!' });
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

// Rotas do CRUD de Estudantes
app.get('/api/estudante', async (req, res) => {
    try {
        const dados = await estudanteRepo.listarTodos();
        res.json(dados);
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

app.post('/api/estudante', async (req, res) => {
    try {
        await estudanteRepo.inserir(req.body);
        res.json({ status: 'sucesso', mensagem: 'Estudante inserido!' });
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

app.put('/api/estudante/:mat', async (req, res) => {
    try {
        await estudanteRepo.atualizar({ ...req.body, matricula: req.params.mat });
        res.json({ status: 'sucesso', mensagem: 'Estudante atualizado!' });
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

app.delete('/api/estudante/:mat', async (req, res) => {
    try {
        await estudanteRepo.deletar(req.params.mat);
        res.json({ status: 'sucesso', mensagem: 'Estudante removido!' });
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

// Rotas do CRUD de Vínculos
app.get('/api/vinculo', async (req, res) => {
    try {
        const dados = await vinculoRepo.listarTodos();
        res.json(dados);
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

app.post('/api/vinculo', async (req, res) => {
    try {
        await vinculoRepo.inserir(req.body);
        res.json({ status: 'sucesso', mensagem: 'Vínculo inserido!' });
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

app.put('/api/vinculo/:id', async (req, res) => {
    try {
        await vinculoRepo.atualizar({ ...req.body, idVinculo: req.params.id });
        res.json({ status: 'sucesso', mensagem: 'Vínculo atualizado!' });
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

app.delete('/api/vinculo/:id', async (req, res) => {
    try {
        await vinculoRepo.deletar(req.params.id);
        res.json({ status: 'sucesso', mensagem: 'Vínculo removido!' });
    } catch (error) {
        res.status(error.message && /Nenhum banco de dados|connect/i.test(error.message) ? 503 : 500).json({ status: 'erro', mensagem: error.message || 'Erro inesperado.' });
    }
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));