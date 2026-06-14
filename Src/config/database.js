const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

// Estado global das conexões (Substitui o DatabaseContext)
let postgresPool = null;
let mongoClient = null;
let dbAtivo = null; // 'postgres' ou 'mongo'

function conectarPostgres(user, password) {
    postgresPool = new Pool({
        user: user,
        password: password,
        host: 'postgres-ufs-ed.crhmjqwbzcke.us-east-1.rds.amazonaws.com', // URL do seu RDS AWS
        database: 'BancoUFS',
        port: 5432,
        ssl: { rejectUnauthorized: false } // Necessário para a maioria dos RDS AWS
    });
    dbAtivo = 'postgres';
    return postgresPool;
}

async function conectarMongo(user, password) {
    const uri = `mongodb+srv://${user}:${password}@seu-cluster.mongodb.net/?retryWrites=true&w=majority`;
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    dbAtivo = 'mongo';
    return mongoClient.db('universidade');
}

function getDbAtivo() {
    if (dbAtivo === 'postgres') return postgresPool;
    if (dbAtivo === 'mongo') return mongoClient.db('universidade');
    throw new Error("Nenhum banco de dados configurado ou ativo.");
}

module.exports = { conectarPostgres, conectarMongo, getDbAtivo, status: () => dbAtivo };