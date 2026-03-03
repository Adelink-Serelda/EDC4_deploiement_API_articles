const Article = require("./articles.schema");

class ArticlesService {
  getAll() {
    return Article.find({});
  }

  get(id) {
    return Article.findById(id);
  }

  // Récupérer tous les articles d'un user donné
  getAllByUser(userId) {
    return Article.find({ user: userId }).populate({
      path: "user",
      select: "-password",
    });
  }

  create(data) {
    const article = new Article(data);
    return article.save();
  }

  update(id, data) {
    return Article.findByIdAndUpdate(id, data, { new: true });
  }

  delete(id) {
    return Article.deleteOne({ _id: id });
  }
}

module.exports = new ArticlesService();
