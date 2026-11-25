const jwt = require("jsonwebtoken");
const bCrypt = require("bcryptjs");
const mdlLogin = require("../model/mdlLogin");

// Valida credenciais no banco e gera o token JWT
const Login = async (req, res, next) => {
  const loginUser = req.body.username || req.body.UserName;
  const loginPass = req.body.password || req.body.Password;

  const credencial = await mdlLogin.GetCredencial(loginUser);
  if (credencial.length == 0) {
    return res.status(200).json({ message: "Usuário não identificado!" });
  }

  // Compara a senha informada com o hash Blowfish (pgcrypto) salvo no banco
  if (bCrypt.compareSync(loginPass, credencial[0].password)) {
    const username = credencial[0].username;
    const token = jwt.sign({ username }, process.env.SECRET_API, {
      expiresIn: 1200, // expira em 20 minutos (1200s)
    });
    return res.json({ auth: true, token: token, username: username });
  }

  return res.status(200).json({ message: "Login inválido!" });
};

// Middleware de proteção das rotas: extrai e valida o Bearer token
function AutenticaJWT(req, res, next) {
  const tokenHeader = req.headers["authorization"];
  if (!tokenHeader) {
    return res
      .status(200)
      .json({ auth: false, message: "Não foi informado o token JWT" });
  }

  const bearer = tokenHeader.split(" ");
  const token = bearer[1];

  jwt.verify(token, process.env.SECRET_API, function (err, decoded) {
    if (err) {
      return res
        .status(200)
        .json({ auth: false, message: "JWT inválido ou expirado" });
    }
    req.userId = decoded.username;
    next();
  });
}

const Logout = (req, res, next) => {
  res.json({ auth: false, token: null });
};

module.exports = {
  Login,
  Logout,
  AutenticaJWT,
};