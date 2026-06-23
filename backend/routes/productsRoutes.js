// Importa o Express framework
const express = require("express");
// Cria uma nova instancia de router
const router = express.Router();
// Importa o middleware de autenticação
const authMiddleware = require("../middlewares/authMiddleware");
// Importa o controlador de produtos
const productsController = require("../controllers/productsController");

// Aplica o middleware de autenticação a todas as rotas abaixo
// Todas as requisições precisam de um token válido
router.use(authMiddleware);

// GET / - Lista todos os produtos
router.get("/", productsController.listProducts);

// POST / - Cria um novo produto
router.post("/", productsController.createProduct);

// PUT /:id - Atualiza um produto existente
router.put("/:id", productsController.updateProduct);

// DELETE /:id - Deleta um produto
router.delete("/:id", productsController.deleteProduct);

// Exporta o router para uso na aplicação principal
module.exports = router;
