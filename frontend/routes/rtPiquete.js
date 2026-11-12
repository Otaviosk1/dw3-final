var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
  res.render("piquete/vwLstPiquete", {
    title: "Piquetes",
    showNavbar: true,
    activeMenu: "piquete",
    servidorDw3: process.env.SERVIDOR_DW3,
  });
});

router.get("/form", function (req, res) {
  res.render("piquete/vwFormPiquete", {
    title: "Formulário de Piquetes",
    showNavbar: true,
    activeMenu: "piquete",
    servidorDw3: process.env.SERVIDOR_DW3,
  });
});

module.exports = router;