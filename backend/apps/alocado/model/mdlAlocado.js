const db = require("../../../database/databaseconfig");

const GetAllAlocado = async () => {
  return (
    await db.query(
      "SELECT *, " +
        "(SELECT nome FROM animal WHERE animalid = alocado.animalidfk) AS animal_nome, " +
        "(SELECT descricao FROM piquete WHERE piqueteid = alocado.piqueteidfk) AS piquete_descricao " +
        "FROM alocado WHERE removido = false ORDER BY datainicio DESC"
    )
  ).rows;
};

const GetAlocadoByID = async (alocadoIDPar) => {
  return (
    await db.query(
      "SELECT *, " +
        "(SELECT nome FROM animal WHERE animalid = alocado.animalidfk) AS animal_nome, " +
        "(SELECT descricao FROM piquete WHERE piqueteid = alocado.piqueteidfk) AS piquete_descricao " +
        "FROM alocado WHERE alocadoid = $1 AND removido = false",
      [alocadoIDPar]
    )
  ).rows;
};

const InsertAlocado = async (alocadoREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO alocado VALUES (default, $1, $2, $3, $4, $5)",
        [
          alocadoREGPar.animalidfk,
          alocadoREGPar.piqueteidfk,
          alocadoREGPar.datainicio,
          alocadoREGPar.datafinal || null,
          alocadoREGPar.removido ?? false,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAlocado InsertAlocado] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const UpdateAlocado = async (alocadoIDPar, alocadoREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE alocado SET animalidfk = $2, piqueteidfk = $3, datainicio = $4, datafinal = $5, removido = $6 WHERE alocadoid = $1",
        [
          alocadoIDPar,
          alocadoREGPar.animalidfk,
          alocadoREGPar.piqueteidfk,
          alocadoREGPar.datainicio,
          alocadoREGPar.datafinal || null,
          alocadoREGPar.removido ?? false,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAlocado UpdateAlocado] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const DeleteAlocado = async (alocadoIDPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE alocado SET removido = true WHERE alocadoid = $1",
        [alocadoIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAlocado DeleteAlocado] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllAlocado,
  GetAlocadoByID,
  InsertAlocado,
  UpdateAlocado,
  DeleteAlocado,
};