const db = require("../../../database/databaseconfig");

const GetAllPiquete = async () => {
  return (
    await db.query(
      "SELECT *, (SELECT descricao FROM pasto WHERE pastoid = piquete.pastoidfk) AS pasto_descricao " +
        "FROM piquete WHERE removido = false ORDER BY descricao ASC"
    )
  ).rows;
};

const GetPiqueteByID = async (piqueteIDPar) => {
  return (
    await db.query(
      "SELECT *, (SELECT descricao FROM pasto WHERE pastoid = piquete.pastoidfk) AS pasto_descricao " +
        "FROM piquete WHERE piqueteid = $1 AND removido = false",
      [piqueteIDPar]
    )
  ).rows;
};

const InsertPiquete = async (piqueteREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO piquete VALUES (default, $1, $2, $3, $4, $5)",
        [
          piqueteREGPar.descricao,
          piqueteREGPar.latitude,
          piqueteREGPar.longitude,
          piqueteREGPar.pastoidfk,
          piqueteREGPar.removido ?? false,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquete InsertPiquete] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const UpdatePiquete = async (piqueteIDPar, piqueteREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE piquete SET descricao = $2, latitude = $3, longitude = $4, pastoidfk = $5, removido = $6 WHERE piqueteid = $1",
        [
          piqueteIDPar,
          piqueteREGPar.descricao,
          piqueteREGPar.latitude,
          piqueteREGPar.longitude,
          piqueteREGPar.pastoidfk,
          piqueteREGPar.removido ?? false,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquete UpdatePiquete] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const DeletePiquete = async (piqueteIDPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    const dependentes = (
      await db.query(
        "SELECT COUNT(*) AS total FROM alocado WHERE piqueteidfk = $1 AND removido = false",
        [piqueteIDPar]
      )
    ).rows[0].total;

    if (Number(dependentes) > 0) {
      return {
        msg: "Não é possível remover este piquete pois existem alocações ativas vinculadas a ele.",
        linhasAfetadas: -1,
      };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE piquete SET removido = true WHERE piqueteid = $1",
        [piqueteIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquete DeletePiquete] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllPiquete,
  GetPiqueteByID,
  InsertPiquete,
  UpdatePiquete,
  DeletePiquete,
};