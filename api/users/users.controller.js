const NotFoundError = require("../../errors/not-found");
const UnauthorizedError = require("../../errors/unauthorized");
const jwt = require("jsonwebtoken");
const config = require("../../config");
const usersService = require("./users.service");
const articlesService = require("../articles/articles.service");

class UsersController {
  // Récupérer tous les users
  async getAll(req, res, next) {
    try {
      const users = await usersService.getAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  // Récupérer un user par son identifiant
  async getById(req, res, next) {
    try {
      const id = req.params.id;
      const user = await usersService.get(id);
      if (!user) {
        throw new NotFoundError();
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  // Récupérer les articles d'un user par son identifiant
  async getAllArticlesByUser(req, res, next) {
    try {
      const userId = req.params.id;
      const articles = await articlesService.getAllByUser(userId);
      res.json(articles);
    } catch (err) {
      next(err);
    }
  }

  // Créer un nouvel utilisateur
  async create(req, res, next) {
    try {
      const user = await usersService.create(req.body);
      user.password = undefined;
      req.io.emit("user:create", user);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  // Mettre à jour / modifier un user
  async update(req, res, next) {
    try {
      if (!req.user || req.user.role !== "admin") {
        throw new UnauthorizedError("Admin only");
      }
      const id = req.params.id;
      const data = req.body;
      const userModified = await usersService.update(id, data);
      userModified.password = undefined;
      res.json(userModified);
    } catch (err) {
      next(err);
    }
  }

  // Supprimer un user
  async delete(req, res, next) {
    try {
      if (!req.user || req.user.role !== "admin") {
        throw new UnauthorizedError("Admin only");
      }
      const id = req.params.id;
      await usersService.delete(id);
      req.io.emit("user:delete", { id });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // Se connecter
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userId = await usersService.checkPasswordUser(email, password);
      if (!userId) {
        throw new UnauthorizedError();
      }
      const token = jwt.sign({ userId }, config.secretJwtToken, {
        expiresIn: "3d",
      });
      res.json({
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  // Récupérer les information de l'user connecté
  async me(req, res, next) {
    try {
      res.json(req.user);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UsersController();
