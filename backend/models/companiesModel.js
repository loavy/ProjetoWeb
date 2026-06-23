const db = require("../config/database");

// Retorna todas as empresas ordenadas por id.
// O frontend usa esse endpoint para preencher a tabela de empresas.
async function listarTodas() {
  const result = await db.query("SELECT * FROM companies ORDER BY id");
  return result.rows;
}

async function buscarPorId(id) {
  // Busca uma empresa pelo id e retorna null se nao existir.
  // Isso e usado pelo controller para validar relacoes de produto.
  const result = await db.query("SELECT * FROM companies WHERE id = $1", [id]);
  return result.rows[0] || null;
}

async function criar({ nome, cnpj, telefone }) {
  // Insere nova empresa e retorna o registro criado.
  // O cnpj e unico no banco e falhas de duplicidade sao tratadas no controller.
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
  // Atualiza apenas os campos enviados. Valores null nao sobrescrevem os dados existentes.
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
  // Remove empresa pelo id. Retorna true se algum registro for deletado.
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
