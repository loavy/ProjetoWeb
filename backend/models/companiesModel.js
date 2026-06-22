const db = require("../config/database");

async function listarTodas() {
  const result = await db.query("SELECT * FROM companies ORDER BY id");
  return result.rows;
}

async function buscarPorId(id) {
  const result = await db.query("SELECT * FROM companies WHERE id = $1", [id]);
  return result.rows[0] || null;
}

async function criar({ nome, cnpj, telefone }) {
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

async function atualizar(id, { nome, cnpj, telefone }) {
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

async function deletar(id) {
  const result = await db.query("DELETE FROM companies WHERE id = $1", [id]);
  return result.rowCount > 0;
}

module.exports = {
  listarTodas,
  buscarPorId,
  criar,
  atualizar,
  deletar,
};
