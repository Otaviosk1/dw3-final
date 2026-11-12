const db = require("../../../database/databaseconfig");

const GetAllAnimal = async () => {
  return (
    await db.query(
      "SELECT * FROM animal WHERE removido = false ORDER BY nome ASC"
    )
  ).rows;
};

const GetAnimalByID = async (animalIDPar) => {
  return (
    await db.query(
      "SELECT * FROM animal WHERE animalid = $1 AND removido = false",
      [animalIDPar]
    )
  ).rows;
};

const InsertAnimal = async (animalREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO animal VALUES (default, $1, $2, $3)",
        [
          animalREGPar.nome,
          animalREGPar.datanasc,
          animalREGPar.removido ?? false,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimal InsertAnimal] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const UpdateAnimal = async (animalIDPar, animalREGPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE animal SET nome = $2, datanasc = $3, removido = $4 WHERE animalid = $1",
        [
          animalIDPar,
          animalREGPar.nome,
          animalREGPar.datanasc,
          animalREGPar.removido ?? false,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimal UpdateAnimal] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

const DeleteAnimal = async (animalIDPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    const dependentes = (
      await db.query(
        "SELECT COUNT(*) AS total FROM alocado WHERE animalidfk = $1 AND removido = false",
        [animalIDPar]
      )
    ).rows[0].total;

    if (Number(dependentes) > 0) {
      return {
        msg: "Não é possível remover este animal pois existem alocações ativas vinculadas a ele.",
        linhasAfetadas: -1,
      };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE animal SET removido = true WHERE animalid = $1",
        [animalIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimal DeleteAnimal] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }
  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllAnimal,
  GetAnimalByID,
  InsertAnimal,
  UpdateAnimal,
  DeleteAnimal,
};