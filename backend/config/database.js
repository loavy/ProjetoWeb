// Importa o módulo path para manipulação de caminhos
const path = require("path");
// Carrega as variáveis de ambiente do arquivo .env
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Importa o Pool do PostgreSQL para gerenciar conexões
const { Pool } = require("pg");
// Importa bcryptjs para hash de senhas
const bcrypt = require("bcryptjs");

// Lista de variáveis de ambiente obrigatórias para conectar ao banco
const variaveisObrigatorias = [
  "DB_USER",
  "DB_HOST",
  "DB_NAME",
  "DB_PASSWORD",
  "DB_PORT",
];

// Filtra as variáveis obrigatórias que não foram configuradas
const variaveisAusentes = variaveisObrigatorias.filter((nome) => {
  const valor = process.env[nome];
  return typeof valor !== "string" || valor.trim() === "";
});

// Verifica se o banco foi configurado corretamente
const bancoConfigurado = variaveisAusentes.length === 0;

// Exibe aviso se as variáveis obrigatórias não foram configuradas
if (!bancoConfigurado) {
  console.warn(
    `Banco nao configurado. Variaveis ausentes no .env: ${variaveisAusentes.join(
      ", ",
    )}`,
  );
}

// Cria o pool de conexão se o banco foi configurado, senão cria um objeto dummy que lança erro
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

// Se o banco foi configurado, testa a conexão
if (bancoConfigurado) {
  pool.connect((erro, client, release) => {
    if (erro) {
      // Exibe erro se não conseguir conectar
      console.error("Erro ao conectar ao PostgreSQL:", erro.message);
      console.error("Verifique suas credenciais no arquivo .env");
    } else {
      // Exibe mensagem de sucesso e informações da conexão
      console.log("Conectado ao PostgreSQL!");
      console.log(`Banco: ${process.env.DB_NAME}`);
      console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
      release();
    }
  });
}

/**
 * Cria as tabelas do banco de dados se não existirem
 * Cria tabelas: users, companies, products
 */
const criarTabela = async () => {
  // SQL para criar as tabelas
  const sql = `
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
  `;

  try {
    // Executa o SQL de criação de tabelas
    await pool.query(sql);
    // Cria os usuários iniciais
    await criarUsuariosIniciais();
    console.log("Tabelas verificadas/criadas");
  } catch (erro) {
    // Exibe erro se houver falha
    console.error("Erro ao criar tabela:", erro.message);
  }
};

/**
 * Obtém informações de um usuário inicial do arquivo .env
 * @param {string} prefixo - Prefixo do usuário (ex: 'user', 'admin')
 * @param {string} perfilPadrao - Perfil padrão se não especificado
 * @returns {Object|null} Objeto com email, senha e perfil, ou null
 */
function getUsuarioInicial(prefixo, perfilPadrao) {
  // Obtém o email da variável de ambiente
  const email = process.env[`${prefixo}_EMAIL`];
  // Obtém a senha da variável de ambiente
  const senha = process.env[`${prefixo}_SENHA`];
  // Obtém o perfil da variável de ambiente ou usa o perfil padrão
  const perfil = process.env[`${prefixo}_PERFIL`] || perfilPadrao;

  // Retorna null se email ou senha não foram fornecidos
  if (!email || !senha) {
    return null;
  }

  return {
    email,
    senha,
    perfil,
  };
}

/**
 * Cria ou atualiza os usuários iniciais no banco de dados
 * Cria usuários de teste (user e admin) se estiverem configurados no .env
 */
async function criarUsuariosIniciais() {
  // Obtém os usuários iniciais e filtra os nulos
  const usuarios = [
    getUsuarioInicial("user", "user"),
    getUsuarioInicial("admin", "admin"),
  ].filter(Boolean);

  // Itera sobre cada usuário para inseri-lo ou atualizá-lo
  for (const usuario of usuarios) {
    // Faz hash da senha com bcryptjs
    const senhaHash = bcrypt.hashSync(usuario.senha, 10);

    // Insere ou atualiza o usuário no banco de dados
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

// Se o banco foi configurado, cria as tabelas e usuários iniciais
if (bancoConfigurado) {
  criarTabela();
}

// Define o tipo de cliente do banco para referência
pool.client = "postgresql";

// Exporta o pool de conexão para uso na aplicação
module.exports = pool;
