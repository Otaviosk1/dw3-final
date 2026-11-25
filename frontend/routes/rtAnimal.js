var express = require("express");
var router = express.Router();

// Renderiza a listagem de animais passando a URL do back-end para o front-end
router.get("/", function (req, res) {
  res.render("animal/vwLstAnimal", {
    title: "Animais",
    showNavbar: true,
    activeMenu: "animal",
    servidorDw3: process.env.SERVIDOR_DW3,
  });
});

// Renderiza o formulário de animais (Cr, Re, Up e De)
router.get("/form", function (req, res) {
  res.render("animal/vwFormAnimal", {
    title: "Formulário de Animais",
    showNavbar: true,
    activeMenu: "animal",
    servidorDw3: process.env.SERVIDOR_DW3,
  });
});

module.exports = router;