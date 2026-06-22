const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const variaveisObrigatorias = [
  "DB_USER",
  "DB_HOST",
  "DB_NAME",
  "DB_PASSWORD",
  "DB_PORT",
];

const variaveisAusentes = variaveisObrigatorias.filter((nome) => {
  const valor = process.env[nome];
  return typeof valor !== "string" || valor.trim() === "";
});

const bancoConfigurado = variaveisAusentes.length === 0;

if (!bancoConfigurado) {
  console.warn(
    `Banco nao configurado. Variaveis ausentes no .env: ${variaveisAusentes.join(
      ", ",
    )}`,
  );
}

const pool = bancoConfigurado
  ? new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT, 10),
    })
  : {
      query() {
        throw new Error(
          `Banco nao configurado. Crie um .env com: ${variaveisObrigatorias.join(
            ", ",
          )}`,
        );
      },
    };

if (bancoConfigurado) {
  pool.connect((erro, client, release) => {
    if (erro) {
      console.error("Erro ao conectar ao PostgreSQL:", erro.message);
      console.error("Verifique suas credenciais no arquivo .env");
    } else {
      console.log("Conectado ao PostgreSQL!");
      console.log(`Banco: ${process.env.DB_NAME}`);
      console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      release();
    }
  });
}

const criarTabela = async () => {
  const sql = `
    CREATE EXTENSION IF NOT EXISTS unaccent;

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(150) UNIQUE NOT NULL,
      senha VARCHAR(255) NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS perfil VARCHAR(30) NOT NULL DEFAULT 'user';

    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(300) NOT NULL,
      cnpj VARCHAR(30) UNIQUE NOT NULL,
      telefone VARCHAR(50),
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(300) NOT NULL,
      preco NUMERIC(12,2) NOT NULL,
      quantidade_estoque INTEGER NOT NULL,
      empresa_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS avaliacao (
      id SERIAL PRIMARY KEY,
      nivel VARCHAR(80) NOT NULL DEFAULT 'base'
    );

    CREATE TABLE IF NOT EXISTS vestibular (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(180) NOT NULL,
      ano INTEGER,
      instituicao VARCHAR(180)
    );

    CREATE TABLE IF NOT EXISTS subtopico (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(180) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questao (
      id SERIAL PRIMARY KEY,
      avaliacao_id INTEGER REFERENCES avaliacao(id) ON DELETE SET NULL,
      vestibular_id INTEGER REFERENCES vestibular(id) ON DELETE SET NULL,
      subtopico_id INTEGER REFERENCES subtopico(id) ON DELETE SET NULL,
      enunciado TEXT NOT NULL,
      tipo VARCHAR(80) DEFAULT 'base',
      conteudo TEXT,
      bloco TEXT,
      explicacao TEXT,
      comentario_especialista TEXT,
      link_explicacao TEXT,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alternativa (
      id SERIAL PRIMARY KEY,
      questao_id INTEGER NOT NULL REFERENCES questao(id) ON DELETE CASCADE,
      letra VARCHAR(8),
      texto TEXT,
      correta BOOLEAN DEFAULT false
    );

    INSERT INTO avaliacao (id, nivel)
    VALUES (1, 'base')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO subtopico (id, nome)
    VALUES (1, 'Geral')
    ON CONFLICT (id) DO NOTHING;

    SELECT setval(
      pg_get_serial_sequence('avaliacao', 'id'),
      GREATEST((SELECT MAX(id) FROM avaliacao), 1)
    );

    SELECT setval(
      pg_get_serial_sequence('subtopico', 'id'),
      GREATEST((SELECT MAX(id) FROM subtopico), 1)
    );
  `;

  try {
    await pool.query(sql);
    await criarUsuariosIniciais();
    console.log("Tabelas verificadas/criadas");
  } catch (erro) {
    console.error("Erro ao criar tabela:", erro.message);
  }
};

function getUsuarioInicial(prefixo, perfilPadrao) {
  const email = process.env[`${prefixo}_EMAIL`];
  const senha = process.env[`${prefixo}_SENHA`];
  const perfil = process.env[`${prefixo}_PERFIL`] || perfilPadrao;

  if (!email || !senha) {
    return null;
  }

  return {
    email,
    senha,
    perfil,
  };
}

async function criarUsuariosIniciais() {
  const usuarios = [
    getUsuarioInicial("user", "user"),
    getUsuarioInicial("admin", "admin"),
  ].filter(Boolean);

  for (const usuario of usuarios) {
    const senhaHash = bcrypt.hashSync(usuario.senha, 10);

    await pool.query(
      `
      INSERT INTO users (email, senha, perfil)
      VALUES ($1, $2, $3)
      ON CONFLICT (email)
      DO UPDATE SET senha = EXCLUDED.senha,
                    perfil = EXCLUDED.perfil
      `,
      [usuario.email, senhaHash, usuario.perfil],
    );
  }
}

if (bancoConfigurado) {
  criarTabela();
}

// attach client name for server info
pool.client = "postgresql";

module.exports = pool;
