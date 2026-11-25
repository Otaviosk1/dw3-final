const db = require("../../../database/databaseconfig");

// Busca usuário ativo para validação de senha no controller
const GetCredencial = async (loginPar) => {
  return (
    await db.query(
      "SELECT username, password FROM usuarios WHERE username = $1 AND removido = false",
      [loginPar]
    )
  ).rows;
};

module.exports = {
  GetCredencial,
};