const db = require("../config/database");

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
  const result = await db.query(`${productSelect} ORDER BY p.id`);
  return result.rows;
}

async function buscarPorId(id) {
  const result = await db.query(`${productSelect} WHERE p.id = $1`, [id]);
  return result.rows[0] || null;
}

async function criar({ nome, preco, quantidade_estoque, empresa_id }) {
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
    [nome || null, preco ?? null, quantidade_estoque ?? null, empresa_id || null, id],
  );

  return result.rows[0] || null;
}

async function deletar(id) {
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
