const companiesModel = require("../models/companiesModel");
const productsModel = require("../models/productsModel");

function obterNumero(valor) {
  if (valor === undefined || valor === null || valor === "") {
    return null;
  }

  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : NaN;
}

function obterInteiro(valor) {
  const numero = obterNumero(valor);

  if (numero === null) {
    return null;
  }

  return Number.isInteger(numero) ? numero : NaN;
}

function validarProdutoObrigatorio({ nome, preco, quantidade_estoque, empresa_id }) {
  if (!nome || preco === null || quantidade_estoque === null || empresa_id === null) {
    return "Campos obrigatorios: nome, preco, quantidade_estoque e empresa_id";
  }

  if (Number.isNaN(preco) || preco < 0) {
    return "Preco invalido";
  }

  if (Number.isNaN(quantidade_estoque) || quantidade_estoque < 0) {
    return "Quantidade em estoque invalida";
  }

  if (Number.isNaN(empresa_id) || empresa_id <= 0) {
    return "empresa_id invalido";
  }

  return "";
}

function validarProdutoParcial({ preco, quantidade_estoque, empresa_id }) {
  if (preco !== null && (Number.isNaN(preco) || preco < 0)) {
    return "Preco invalido";
  }

  if (
    quantidade_estoque !== null &&
    (Number.isNaN(quantidade_estoque) || quantidade_estoque < 0)
  ) {
    return "Quantidade em estoque invalida";
  }

  if (empresa_id !== null && (Number.isNaN(empresa_id) || empresa_id <= 0)) {
    return "empresa_id invalido";
  }

  return "";
}

async function empresaExiste(empresaId) {
  const company = await companiesModel.buscarPorId(empresaId);
  return Boolean(company);
}

async function listProducts(req, res) {
  try {
    const products = await productsModel.listarTodos();
    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao listar produtos" });
  }
}

async function createProduct(req, res) {
  const dados = {
    nome: req.body.nome,
    preco: obterNumero(req.body.preco),
    quantidade_estoque: obterInteiro(req.body.quantidade_estoque),
    empresa_id: obterInteiro(req.body.empresa_id),
  };
  const erro = validarProdutoObrigatorio(dados);

  if (erro) {
    return res.status(400).json({ mensagem: erro });
  }

  try {
    if (!(await empresaExiste(dados.empresa_id))) {
      return res.status(400).json({ mensagem: "empresa_id invalido" });
    }

    const product = await productsModel.criar(dados);
    const productWithCompany = await productsModel.buscarPorId(product.id);
    return res.status(201).json(productWithCompany);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao criar produto" });
  }
}

async function updateProduct(req, res) {
  const { id } = req.params;
  const dados = {
    nome: req.body.nome,
    preco: obterNumero(req.body.preco),
    quantidade_estoque: obterInteiro(req.body.quantidade_estoque),
    empresa_id: obterInteiro(req.body.empresa_id),
  };
  const erro = validarProdutoParcial(dados);

  if (erro) {
    return res.status(400).json({ mensagem: erro });
  }

  try {
    const product = await productsModel.buscarPorId(id);

    if (!product) {
      return res.status(404).json({ mensagem: "Produto nao encontrado" });
    }

    if (dados.empresa_id !== null && !(await empresaExiste(dados.empresa_id))) {
      return res.status(400).json({ mensagem: "empresa_id invalido" });
    }

    const updated = await productsModel.atualizar(id, dados);
    const updatedWithCompany = await productsModel.buscarPorId(updated.id);
    return res.json(updatedWithCompany);
  } catch (err) {
    if (err && err.code === "23503") {
      return res
        .status(400)
        .json({ mensagem: "Violacao de restricao ao atualizar produto" });
    }

    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao atualizar produto" });
  }
}

async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const deleted = await productsModel.deletar(id);

    if (!deleted) {
      return res.status(404).json({ mensagem: "Produto nao encontrado" });
    }

    return res.json({ mensagem: "Produto removido" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao remover produto" });
  }
}

module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
