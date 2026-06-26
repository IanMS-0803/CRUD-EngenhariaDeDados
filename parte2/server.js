const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { uri } = require('./config/database');

// Importando os nossos repositórios recém-criados
const usuarioRepo = require('./repositories/usuarioRepo');
const cursoRepo = require('./repositories/cursoRepo');
const estudanteRepo = require('./repositories/estudanteRepo');
const vinculoRepo = require('./repositories/vinculoRepo');

const app = express();
const PORT = process.env.PORT || 3000;

// Permite que o servidor entenda JSON (o formato que o frontend envia)
app.use(express.json());

// Diz ao servidor onde estão os arquivos visuais (index.html, app.js)
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================================
// ROTAS DE COMUNICAÇÃO (O que faz os botões funcionarem)
// ==========================================================

// ==========================================================
// ROTAS DE COMUNICAÇÃO 
// ==========================================================

const tratarErro = (res, e) => res.status(400).json({ mensagem: e.message });

// --- Usuários ---
app.get('/api/usuario', async (req, res) => { try { res.json(await usuarioRepo.listarTodos()); } catch(e) { tratarErro(res, e); }});
app.post('/api/usuario', async (req, res) => { try { res.json(await usuarioRepo.inserir(req.body)); } catch(e) { tratarErro(res, e); }});
app.put('/api/usuario/:id', async (req, res) => { 
    try { const dados = req.body; dados.cpf = req.params.id; res.json(await usuarioRepo.atualizar(dados)); } catch(e) { tratarErro(res, e); }
});
app.delete('/api/usuario/:id', async (req, res) => { try { res.json(await usuarioRepo.deletar(req.params.id)); } catch(e) { tratarErro(res, e); }});

// --- Cursos ---
app.get('/api/curso', async (req, res) => { try { res.json(await cursoRepo.listarTodos()); } catch(e) { tratarErro(res, e); }});
app.post('/api/curso', async (req, res) => { try { res.json(await cursoRepo.inserir(req.body)); } catch(e) { tratarErro(res, e); }});
app.put('/api/curso/:id', async (req, res) => { try { res.json(await cursoRepo.atualizar(req.params.id, req.body)); } catch(e) { tratarErro(res, e); }});
app.delete('/api/curso/:id', async (req, res) => { try { res.json(await cursoRepo.deletar(req.params.id)); } catch(e) { tratarErro(res, e); }});

// --- Estudantes ---
app.get('/api/estudante', async (req, res) => { try { res.json(await estudanteRepo.listarTodos()); } catch(e) { tratarErro(res, e); }});
app.post('/api/estudante', async (req, res) => { try { res.json(await estudanteRepo.inserir(req.body)); } catch(e) { tratarErro(res, e); }});
app.put('/api/estudante/:id', async (req, res) => { 
    try { const dados = req.body; dados.matricula = req.params.id; res.json(await estudanteRepo.atualizar(dados)); } catch(e) { tratarErro(res, e); }
});
app.delete('/api/estudante/:id', async (req, res) => { try { res.json(await estudanteRepo.deletar(req.params.id)); } catch(e) { tratarErro(res, e); }});

// --- Vínculos ---
app.get('/api/vinculo', async (req, res) => { try { res.json(await vinculoRepo.listarTodos()); } catch(e) { tratarErro(res, e); }});
app.post('/api/vinculo', async (req, res) => { try { res.json(await vinculoRepo.inserir(req.body)); } catch(e) { tratarErro(res, e); }});
app.put('/api/vinculo/:id', async (req, res) => { 
    try { const dados = req.body; dados.idVinculo = req.params.id; res.json(await vinculoRepo.atualizar(dados)); } catch(e) { tratarErro(res, e); }
});
app.delete('/api/vinculo/:id', async (req, res) => { try { res.json(await vinculoRepo.deletar(req.params.id)); } catch(e) { tratarErro(res, e); }});
// ==========================================================
// INICIANDO O SERVIDOR
// ==========================================================
mongoose.connect(uri)
    .then(() => {
        console.log("Banco de dados conectado com sucesso!");
        app.listen(PORT, () => {
            console.log(`Servidor rodando perfeitamente! Acesse no navegador: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Erro ao iniciar a conexão com o MongoDB:", err);
    });