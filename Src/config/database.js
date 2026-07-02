const { Pool } = require('pg');
const mongoose = require('mongoose');
const configManager = require('./configManager');

let postgresPool = null;
let activeDb = null; // 'postgres' ou 'mongo'

function conectarPostgres(user, password, host = null) {
    if (!user || !password) {
        throw new Error('Usuário e senha são obrigatórios para conexão PostgreSQL.');
    }

    // Usa o host fornecido ou carrega do arquivo config
    const postgresHost = host || configManager.getPostgresHost();

    const pool = new Pool({
        user,
        password,
        host: postgresHost,
        database: 'BancoUFS',
        port: 5432,
        ssl: { rejectUnauthorized: false }
    });

    return pool;
}

function ativarPostgres(pool) {
    postgresPool = pool;
    activeDb = 'postgres';
}

async function conectarMongo(user, password, host) {
    if (!user || !password || !host) {
        throw new Error('Usuário, senha e endereço IPv4 são obrigatórios para conexão MongoDB.');
    }

    const encodedUser = encodeURIComponent(user);
    const encodedPassword = encodeURIComponent(password);
    const trimmedHost = host.trim();
    const uri = `mongodb://${encodedUser}:${encodedPassword}@${trimmedHost}/universidade?authSource=admin`;

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    activeDb = 'mongo';
    return mongoose.connection;
}

function estaAtiva() {
    if (activeDb === 'postgres') return !!postgresPool;
    if (activeDb === 'mongo') return mongoose.connection.readyState === 1;
    return false;
}

function getTipo() {
    return activeDb;
}

function getDbAtivo() {
    if (activeDb === 'postgres') return postgresPool;
    if (activeDb === 'mongo') return mongoose.connection;
    throw new Error('Nenhuma conexão de banco de dados ativa. Conecte-se antes de usar a API.');
}

async function verificarPostgres() {
    if (!postgresPool) throw new Error('PostgreSQL não está conectado.');
    await postgresPool.query('SELECT 1');
}

module.exports = {
    conectarPostgres,
    ativarPostgres,
    conectarMongo,
    getTipo,
    getDbAtivo,
    estaAtiva,
    verificarPostgres,
    configManager
};
