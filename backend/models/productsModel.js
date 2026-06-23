const db = require("../config/database");

// Consulta padrao de produto que retorna os dados do produto e o nome da empresa relacionada.
// Usa LEFT JOIN para permitir o retorno dos produtos mesmo se a empresa associada estiver ausente.
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

async function listarTodos() {
  // Retorna lista completa de produtos, incluindo nome da empresa.
  // Esse resultado ja contem a informacao de relacionamento com companies.
  const result = await db.query(`${productSelect} ORDER BY p.id`);
  return result.rows;
}

async function buscarPorId(id) {
  // Busca um produto por id, retornando tambem o nome da empresa associada.
  const result = await db.query(`${productSelect} WHERE p.id = $1`, [id]);
  return result.rows[0] || null;
}

async function criar({ nome, preco, quantidade_estoque, empresa_id }) {
  // Insere um produto na tabela products e retorna o registro criado.
  // O campo preco e convertido para float para facilitar o consumo pelo frontend.
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

async function atualizar(id, { nome, preco, quantidade_estoque, empresa_id }) {
  // Atualiza um produto. Campos nao enviados permanecem inalterados via COALESCE.
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

async function deletar(id) {
  // Remove produto pelo id. Retorna true para indicar exclusao bem sucedida.
  const result = await db.query("DELETE FROM products WHERE id = $1", [id]);
  return result.rowCount > 0;
}

module.exports = {
  listarTodos,
  buscarPorId,
  criar,
  atualizar,
  deletar,
};
