const express = require("express");
const articlesController = require("./articles.controller");
const router = express.Router();

router.get("/", articlesController.getAllArticles);
router.get("/:id", articlesController.getArticleById);
router.post("/", articlesController.createArticle);
router.put("/:id", articlesController.updateArticle);
router.delete("/:id", articlesController.deleteArticle);

module.exports = router;
