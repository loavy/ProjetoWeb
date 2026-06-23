// Importa o módulo de conexão com o banco de dados
const db = require("../config/database");

// Query base para selecionar produtos com informações da empresa associada
const productSelect = `
  SELECT
    p.id,
    p.nome,
    p.preco::float AS preco,
    p.quantidade_estoque,
    p.empresa_id,
    c.nome AS empresa_nome,
    p.criado_em
  FROM products p
  LEFT JOIN companies c
    ON c.id = p.empresa_id
`;

/**
 * Lista todos os produtos do banco de dados
 * @returns {Promise<Array>} Array com todos os produtos
 */
async function listarTodos() {
  // Executa a query e retorna os produtos ordenados por ID
  const result = await db.query(`${productSelect} ORDER BY p.id`);
  return result.rows;
}

/**
 * Busca um produto específico pelo ID
 * @param {number} id - ID do produto a buscar
 * @returns {Promise<Object|null>} Retorna o produto ou null se não encontrado
 */
async function buscarPorId(id) {
  // Executa a query com o ID fornecido
  const result = await db.query(`${productSelect} WHERE p.id = $1`, [id]);
  // Retorna o primeiro resultado ou null
  return result.rows[0] || null;
}

/**
 * Cria um novo produto no banco de dados
 * @param {Object} dados - Objeto com nome, preco, quantidade_estoque e empresa_id
 * @returns {Promise<Object>} Retorna o produto criado
 */
async function criar({ nome, preco, quantidade_estoque, empresa_id }) {
  // Executa INSERT e retorna os dados do produto criado
  const result = await db.query(
    `
    INSERT INTO products (nome, preco, quantidade_estoque, empresa_id)
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      nome,
      preco::float AS preco,
      quantidade_estoque,
      empresa_id,
      criado_em
    `,
    [nome, preco, quantidade_estoque, empresa_id],
  );

  return result.rows[0];
}

/**
 * Atualiza um produto existente no banco de dados
 * @param {number} id - ID do produto a atualizar
 * @param {Object} dados - Objeto com os campos a atualizar (nome, preco, quantidade_estoque, empresa_id)
 * @returns {Promise<Object|null>} Retorna o produto atualizado ou null
 */
async function atualizar(id, { nome, preco, quantidade_estoque, empresa_id }) {
  // Executa UPDATE usando COALESCE para manter valores anteriores se não fornecidos
  const result = await db.query(
    `
    UPDATE products
    SET nome = COALESCE($1, nome),
        preco = COALESCE($2, preco),
        quantidade_estoque = COALESCE($3, quantidade_estoque),
        empresa_id = COALESCE($4, empresa_id)
    WHERE id = $5
    RETURNING
      id,
      nome,
      preco::float AS preco,
      quantidade_estoque,
      empresa_id,
      criado_em
    `,
    [
      nome || null,
      preco ?? null,
      quantidade_estoque ?? null,
      empresa_id || null,
      id,
    ],
  );

  return result.rows[0] || null;
}

/**
 * Deleta um produto do banco de dados
 * @param {number} id - ID do produto a deletar
 * @returns {Promise<boolean>} Retorna true se deletou, false se não encontrado
 */
async function deletar(id) {
  // Executa DELETE e verifica se alguma linha foi afetada
  const result = await db.query("DELETE FROM products WHERE id = $1", [id]);
  // Retorna true se pelo menos uma linha foi deletada
  return result.rowCount > 0;
}

// Exporta todas as funções do modelo de produtos
module.exports = {
  listarTodos,
  buscarPorId,
  criar,
  atualizar,
  deletar,
};
