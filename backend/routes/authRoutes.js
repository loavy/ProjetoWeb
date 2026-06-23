const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Endpoint de login: recebe email e senha, retorna JWT e dados do usuario.
router.post("/login", authController.login);

module.exports = router;
