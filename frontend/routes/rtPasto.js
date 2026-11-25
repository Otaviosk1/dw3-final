var express = require("express");
var router = express.Router();

// Renderiza a listagem de pastos passando a URL do back-end para o front-end
router.get("/", function (req, res) {
  res.render("pasto/vwLstPasto", {
    title: "Pastos",
    showNavbar: true,
    activeMenu: "pasto",
    servidorDw3: process.env.SERVIDOR_DW3,
  });
});

// Renderiza o formulário de pastos (Cr, Re, Up e De)
router.get("/form", function (req, res) {
  res.render("pasto/vwFormPasto", {
    title: "Formulário de Pastos",
    showNavbar: true,
    activeMenu: "pasto",
    servidorDw3: process.env.SERVIDOR_DW3,
  });
});

module.exports = router;