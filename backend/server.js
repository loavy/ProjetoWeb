const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const companiesRoutes = require("./routes/companiesRoutes");
const productsRoutes = require("./routes/productsRoutes");
const db = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    mensagem: "Sistema de Gestão de Fornecimento - API",
    versao: "1.0",
    ambiente: process.env.NODE_ENV || "development",
    banco: db.client || "postgresql",
  });
});

app.get("/api", (req, res) => {
  res.json({
    mensagem: "API SGF",
    versao: "1.0",
    rotas: ["/api/auth/login", "/api/companies", "/api/products"],
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/products", productsRoutes);

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
