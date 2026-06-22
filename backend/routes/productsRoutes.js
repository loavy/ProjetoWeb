const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const productsController = require("../controllers/productsController");

router.use(authMiddleware);

router.get("/", productsController.listProducts);
router.post("/", productsController.createProduct);
router.put("/:id", productsController.updateProduct);
router.delete("/:id", productsController.deleteProduct);

module.exports = router;
