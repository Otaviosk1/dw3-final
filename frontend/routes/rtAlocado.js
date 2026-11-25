var express = require("express");
var router = express.Router();

// Renderiza a listagem de alocações injetando a URL do back-end (.env) na view
router.get("/", function (req, res) {
  res.render("alocado/vwLstAlocado", {
    title: "Alocações",
    showNavbar: true,
    activeMenu: "alocado",
    servidorDw3: process.env.SERVIDOR_DW3,
  });
});

// Renderiza o formulário de alocações (operações Cr, Re, Up e De via query string)
router.get("/form", function (req, res) {
  res.render("alocado/vwFormAlocado", {
    title: "Formulário de Alocações",
    showNavbar: true,
    activeMenu: "alocado",
    servidorDw3: process.env.SERVIDOR_DW3,
  });
});

module.exports = router;