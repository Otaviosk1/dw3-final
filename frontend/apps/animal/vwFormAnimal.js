document.addEventListener("DOMContentLoaded", async function () {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById("frmAnimal");
  if (!form) {
    return;
  }

  var parametros = new URLSearchParams(window.location.search);
  var oper = parametros.get("oper") || parametros.get("Oper");

  var btnInserir = document.getElementById("btnInserirAnimal");
  var btnAtualizar = document.getElementById("btnAtualizarAnimal");
  var btnRemover = document.getElementById("btnRemoverAnimal");

  if (oper === "Cr") {
    btnInserir.classList.remove("d-none");
    btnInserir.addEventListener("click", function () {
      vwInsertAnimal();
    });
  }

  if (oper === "Re") {
    await vwGetAnimalByID();
    desabilitarCamposAnimal();
  }

  if (oper === "Up") {
    btnAtualizar.classList.remove("d-none");
    btnAtualizar.disabled = !(await vwGetAnimalByID());
    btnAtualizar.addEventListener("click", function () {
      vwUpdateAnimal();
    });
  }

  if (oper === "De") {
    btnRemover.classList.remove("d-none");
    btnRemover.disabled = !(await vwGetAnimalByID());
    desabilitarCamposAnimal();
    btnRemover.addEventListener("click", function () {
      vwDeleteAnimal();
    });
  }
});

function desabilitarCamposAnimal() {
  document.getElementById("nome").disabled = true;
  document.getElementById("datanasc").disabled = true;
}

function montarAnimalDoFormulario() {
  return {
    nome: document.getElementById("nome").value,
    datanasc: document.getElementById("datanasc").value,
    removido: document.getElementById("removido").value === "true",
  };
}

async function vwGetAnimalByID() {
  var form = document.getElementById("frmAnimal");
  try {
    var parametros = new URLSearchParams(window.location.search);
    var animalId = parametros.get("animalId");
    var servidorDw3 = form.dataset.servidorDw3;

    if (!animalId || !/^\d+$/.test(animalId) || Number(animalId) <= 0) {
      throw new Error("ID do animal inválido.");
    }

    var response = await fetch(
      servidorDw3 + "/getAnimalByID/" + encodeURIComponent(animalId),
      {
        headers: dw3MontarHeadersAutenticacao({
          "content-type": "application/json",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível carregar o animal.");
    }

    var data = await response.json();
    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return false;
    }

    if (data.status !== "ok" || !Array.isArray(data.registro)) {
      throw new Error("Resposta inválida do servidor back-end.");
    }

    var animal = data.registro[0];
    if (!animal) {
      throw new Error("Animal não encontrado.");
    }

    document.getElementById("animalid").value = animal.animalid;
    document.getElementById("nome").value = animal.nome ?? "";
    document.getElementById("datanasc").value = animal.datanasc
      ? animal.datanasc.slice(0, 10)
      : "";
    document.getElementById("removido").value = String(
      animal.removido === true
    );

    return true;
  } catch (error) {
    alert(error.message || "Erro ao carregar animal.");
    return false;
  }
}

async function vwInsertAnimal() {
  var form = document.getElementById("frmAnimal");
  var btnInserir = document.getElementById("btnInserirAnimal");

  try {
    if (!form.reportValidity()) {
      return;
    }

    var servidorDw3 = form.dataset.servidorDw3;
    btnInserir.disabled = true;

    var response = await fetch(servidorDw3 + "/insertAnimal", {
      method: "POST",
      headers: dw3MontarHeadersAutenticacao({
        "content-type": "application/json",
      }),
      body: JSON.stringify(montarAnimalDoFormulario()),
    });

    if (!response.ok) {
      throw new Error("Não foi possível inserir o animal.");
    }

    var data = await response.json();
    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    if (data.status !== "ok") {
      throw new Error(data.status || "Não foi possível inserir o animal.");
    }

    window.location.href = "/animal";
  } catch (error) {
    alert(error.message || "Erro ao inserir animal.");
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdateAnimal() {
  var form = document.getElementById("frmAnimal");
  var btnAtualizar = document.getElementById("btnAtualizarAnimal");

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var animalId = new URLSearchParams(window.location.search).get("animalId");
    var servidorDw3 = form.dataset.servidorDw3;

    btnAtualizar.disabled = true;

    var response = await fetch(
      servidorDw3 + "/updateAnimal/" + encodeURIComponent(animalId),
      {
        method: "PUT",
        headers: dw3MontarHeadersAutenticacao({
          "content-type": "application/json",
        }),
        body: JSON.stringify(montarAnimalDoFormulario()),
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível atualizar o animal.");
    }

    var data = await response.json();
    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    if (data.status !== "ok" || data.linhasAfetadas !== 1) {
      throw new Error(data.status || "Nenhum animal foi atualizado.");
    }

    alert("Animal atualizado com sucesso.");
    window.location.href = "/animal";
  } catch (error) {
    alert(error.message || "Erro ao atualizar animal.");
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeleteAnimal() {
  var form = document.getElementById("frmAnimal");
  var btnRemover = document.getElementById("btnRemoverAnimal");

  if (btnRemover.disabled) {
    return;
  }

  if (!window.confirm("Confirma a remoção deste animal?")) {
    return;
  }

  try {
    var animalId = document.getElementById("animalid").value;
    var servidorDw3 = form.dataset.servidorDw3;

    btnRemover.disabled = true;

    var response = await fetch(
      servidorDw3 + "/deleteAnimal/" + encodeURIComponent(animalId),
      {
        method: "DELETE",
        headers: dw3MontarHeadersAutenticacao(),
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível remover o animal.");
    }

    var data = await response.json();
    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    if (data.status !== "ok" || data.linhasAfetadas !== 1) {
      throw new Error(data.status || "Nenhum animal foi removido.");
    }

    window.location.href = "/animal";
  } catch (error) {
    alert(error.message || "Erro ao remover animal.");
  } finally {
    btnRemover.disabled = false;
  }
}