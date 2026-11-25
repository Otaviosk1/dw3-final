const mdlAnimal = require("../model/mdlAnimal");

const GetAllAnimal = (req, res) =>
  (async () => {
    let registro = await mdlAnimal.GetAllAnimal();
    // Formata a data de nascimento para YYYY-MM-DD
    for (let i = 0; i < registro.length; i++) {
      const row = registro[i];
      if (row.datanasc) {
        row.datanasc = row.datanasc.toISOString().split("T")[0];
      }
    }
    res.json({ status: "ok", registro: registro });
  })();

const GetAnimalByID = (req, res) =>
  (async () => {
    const animalID = parseInt(req.params.animalid);
    let registro = await mdlAnimal.GetAnimalByID(animalID);
    // Formata a data para compatibilidade com o campo date do formulário
    for (let i = 0; i < registro.length; i++) {
      const row = registro[i];
      if (row.datanasc) {
        row.datanasc = row.datanasc.toISOString().split("T")[0];
      }
    }
    res.json({ status: "ok", registro: registro });
  })();

const InsertAnimal = (request, res) =>
  (async () => {
    const animalREG = request.body;
    let { msg, linhasAfetadas } = await mdlAnimal.InsertAnimal(animalREG);
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

const UpdateAnimal = (request, res) =>
  (async () => {
    const animalID = parseInt(request.params.animalid);
    const animalREG = request.body;
    let { msg, linhasAfetadas } = await mdlAnimal.UpdateAnimal(
      animalID,
      animalREG
    );
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

const DeleteAnimal = (request, res) =>
  (async () => {
    const animalID = parseInt(request.params.animalid);
    let { msg, linhasAfetadas } = await mdlAnimal.DeleteAnimal(animalID);
    res.json({ status: msg, linhasAfetadas: linhasAfetadas });
  })();

module.exports = {
  GetAllAnimal,
  GetAnimalByID,
  InsertAnimal,
  UpdateAnimal,
  DeleteAnimal,
};