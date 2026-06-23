// Importa o Express framework
const express = require("express");
// Cria uma nova instancia de router
const router = express.Router();
// Importa o middleware de autenticação
const authMiddleware = require("../middlewares/authMiddleware");
// Importa o controlador de empresas
const companiesController = require("../controllers/companiesController");

// Aplica o middleware de autenticação a todas as rotas abaixo
// Todas as requisições precisam de um token válido
router.use(authMiddleware);

// GET / - Lista todas as empresas
router.get("/", companiesController.listCompanies);

// POST / - Cria uma nova empresa
router.post("/", companiesController.createCompany);

// PUT /:id - Atualiza uma empresa existente
router.put("/:id", companiesController.updateCompany);

// DELETE /:id - Deleta uma empresa
router.delete("/:id", companiesController.deleteCompany);

// Exporta o router para uso na aplicação principal
module.exports = router;
