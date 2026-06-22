const db = require("../config/database");

async function listProducts(req, res) {
  try {
    const result = await db.query(`
      SELECT p.id, p.nome, p.preco, p.quantidade_estoque, p.empresa_id, c.nome AS empresa_nome
      FROM products p
      LEFT JOIN companies c ON c.id = p.empresa_id
      ORDER BY p.id
    `);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao listar produtos" });
  }
}

async function createProduct(req, res) {
  const { nome, preco, quantidade_estoque, empresa_id } = req.body;
  if (!nome || preco == null || quantidade_estoque == null || !empresa_id)
    return res.status(400).json({ mensagem: "Campos obrigatórios ausentes" });

  try {
    const companyQ = await db.query("SELECT id FROM companies WHERE id = $1", [
      empresa_id,
    ]);
    if (companyQ.rows.length === 0)
      return res.status(400).json({ mensagem: "empresa_id inválido" });

    const result = await db.query(
      "INSERT INTO products (nome, preco, quantidade_estoque, empresa_id) VALUES ($1, $2, $3, $4) RETURNING id",
      [nome, preco, quantidade_estoque, empresa_id],
    );
    return res.status(201).json({
      id: result.rows[0].id,
      nome,
      preco,
      quantidade_estoque,
      empresa_id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao criar produto" });
  }
}

async function updateProduct(req, res) {
  const { id } = req.params;
  const { nome, preco, quantidade_estoque, empresa_id } = req.body;

  try {
    const q = await db.query("SELECT * FROM products WHERE id = $1", [id]);
    const existing = q.rows[0];
    if (!existing)
      return res.status(404).json({ mensagem: "Produto nao encontrado" });

    if (empresa_id) {
      const companyQ = await db.query(
        "SELECT id FROM companies WHERE id = $1",
        [empresa_id],
      );
      if (companyQ.rows.length === 0)
        return res.status(400).json({ mensagem: "empresa_id inválido" });
    }

    const updatedQ = await db.query(
      "UPDATE products SET nome = $1, preco = $2, quantidade_estoque = $3, empresa_id = $4 WHERE id = $5 RETURNING *",
      [
        nome || existing.nome,
        preco != null ? preco : existing.preco,
        quantidade_estoque != null
          ? quantidade_estoque
          : existing.quantidade_estoque,
        empresa_id || existing.empresa_id,
        id,
      ],
    );
    return res.json(updatedQ.rows[0]);
  } catch (err) {
    if (err && err.code === "23503") {
      // foreign key
      return res
        .status(400)
        .json({ mensagem: "Violação de restrição ao atualizar produto" });
    }
    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao atualizar produto" });
  }
}

async function deleteProduct(req, res) {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM products WHERE id = $1", [id]);
    return res.json({ mensagem: "Produto removido" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: "Erro ao remover produto" });
  }
}

module.exports = { listProducts, createProduct, updateProduct, deleteProduct };
