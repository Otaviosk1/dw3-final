var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
  res.render("pasto/vwLstPasto", {
    title: "Pastos",
    showNavbar: true,
    activeMenu: "pasto",
    servidorDw3: process.env.SERVIDOR_DW3,
  });
});

router.get("/form", function (req, res) {
  res.render("pasto/vwFormPasto", {
    title: "Formulário de Pastos",
    showNavbar: true,
    activeMenu: "pasto",
    servidorDw3: process.env.SERVIDOR_DW3,
  });
});

module.exports = router;