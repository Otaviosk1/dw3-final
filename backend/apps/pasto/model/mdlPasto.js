const db = require("../../../database/databaseconfig");

const GetAllPasto = async () => {
  return (
    await db.query(
      "SELECT * FROM pasto WHERE removido = false ORDER BY descricao ASC"
    )
  ).rows;
};

const GetPastoByID = async (pastoIDPar) => {
  return (
    await db.query(
      "SELECT * FROM pasto WHERE pastoid = $1 AND removido = false",
      [pastoIDPar]
    )
  ).rows;
};

const InsertPasto = async (pastoREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO pasto VALUES (default, $1, $2, $3)",
        [
          pastoREGPar.descricao,
          pastoREGPar.areatotal,
          pastoREGPar.removido ?? false,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPasto InsertPasto] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const UpdatePasto = async (pastoIDPar, pastoREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE pasto SET descricao = $2, areatotal = $3, removido = $4 WHERE pastoid = $1",
        [
          pastoIDPar,
          pastoREGPar.descricao,
          pastoREGPar.areatotal,
          pastoREGPar.removido ?? false,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPasto UpdatePasto] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const DeletePasto = async (pastoIDPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    // Impede exclusão lógica se houver piquetes ativos vinculados ao pasto
    const dependentes = (
      await db.query(
        "SELECT COUNT(*) AS total FROM piquete WHERE pastoidfk = $1 AND removido = false",
        [pastoIDPar]
      )
    ).rows[0].total;

    if (Number(dependentes) > 0) {
      return {
        msg: "Não é possível remover este pasto pois existem piquetes ativos vinculados a ele.",
        linhasAfetadas: -1,
      };
    }

    // Soft delete: marca como removido sem apagar fisicamente
    linhasAfetadas = (
      await db.query(
        "UPDATE pasto SET removido = true WHERE pastoid = $1",
        [pastoIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPasto DeletePasto] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllPasto,
  GetPastoByID,
  InsertPasto,
  UpdatePasto,
  DeletePasto,
};