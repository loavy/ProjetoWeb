// Importa os modelos de dados necessários para gerenciar produtos e empresas
const companiesModel = require("../models/companiesModel");
const productsModel = require("../models/productsModel");

/**
 * Converte um valor para número
 * @param {*} valor - Valor a ser convertido
 * @returns {number|null} Retorna o número, NaN se inválido, ou null se vazio/nulo
 */
function obterNumero(valor) {
  // Se o valor for undefined, null ou vazio, retorna null
  if (valor === undefined || valor === null || valor === "") {
    return null;
  }

  // Converte para número e valida se é um número finito
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : NaN;
}

/**
 * Converte um valor para número inteiro
 * @param {*} valor - Valor a ser convertido
 * @returns {number|null} Retorna o inteiro, NaN se inválido, ou null se vazio/nulo
 */
function obterInteiro(valor) {
  // Primeiro converte para número usando a função obterNumero
  const numero = obterNumero(valor);

  // Se for null, retorna null
  if (numero === null) {
    return null;
  }

  // Valida se é um inteiro, caso contrário retorna NaN
  return Number.isInteger(numero) ? numero : NaN;
}

/**
 * Valida se todos os campos obrigatórios de um produto estão preenchidos e corretos
 * @param {Object} dados - Objeto com os dados do produto (nome, preco, quantidade_estoque, empresa_id)
 * @returns {string} Retorna mensagem de erro ou string vazia se válido
 */
function validarProdutoObrigatorio({ nome, preco, quantidade_estoque, empresa_id }) {
  // Verifica se todos os campos obrigatórios estão preenchidos
  if (!nome || preco === null || quantidade_estoque === null || empresa_id === null) {
    return "Campos obrigatorios: nome, preco, quantidade_estoque e empresa_id";
  }

  // Valida se o preço é um número válido e não negativo
  if (Number.isNaN(preco) || preco < 0) {
    return "Preco invalido";
  }

  // Valida se a quantidade em estoque é válida e não negativa
  if (Number.isNaN(quantidade_estoque) || quantidade_estoque < 0) {
    return "Quantidade em estoque invalida";
  }

  // Valida se o ID da empresa é válido e maior que zero
  if (Number.isNaN(empresa_id) || empresa_id <= 0) {
    return "empresa_id invalido";
  }

  // Retorna string vazia se tudo está válido
  return "";
}

/**
 * Valida os campos parciais de um produto (para atualização)
 * @param {Object} dados - Objeto com os dados do produto a validar
 * @returns {string} Retorna mensagem de erro ou string vazia se válido
 */
function validarProdutoParcial({ preco, quantidade_estoque, empresa_id }) {
  // Valida preço se foi fornecido
  if (preco !== null && (Number.isNaN(preco) || preco < 0)) {
    return "Preco invalido";
  }

  // Valida quantidade em estoque se foi fornecida
  if (
    quantidade_estoque !== null &&
    (Number.isNaN(quantidade_estoque) || quantidade_estoque < 0)
  ) {
    return "Quantidade em estoque invalida";
  }

  // Valida ID da empresa se foi fornecido
  if (empresa_id !== null && (Number.isNaN(empresa_id) || empresa_id <= 0)) {
    return "empresa_id invalido";
  }

  // Retorna string vazia se tudo está válido
  return "";
}

/**
 * Verifica se uma empresa existe no banco de dados
 * @param {number} empresaId - ID da empresa a verificar
 * @returns {Promise<boolean>} Retorna true se existe, false caso contrário
 */
async function empresaExiste(empresaId) {
  // Busca a empresa pelo ID
  const company = await companiesModel.buscarPorId(empresaId);
  // Retorna true se encontrou, false caso contrário
  return Boolean(company);
}

/**
 * Lista todos os produtos disponíveis
 * @param {Object} req - Objeto da requisição
 * @param {Object} res - Objeto da resposta
 * @returns {Object} Retorna JSON com a lista de produtos
 */
async function listProducts(req, res) {
  try {
    // Busca todos os produtos no banco de dados
    const products = await productsModel.listarTodos();
    // Retorna os produtos em formato JSON
    return res.json(products);
  } catch (err) {
    // Log do erro para debug
    console.error(err);
    // Retorna erro 500 em caso de falha
    return res.status(500).json({ mensagem: "Erro ao listar produtos" });
  }
}

/**
 * Cria um novo produto
 * @param {Object} req - Objeto da requisição (body contém nome, preco, quantidade_estoque, empresa_id)
 * @param {Object} res - Objeto da resposta
 * @returns {Object} Retorna o produto criado com dados da empresa
 */
async function createProduct(req, res) {
  // Extrai e processa os dados do corpo da requisição
  const dados = {
    nome: req.body.nome,
    preco: obterNumero(req.body.preco),
    quantidade_estoque: obterInteiro(req.body.quantidade_estoque),
    empresa_id: obterInteiro(req.body.empresa_id),
  };

  // Valida se todos os campos obrigatórios estão corretos
  const erro = validarProdutoObrigatorio(dados);

  // Se houver erro na validação, retorna status 400
  if (erro) {
    return res.status(400).json({ mensagem: erro });
  }

  try {
    // Verifica se a empresa fornecida existe
    if (!(await empresaExiste(dados.empresa_id))) {
      return res.status(400).json({ mensagem: "empresa_id invalido" });
    }

    // Cria o novo produto no banco de dados
    const product = await productsModel.criar(dados);
    // Busca o produto criado com informações da empresa
    const productWithCompany = await productsModel.buscarPorId(product.id);
    // Retorna o produto criado com status 201 (Created)
    return res.status(201).json(productWithCompany);
  } catch (err) {
    // Log do erro para debug
    console.error(err);
    // Retorna erro 500 em caso de falha
    return res.status(500).json({ mensagem: "Erro ao criar produto" });
  }
}

/**
 * Atualiza um produto existente
 * @param {Object} req - Objeto da requisição (params contém id, body contém dados a atualizar)
 * @param {Object} res - Objeto da resposta
 * @returns {Object} Retorna o produto atualizado com dados da empresa
 */
async function updateProduct(req, res) {
  // Extrai o ID do parâmetro da URL
  const { id } = req.params;

  // Extrai e processa os dados do corpo da requisição
  const dados = {
    nome: req.body.nome,
    preco: obterNumero(req.body.preco),
    quantidade_estoque: obterInteiro(req.body.quantidade_estoque),
    empresa_id: obterInteiro(req.body.empresa_id),
  };

  // Valida se os campos fornecidos estão corretos (validação parcial)
  const erro = validarProdutoParcial(dados);

  // Se houver erro na validação, retorna status 400
  if (erro) {
    return res.status(400).json({ mensagem: erro });
  }

  try {
    // Busca o produto a ser atualizado
    const product = await productsModel.buscarPorId(id);

    // Se o produto não existe, retorna status 404
    if (!product) {
      return res.status(404).json({ mensagem: "Produto nao encontrado" });
    }

    // Se uma nova empresa foi fornecida, verifica se ela existe
    if (dados.empresa_id !== null && !(await empresaExiste(dados.empresa_id))) {
      return res.status(400).json({ mensagem: "empresa_id invalido" });
    }

    // Atualiza o produto com os novos dados
    const updated = await productsModel.atualizar(id, dados);
    // Busca o produto atualizado com informações da empresa
    const updatedWithCompany = await productsModel.buscarPorId(updated.id);
    // Retorna o produto atualizado
    return res.json(updatedWithCompany);
  } catch (err) {
    // Trata erro de violação de restrição de chave estrangeira
    if (err && err.code === "23503") {
      return res
        .status(400)
        .json({ mensagem: "Violacao de restricao ao atualizar produto" });
    }

    // Log do erro para debug
    console.error(err);
    // Retorna erro 500 em caso de falha
    return res.status(500).json({ mensagem: "Erro ao atualizar produto" });
  }
}

/**
 * Deleta um produto
 * @param {Object} req - Objeto da requisição (params contém id)
 * @param {Object} res - Objeto da resposta
 * @returns {Object} Retorna mensagem de sucesso ou erro
 */
async function deleteProduct(req, res) {
  // Extrai o ID do parâmetro da URL
  const { id } = req.params;

  try {
    // Deleta o produto com o ID fornecido
    const deleted = await productsModel.deletar(id);

    // Se nenhum produto foi deletado, retorna status 404
    if (!deleted) {
      return res.status(404).json({ mensagem: "Produto nao encontrado" });
    }

    // Retorna mensagem de sucesso
    return res.json({ mensagem: "Produto removido" });
  } catch (err) {
    // Log do erro para debug
    console.error(err);
    // Retorna erro 500 em caso de falha
    return res.status(500).json({ mensagem: "Erro ao remover produto" });
  }
}

// Exporta todas as funções para uso em outros arquivos (routes)
module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
