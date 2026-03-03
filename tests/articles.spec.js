const request = require("supertest");
const { app } = require("../server");
const jwt = require("jsonwebtoken");
const config = require("../config");
const mongoose = require("mongoose");
const mockingoose = require("mockingoose");
const Article = require("../api/articles/articles.schema");
const articlesService = require("../api/articles/articles.service");
const usersService = require("../api/users/users.service");

// Tester la création, la modification et la suppression des articles
describe("tester API articles", () => {
  let token;
  const USER_ID = new mongoose.Types.ObjectId();
  const ARTICLE_ID = new mongoose.Types.ObjectId();
  const ADMIN_USER = {
    _id: USER_ID,
    name: "admin",
    email: "admin@test.com",
    role: "admin",
  };
  const MOCK_ARTICLE_DATA = {
    _id: ARTICLE_ID,
    title: "Test Article",
    content: "Contenu-test",
    user: USER_ID,
    statut: "published",
  };
  const MOCK_ARTICLE_CREATE = {
    title: "Nouvel article",
    content: "Contenu de l'article en cours",
    statut: "draft",
  };
  const MOCK_ARTICLE_UPDATE = {
    title: "MAJ article",
    content: "Modification du contenu",
    statut: "published",
  };

  beforeEach(() => {
    // Création d'un token
    token = jwt.sign({ userId: USER_ID }, config.secretJwtToken);
    // Utilise les données mock
    mockingoose(Article).toReturn(MOCK_ARTICLE_DATA, "save");
    // Simule le userService
    jest.spyOn(usersService, "get").mockResolvedValue(ADMIN_USER);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Create Article - should return 201", async () => {
    jest.spyOn(articlesService, "create").mockResolvedValue(MOCK_ARTICLE_DATA);

    const res = await request(app)
      .post("/api/articles")
      .set("x-access-token", token)
      .send(MOCK_ARTICLE_CREATE);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(MOCK_ARTICLE_DATA.title);
    expect(res.body.content).toBe(MOCK_ARTICLE_DATA.content);
    expect(articlesService.create).toHaveBeenCalled();
  });

  test("Update Article - should return 200", async () => {
    jest
      .spyOn(articlesService, "update")
      .mockResolvedValue({ ...MOCK_ARTICLE_DATA, ...MOCK_ARTICLE_UPDATE });

    const res = await request(app)
      .put(`/api/articles/${ARTICLE_ID}`)
      .set("x-access-token", token)
      .send(MOCK_ARTICLE_UPDATE);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(MOCK_ARTICLE_UPDATE.title);
    expect(articlesService.update).toHaveBeenCalledWith(
      ARTICLE_ID.toString(),
      MOCK_ARTICLE_UPDATE,
    );
  });

  test("Delete Article - should return 204", async () => {
    jest.spyOn(articlesService, "delete").mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/articles/${ARTICLE_ID}`)
      .set("x-access-token", token);

    expect(res.status).toBe(204);
    expect(articlesService.delete).toHaveBeenCalledWith(ARTICLE_ID.toString());
  });
});
