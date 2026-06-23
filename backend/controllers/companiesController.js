// Importa o modelo de dados para gerenciar empresas
const companiesModel = require("../models/companiesModel");

/**
 * Lista todas as empresas disponíveis
 * @param {Object} req - Objeto da requisição
 * @param {Object} res - Objeto da resposta
 * @returns {Object} Retorna JSON com a lista de empresas
 */
async function listCompanies(req, res) {
  try {
    // Busca todas as empresas no banco de dados
    const companies = await companiesModel.listarTodas();
    // Retorna as empresas em formato JSON
    return res.json(companies);
  } catch (err) {
    // Log do erro para debug
    console.error(err);
    // Retorna erro 500 em caso de falha
    return res.status(500).json({ mensagem: "Erro ao listar empresas" });
  }
}

/**
 * Cria uma nova empresa
 * @param {Object} req - Objeto da requisição (body contém nome, cnpj, telefone)
 * @param {Object} res - Objeto da resposta
 * @returns {Object} Retorna a empresa criada
 */
async function createCompany(req, res) {
  // Extrai os dados do corpo da requisição
  const { nome, cnpj, telefone } = req.body;

  // Valida se os campos obrigatórios foram fornecidos
  if (!nome || !cnpj) {
    return res.status(400).json({ mensagem: "Nome e CNPJ obrigatorios" });
  }

  try {
    // Cria a nova empresa no banco de dados
    const company = await companiesModel.criar({ nome, cnpj, telefone });
    // Retorna a empresa criada com status 201 (Created)
    return res.status(201).json(company);
  } catch (err) {
    // Trata erro de violação de chave única (CNPJ duplicado)
    if (err && err.code === "23505") {
      return res.status(409).json({ mensagem: "CNPJ ja cadastrado" });
    }

    // Log do erro para debug
    console.error(err);
    // Retorna erro 500 em caso de falha
    return res.status(500).json({ mensagem: "Erro ao criar empresa" });
  }
}

/**
 * Atualiza uma empresa existente
 * @param {Object} req - Objeto da requisição (params contém id, body contém dados a atualizar)
 * @param {Object} res - Objeto da resposta
 * @returns {Object} Retorna a empresa atualizada
 */
async function updateCompany(req, res) {
  // Extrai o ID do parâmetro da URL
  const { id } = req.params;
  // Extrai os dados do corpo da requisição
  const { nome, cnpj, telefone } = req.body;

  try {
    // Atualiza a empresa no banco de dados
    const company = await companiesModel.atualizar(id, {
      nome,
      cnpj,
      telefone,
    });

    // Se a empresa não foi encontrada, retorna status 404
    if (!company) {
      return res.status(404).json({ mensagem: "Empresa nao encontrada" });
    }

    // Retorna a empresa atualizada
    return res.json(company);
  } catch (err) {
    // Trata erro de violação de chave única (CNPJ duplicado)
    if (err && err.code === "23505") {
      return res.status(409).json({ mensagem: "CNPJ ja cadastrado" });
    }

    // Log do erro para debug
    console.error(err);
    // Retorna erro 500 em caso de falha
    return res.status(500).json({ mensagem: "Erro ao atualizar empresa" });
  }
}

/**
 * Deleta uma empresa
 * @param {Object} req - Objeto da requisição (params contém id)
 * @param {Object} res - Objeto da resposta
 * @returns {Object} Retorna mensagem de sucesso ou erro
 */
async function deleteCompany(req, res) {
  // Extrai o ID do parâmetro da URL
  const { id } = req.params;

  try {
    // Deleta a empresa com o ID fornecido
    const deleted = await companiesModel.deletar(id);

    // Se nenhuma empresa foi deletada, retorna status 404
    if (!deleted) {
      return res.status(404).json({ mensagem: "Empresa nao encontrada" });
    }

    // Retorna mensagem de sucesso
    return res.json({ mensagem: "Empresa removida" });
  } catch (err) {
    // Trata erro de violação de chave estrangeira (produtos vinculados)
    if (err && err.code === "23503") {
      return res.status(400).json({
        mensagem: "Nao e possivel remover empresa com produtos vinculados",
      });
    }

    // Log do erro para debug
    console.error(err);
    // Retorna erro 500 em caso de falha
    return res.status(500).json({ mensagem: "Erro ao remover empresa" });
  }
}

// Exporta todas as funções para uso em outros arquivos (routes)
module.exports = {
  listCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
};
