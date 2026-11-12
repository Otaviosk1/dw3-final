var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
  res.render("alocado/vwLstAlocado", {
    title: "Alocações",
    showNavbar: true,
    activeMenu: "alocado",
    servidorDw3: process.env.SERVIDOR_DW3,
  });
});

router.get("/form", function (req, res) {
  res.render("alocado/vwFormAlocado", {
    title: "Formulário de Alocações",
    showNavbar: true,
    activeMenu: "alocado",
    servidorDw3: process.env.SERVIDOR_DW3,
  });
});

module.exports = router;