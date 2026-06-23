// Importa o Express framework
const express = require("express");
// Cria uma nova instancia de router
const router = express.Router();
// Importa o controlador de autenticação
const authController = require("../controllers/authController");

// Define a rota POST /login que chama a função de login do controlador
router.post("/login", authController.login);

// Exporta o router para uso na aplicação principal
module.exports = router;
