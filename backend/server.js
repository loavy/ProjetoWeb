// Importa o módulo path para manipulação de caminhos
const path = require("path");
// Carrega as variáveis de ambiente do arquivo .env
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Importa o Express framework
const express = require("express");
// Importa o CORS para permitir requisições de origem cruzada
const cors = require("cors");

// Importa as rotas de autenticação
const authRoutes = require("./routes/authRoutes");
// Importa as rotas de empresas
const companiesRoutes = require("./routes/companiesRoutes");
// Importa as rotas de produtos
const productsRoutes = require("./routes/productsRoutes");
// Importa o pool de conexão do banco de dados
const db = require("./config/database");

// Cria uma instancia do Express
const app = express();
// Define a porta do servidor (variável de ambiente ou 3000 por padrão)
const PORT = process.env.PORT || 3000;

// Middleware para habilitar CORS (compartilhamento de recursos entre origens)
app.use(cors());
// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Rota raiz que retorna informações sobre a API
app.get("/", (req, res) => {
  res.json({
    mensagem: "Sistema de Gestão de Fornecimento - API",
    versao: "1.0",
    ambiente: process.env.NODE_ENV || "development",
    banco: db.client || "postgresql",
  });
});

// Rota /api que retorna informações sobre as rotas disponíveis
app.get("/api", (req, res) => {
  res.json({
    mensagem: "API SGF",
    versao: "1.0",
    rotas: ["/api/auth/login", "/api/companies", "/api/products"],
  });
});

// Define a rota /api/auth para autenticação
app.use("/api/auth", authRoutes);
// Define a rota /api/companies para gerenciamento de empresas
app.use("/api/companies", companiesRoutes);
// Define a rota /api/products para gerenciamento de produtos
app.use("/api/products", productsRoutes);

// Middleware para tratamento de rotas não encontradas (404)
app.use((req, res) => {
  res.status(404).json({ mensagem: "Rota não encontrada." });
});

// Inicia o servidor e exibe informações no console
app.listen(PORT, () => {
  console.log("=".repeat(49));
  console.log("Servidor SGF rodando!");
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log("=".repeat(49));
});
