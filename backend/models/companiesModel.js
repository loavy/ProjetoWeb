// Importa o módulo de conexão com o banco de dados
const db = require("../config/database");

/**
 * Lista todas as empresas do banco de dados
 * @returns {Promise<Array>} Array com todas as empresas
 */
async function listarTodas() {
  // Executa a query e retorna as empresas ordenadas por ID
  const result = await db.query("SELECT * FROM companies ORDER BY id");
  return result.rows;
}

/**
 * Busca uma empresa específica pelo ID
 * @param {number} id - ID da empresa a buscar
 * @returns {Promise<Object|null>} Retorna a empresa ou null se não encontrada
 */
async function buscarPorId(id) {
  // Executa a query com o ID fornecido
  const result = await db.query("SELECT * FROM companies WHERE id = $1", [id]);
  // Retorna o primeiro resultado ou null
  return result.rows[0] || null;
}

/**
 * Cria uma nova empresa no banco de dados
 * @param {Object} dados - Objeto com nome, cnpj e telefone (opcional)
 * @returns {Promise<Object>} Retorna a empresa criada
 */
async function criar({ nome, cnpj, telefone }) {
  // Executa INSERT e retorna todos os dados da empresa criada
  const result = await db.query(
    `
    INSERT INTO companies (nome, cnpj, telefone)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [nome, cnpj, telefone || null],
  );

  return result.rows[0];
}

/**
 * Atualiza uma empresa existente no banco de dados
 * @param {number} id - ID da empresa a atualizar
 * @param {Object} dados - Objeto com os campos a atualizar (nome, cnpj, telefone)
 * @returns {Promise<Object|null>} Retorna a empresa atualizada ou null
 */
async function atualizar(id, { nome, cnpj, telefone }) {
  // Executa UPDATE usando COALESCE para manter valores anteriores se não fornecidos
  const result = await db.query(
    `
    UPDATE companies
    SET nome = COALESCE($1, nome),
        cnpj = COALESCE($2, cnpj),
        telefone = COALESCE($3, telefone)
    WHERE id = $4
    RETURNING *
    `,
    [nome || null, cnpj || null, telefone || null, id],
  );

  return result.rows[0] || null;
}

/**
 * Deleta uma empresa do banco de dados
 * @param {number} id - ID da empresa a deletar
 * @returns {Promise<boolean>} Retorna true se deletou, false se não encontrada
 */
async function deletar(id) {
  // Executa DELETE e verifica se alguma linha foi afetada
  const result = await db.query("DELETE FROM companies WHERE id = $1", [id]);
  // Retorna true se pelo menos uma linha foi deletada
  return result.rowCount > 0;
}

// Exporta todas as funções do modelo de empresas
module.exports = {
  listarTodas,
  buscarPorId,
  criar,
  atualizar,
  deletar,
};
