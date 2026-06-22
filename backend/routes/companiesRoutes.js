const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const companiesController = require("../controllers/companiesController");

router.use(authMiddleware);

router.get("/", companiesController.listCompanies);
router.post("/", companiesController.createCompany);
router.put("/:id", companiesController.updateCompany);
router.delete("/:id", companiesController.deleteCompany);

module.exports = router;
