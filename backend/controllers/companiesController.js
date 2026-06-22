const companiesModel = require("../models/companiesModel");

async function listCompanies(req, res) {
  try {
    const companies = await companiesModel.listarTodas();
    return res.json(companies);
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
    const company = await companiesModel.criar({ nome, cnpj, telefone });
    return res.status(201).json(company);
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
    const company = await companiesModel.atualizar(id, {
      nome,
      cnpj,
      telefone,
    });

    if (!company) {
      return res.status(404).json({ mensagem: "Empresa nao encontrada" });
    }

    return res.json(company);
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
    const deleted = await companiesModel.deletar(id);

    if (!deleted) {
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
