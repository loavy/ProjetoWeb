const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const productsController = require("../controllers/productsController");

// Todas rotas de produtos exigem token JWT valido.
// O middleware valida o token e adiciona dados do usuario no req.
router.use(authMiddleware);

router.get("/", productsController.listProducts);
router.post("/", productsController.createProduct);
router.put("/:id", productsController.updateProduct);
router.delete("/:id", productsController.deleteProduct);

module.exports = router;
