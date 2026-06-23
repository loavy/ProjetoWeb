const path = require("path");
// Carrega variaveis de ambiente do arquivo .env na raiz do backend.
// Essas variaveis controlam porta, conexao com o banco e chave JWT.
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");

// Rotas separadas por dominio de responsabilidade
// authRoutes: login e autenticacao
// companiesRoutes: CRUD de empresas
// productsRoutes: CRUD de produtos
const authRoutes = require("./routes/authRoutes");
const companiesRoutes = require("./routes/companiesRoutes");
const productsRoutes = require("./routes/productsRoutes");
const db = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Permite que o frontend acesse a API de outro host/porta.
app.use(express.json());
// Habilita o parsing de JSON no corpo das requisicoes.

app.get("/", (req, res) => {
  res.json({
    mensagem: "Sistema de Gestão de Fornecimento - API",
    versao: "1.0",
    ambiente: process.env.NODE_ENV || "development",
    banco: db.client || "postgresql",
  });
});

app.get("/api", (req, res) => {
  // Endpoint de status / informacoes basicas da API
  // Usado pelo frontend para verificar conexao e disponibilidade.
  res.json({
    mensagem: "API SGF",
    versao: "1.0",
    rotas: ["/api/auth/login", "/api/companies", "/api/products"],
  });
});

// Monta os routers principais da aplicacao.
// Cada router lida com um grupo de endpoints REST.
// Exemplo: /api/auth/login -> authRoutes
//          /api/companies    -> companiesRoutes
//          /api/products     -> productsRoutes
app.use("/api/auth", authRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/products", productsRoutes);

// Se nenhuma rota for correspondente, envia 404 como JSON.
// Isso evita que o servidor responda com HTML padrao.
app.use((req, res) => {
  res.status(404).json({ mensagem: "Rota não encontrada." });
});

app.listen(PORT, () => {
  console.log("=".repeat(49));
  console.log("Servidor SGF rodando!");
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log("=".repeat(49));
});
