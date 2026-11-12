document.addEventListener("DOMContentLoaded", async function () {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById("frmAlocado");
  if (!form) {
    return;
  }

  var parametros = new URLSearchParams(window.location.search);
  var oper = parametros.get("oper") || parametros.get("Oper");
  var servidorDw3 = form.dataset.servidorDw3;

  var btnInserir = document.getElementById("btnInserirAlocado");
  var btnAtualizar = document.getElementById("btnAtualizarAlocado");
  var btnRemover = document.getElementById("btnRemoverAlocado");

  inicializarSelectsAlocado();

  if (oper === "Cr") {
    btnInserir.classList.remove("d-none");
    await carregarDadosSelectsAlocado(servidorDw3);
    btnInserir.addEventListener("click", function () {
      vwInsertAlocado();
    });
  }

  if (oper === "Re") {
    await vwGetAlocadoByID();
    desabilitarCamposAlocado();
  }

  if (oper === "Up") {
    btnAtualizar.classList.remove("d-none");
    btnAtualizar.disabled = !(await vwGetAlocadoByID());
    btnAtualizar.addEventListener("click", function () {
      vwUpdateAlocado();
    });
  }

  if (oper === "De") {
    btnRemover.classList.remove("d-none");
    btnRemover.disabled = !(await vwGetAlocadoByID());
    desabilitarCamposAlocado();
    btnRemover.addEventListener("click", function () {
      vwDeleteAlocado();
    });
  }
});

function inicializarSelectsAlocado() {
  $("#animalidfk").select2({
    theme: "bootstrap-5",
    placeholder: "Selecione um animal",
    width: "100%",
  });

  $("#piqueteidfk").select2({
    theme: "bootstrap-5",
    placeholder: "Selecione um piquete",
    width: "100%",
  });
}

async function carregarDadosSelectsAlocado(servidorDw3) {
  try {
    var [resAnimal, resPiquete] = await Promise.all([
      fetch(servidorDw3 + "/getAllAnimal", {
        headers: dw3MontarHeadersAutenticacao(),
      }),
      fetch(servidorDw3 + "/getAllPiquete", {
        headers: dw3MontarHeadersAutenticacao(),
      }),
    ]);

    if (!resAnimal.ok || !resPiquete.ok) {
      throw new Error("Não foi possível carregar animais e piquetes.");
    }

    var dataAnimal = await resAnimal.json();
    var dataPiquete = await resPiquete.json();

    if (dataAnimal.auth === false || dataPiquete.auth === false) {
      alert("Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    var animalSelect = document.getElementById("animalidfk");
    animalSelect.innerHTML = '<option value="">Selecione um animal</option>';
    (dataAnimal.registro || []).forEach(function (animal) {
      var option = document.createElement("option");
      option.value = animal.animalid;
      option.textContent = animal.nome;
      animalSelect.appendChild(option);
    });
    $("#animalidfk").trigger("change");

    var piqueteSelect = document.getElementById("piqueteidfk");
    piqueteSelect.innerHTML = '<option value="">Selecione um piquete</option>';
    (dataPiquete.registro || []).forEach(function (piquete) {
      var option = document.createElement("option");
      option.value = piquete.piqueteid;
      option.textContent = piquete.descricao;
      piqueteSelect.appendChild(option);
    });
    $("#piqueteidfk").trigger("change");
  } catch (error) {
    alert(error.message || "Erro ao carregar listas de seleção.");
  }
}

function desabilitarCamposAlocado() {
  $("#animalidfk").prop("disabled", true);
  $("#piqueteidfk").prop("disabled", true);
  document.getElementById("datainicio").disabled = true;
  document.getElementById("datafinal").disabled = true;
}

function montarAlocadoDoFormulario() {
  var dataFinalValor = document.getElementById("datafinal").value;
  return {
    animalidfk: Number(document.getElementById("animalidfk").value),
    piqueteidfk: Number(document.getElementById("piqueteidfk").value),
    datainicio: document.getElementById("datainicio").value,
    datafinal: dataFinalValor ? dataFinalValor : null,
    removido: document.getElementById("removido").value === "true",
  };
}

async function vwGetAlocadoByID() {
  var form = document.getElementById("frmAlocado");
  try {
    var parametros = new URLSearchParams(window.location.search);
    var alocadoId = parametros.get("alocadoId");
    var servidorDw3 = form.dataset.servidorDw3;

    if (!alocadoId || !/^\d+$/.test(alocadoId) || Number(alocadoId) <= 0) {
      throw new Error("ID da alocação inválido.");
    }

    var response = await fetch(
      servidorDw3 + "/getAlocadoByID/" + encodeURIComponent(alocadoId),
      {
        headers: dw3MontarHeadersAutenticacao({
          "content-type": "application/json",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível carregar a alocação.");
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

    var alocado = data.registro[0];
    if (!alocado) {
      throw new Error("Alocação não encontrada.");
    }

    document.getElementById("alocadoid").value = alocado.alocadoid;
    document.getElementById("datainicio").value = alocado.datainicio
      ? alocado.datainicio.slice(0, 10)
      : "";
    document.getElementById("datafinal").value = alocado.datafinal
      ? alocado.datafinal.slice(0, 10)
      : "";
    document.getElementById("removido").value = String(
      alocado.removido === true
    );

    await carregarDadosSelectsAlocado(servidorDw3);
    $("#animalidfk").val(alocado.animalidfk).trigger("change");
    $("#piqueteidfk").val(alocado.piqueteidfk).trigger("change");

    return true;
  } catch (error) {
    alert(error.message || "Erro ao carregar alocação.");
    return false;
  }
}

async function vwInsertAlocado() {
  var form = document.getElementById("frmAlocado");
  var btnInserir = document.getElementById("btnInserirAlocado");

  try {
    if (!form.reportValidity()) {
      return;
    }

    var servidorDw3 = form.dataset.servidorDw3;
    btnInserir.disabled = true;

    var response = await fetch(servidorDw3 + "/insertAlocado", {
      method: "POST",
      headers: dw3MontarHeadersAutenticacao({
        "content-type": "application/json",
      }),
      body: JSON.stringify(montarAlocadoDoFormulario()),
    });

    if (!response.ok) {
      throw new Error("Não foi possível inserir a alocação.");
    }

    var data = await response.json();
    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    if (data.status !== "ok") {
      throw new Error(data.status || "Não foi possível inserir a alocação.");
    }

    window.location.href = "/alocado";
  } catch (error) {
    alert(error.message || "Erro ao inserir alocação.");
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdateAlocado() {
  var form = document.getElementById("frmAlocado");
  var btnAtualizar = document.getElementById("btnAtualizarAlocado");

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var alocadoId = new URLSearchParams(window.location.search).get(
      "alocadoId"
    );
    var servidorDw3 = form.dataset.servidorDw3;

    btnAtualizar.disabled = true;

    var response = await fetch(
      servidorDw3 + "/updateAlocado/" + encodeURIComponent(alocadoId),
      {
        method: "PUT",
        headers: dw3MontarHeadersAutenticacao({
          "content-type": "application/json",
        }),
        body: JSON.stringify(montarAlocadoDoFormulario()),
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível atualizar a alocação.");
    }

    var data = await response.json();
    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    if (data.status !== "ok" || data.linhasAfetadas !== 1) {
      throw new Error(data.status || "Nenhuma alocação foi atualizada.");
    }

    alert("Alocação atualizada com sucesso.");
    window.location.href = "/alocado";
  } catch (error) {
    alert(error.message || "Erro ao atualizar alocação.");
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeleteAlocado() {
  var form = document.getElementById("frmAlocado");
  var btnRemover = document.getElementById("btnRemoverAlocado");

  if (btnRemover.disabled) {
    return;
  }

  if (!window.confirm("Confirma a remoção desta alocação?")) {
    return;
  }

  try {
    var alocadoId = document.getElementById("alocadoid").value;
    var servidorDw3 = form.dataset.servidorDw3;

    btnRemover.disabled = true;

    var response = await fetch(
      servidorDw3 + "/deleteAlocado/" + encodeURIComponent(alocadoId),
      {
        method: "DELETE",
        headers: dw3MontarHeadersAutenticacao(),
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível remover a alocação.");
    }

    var data = await response.json();
    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    if (data.status !== "ok" || data.linhasAfetadas !== 1) {
      throw new Error(data.status || "Nenhuma alocação foi removida.");
    }

    window.location.href = "/alocado";
  } catch (error) {
    alert(error.message || "Erro ao remover alocação.");
  } finally {
    btnRemover.disabled = false;
  }
}