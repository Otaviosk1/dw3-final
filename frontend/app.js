var createError = require("http-errors");
var express = require("express");
var path = require("path");
var nunjucks = require("nunjucks");

var indexRouter = require("./routes/rtIndex");
var loginRouter = require("./routes/rtLogin");
var homeRouter = require("./routes/rtHome");
var pastoRouter = require("./routes/rtPasto");
var piqueteRouter = require("./routes/rtPiquete");
var animalRouter = require("./routes/rtAnimal");
var alocadoRouter = require("./routes/rtAlocado");

// Carrega as variáveis de ambiente do front-end (porta e URL da API back-end)
require("dotenv").config({
  path: path.join(__dirname, "dw3frontend.env"),
  quiet: true,
});

var app = express();
var viewsPath = path.join(__dirname, "views");
var appsPath = path.join(__dirname, "apps");
const port = process.env.PORT || 40100;

// Configura o Nunjucks buscando templates nas pastas views/ e apps/
app.set("views", [viewsPath, appsPath]);
app.set("view engine", "njk");

nunjucks.configure([viewsPath, appsPath], {
  autoescape: true,
  express: app,
  noCache: app.get("env") === "development",
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Expõe assets globais (CSS/JS) e os scripts individuais de cada módulo
app.use(express.static(path.join(__dirname, "public")));
app.use("/apps", express.static(path.join(__dirname, "apps")));

// Registra as rotas de páginas do front-end
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/home", homeRouter);
app.use("/pasto", pastoRouter);
app.use("/piquete", piqueteRouter);
app.use("/animal", animalRouter);
app.use("/alocado", alocadoRouter);

// Encaminha rotas inexistentes para o tratamento de erro 404
app.use(function (req, res, next) {
  next(createError(404));
});

// Middleware global de erro: renderiza a view error.njk
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error", { title: "Erro" });
});

app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});