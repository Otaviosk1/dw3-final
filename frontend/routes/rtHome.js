var express = require("express");
var router = express.Router();

// Renderiza o painel principal (acesso protegido no cliente via vwHome.js)
router.get("/", function (req, res) {
  res.render("home", {
    title: "Painel Principal",
    showNavbar: true,
    activeMenu: "home",
  });
});

module.exports = router;