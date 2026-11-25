var express = require("express");
var router = express.Router();

// Renderiza a listagem de piquetes passando a URL do back-end para o front-end
router.get("/", function (req, res) {
  res.render("piquete/vwLstPiquete", {
    title: "Piquetes",
    showNavbar: true,
    activeMenu: "piquete",
    servidorDw3: process.env.SERVIDOR_DW3,
  });
});

// Renderiza o formulário de piquetes (Cr, Re, Up e De)
router.get("/form", function (req, res) {
  res.render("piquete/vwFormPiquete", {
    title: "Formulário de Piquetes",
    showNavbar: true,
    activeMenu: "piquete",
    servidorDw3: process.env.SERVIDOR_DW3,
  });
});

module.exports = router;