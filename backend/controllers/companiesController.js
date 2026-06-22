const db = require("../config/database");

async function listCompanies(req, res) {
  try {
    const result = await db.query("SELECT * FROM companies ORDER BY id");
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao listar empresas" });
  }
}

async function createCompany(req, res) {
  const { nome, cnpj, telefone } = req.body;

  if (!nome || !cnpj) {
    return res.status(400).json({ mensagem: "Nome e CNPJ obrigatorios" });
  }

  try {
    const result = await db.query(
      "INSERT INTO companies (nome, cnpj, telefone) VALUES ($1, $2, $3) RETURNING *",
      [nome, cnpj, telefone || null],
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err && err.code === "23505") {
      return res.status(409).json({ mensagem: "CNPJ ja cadastrado" });
    }

    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao criar empresa" });
  }
}

async function updateCompany(req, res) {
  const { id } = req.params;
  const { nome, cnpj, telefone } = req.body;

  try {
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

    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: "Empresa nao encontrada" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    if (err && err.code === "23505") {
      return res.status(409).json({ mensagem: "CNPJ ja cadastrado" });
    }

    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao atualizar empresa" });
  }
}

async function deleteCompany(req, res) {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM companies WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: "Empresa nao encontrada" });
    }

    return res.json({ mensagem: "Empresa removida" });
  } catch (err) {
    if (err && err.code === "23503") {
      return res.status(400).json({
        mensagem: "Nao e possivel remover empresa com produtos vinculados",
      });
    }

    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao remover empresa" });
  }
}

module.exports = {
  listCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
};
