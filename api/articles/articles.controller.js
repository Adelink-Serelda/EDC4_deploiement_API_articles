const NotFoundError = require("../../errors/not-found");
const UnauthorizedError = require("../../errors/unauthorized");
const usersController = require("../users/users.controller");
const articlesService = require("./articles.service");

class ArticlesController {
  // Récupérer tous les articles existants
  async getAllArticles(req, res, next) {
    try {
      const articles = await articlesService.getAll();
      res.json(articles);
    } catch (err) {
      next(err);
    }
  }

  // Récupérer un article par son identifiant
  async getArticleById(req, res, next) {
    try {
      const id = req.params.id;
      const article = await articlesService.get(id);
      if (!article) {
        throw new NotFoundError();
      }
      res.json(article);
    } catch (err) {
      next(err);
    }
  }

  // Créer un article
  async createArticle(req, res, next) {
    try {
      const payload = {
        ...req.body,
        user: req.user && req.user._id ? req.user._id : undefined,
      };
      const article = await articlesService.create(payload);
      req.io.emit("article:create", article);
      res.status(201).json(article);
    } catch (err) {
      next(err);
    }
  }

  // Mettre à jour un article
  async updateArticle(req, res, next) {
    try {
      if (!req.user || req.user.role !== "admin") {
        throw new UnauthorizedError("Admin only");
      }
      const id = req.params.id;
      const data = req.body;
      const articleModified = await articlesService.update(id, data);
      res.json(articleModified);
    } catch (err) {
      next(err);
    }
  }

  // Supprimer un article
  async deleteArticle(req, res, next) {
    try {
      if (!req.user || req.user.role !== "admin") {
        throw new UnauthorizedError("Admin only");
      }
      const id = req.params.id;
      await articlesService.delete(id);
      req.io.emit("article:delete", { id });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ArticlesController();
