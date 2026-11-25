var express = require("express");
var router = express.Router();

// Redireciona a rota raiz para a tela de login
router.get("/", function (req, res) {
  res.redirect("/login");
});

module.exports = router;