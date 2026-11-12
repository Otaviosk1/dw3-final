document.addEventListener("DOMContentLoaded", async function () {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById("frmPiquete");
  if (!form) {
    return;
  }

  var parametros = new URLSearchParams(window.location.search);
  var oper = parametros.get("oper") || parametros.get("Oper");
  var servidorDw3 = form.dataset.servidorDw3;

  var btnInserir = document.getElementById("btnInserirPiquete");
  var btnAtualizar = document.getElementById("btnAtualizarPiquete");
  var btnRemover = document.getElementById("btnRemoverPiquete");

  inicializarSelectPasto();

  if (oper === "Cr") {
    btnInserir.classList.remove("d-none");
    await carregarPastosToPiquete(servidorDw3);
    btnInserir.addEventListener("click", function () {
      vwInsertPiquete();
    });
  }

  if (oper === "Re") {
    await vwGetPiqueteByID();
    desabilitarCamposPiquete();
  }

  if (oper === "Up") {
    btnAtualizar.classList.remove("d-none");
    btnAtualizar.disabled = !(await vwGetPiqueteByID());
    btnAtualizar.addEventListener("click", function () {
      vwUpdatePiquete();
    });
  }

  if (oper === "De") {
    btnRemover.classList.remove("d-none");
    btnRemover.disabled = !(await vwGetPiqueteByID());
    desabilitarCamposPiquete();
    btnRemover.addEventListener("click", function () {
      vwDeletePiquete();
    });
  }
});

function inicializarSelectPasto() {
  $("#pastoidfk").select2({
    theme: "bootstrap-5",
    placeholder: "Selecione um pasto",
    width: "100%",
  });
}

async function carregarPastosToPiquete(servidorDw3) {
  try {
    var response = await fetch(servidorDw3 + "/getAllPasto", {
      headers: dw3MontarHeadersAutenticacao(),
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar os pastos.");
    }

    var data = await response.json();
    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    if (data.status !== "ok" || !Array.isArray(data.registro)) {
      throw new Error("Resposta inválida do servidor back-end.");
    }

    var pastoSelect = document.getElementById("pastoidfk");
    pastoSelect.innerHTML = '<option value="">Selecione um pasto</option>';
    data.registro.forEach(function (pasto) {
      var option = document.createElement("option");
      option.value = pasto.pastoid;
      option.textContent = pasto.descricao;
      pastoSelect.appendChild(option);
    });
    $("#pastoidfk").trigger("change");
  } catch (error) {
    alert(error.message || "Erro ao carregar pastos.");
  }
}

function desabilitarCamposPiquete() {
  document.getElementById("descricao").disabled = true;
  document.getElementById("latitude").disabled = true;
  document.getElementById("longitude").disabled = true;
  $("#pastoidfk").prop("disabled", true);
}

function montarPiqueteDoFormulario() {
  return {
    descricao: document.getElementById("descricao").value,
    latitude: Number(document.getElementById("latitude").value),
    longitude: Number(document.getElementById("longitude").value),
    pastoidfk: Number(document.getElementById("pastoidfk").value),
    removido: document.getElementById("removido").value === "true",
  };
}

async function vwGetPiqueteByID() {
  var form = document.getElementById("frmPiquete");
  try {
    var parametros = new URLSearchParams(window.location.search);
    var piqueteId = parametros.get("piqueteId");
    var servidorDw3 = form.dataset.servidorDw3;

    if (!piqueteId || !/^\d+$/.test(piqueteId) || Number(piqueteId) <= 0) {
      throw new Error("ID do piquete inválido.");
    }

    var response = await fetch(
      servidorDw3 + "/getPiqueteByID/" + encodeURIComponent(piqueteId),
      {
        headers: dw3MontarHeadersAutenticacao({
          "content-type": "application/json",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível carregar o piquete.");
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

    var piquete = data.registro[0];
    if (!piquete) {
      throw new Error("Piquete não encontrado.");
    }

    document.getElementById("piqueteid").value = piquete.piqueteid;
    document.getElementById("descricao").value = piquete.descricao ?? "";
    document.getElementById("latitude").value = piquete.latitude ?? "";
    document.getElementById("longitude").value = piquete.longitude ?? "";
    document.getElementById("removido").value = String(
      piquete.removido === true
    );

    await carregarPastosToPiquete(servidorDw3);
    $("#pastoidfk").val(piquete.pastoidfk).trigger("change");

    return true;
  } catch (error) {
    alert(error.message || "Erro ao carregar piquete.");
    return false;
  }
}

async function vwInsertPiquete() {
  var form = document.getElementById("frmPiquete");
  var btnInserir = document.getElementById("btnInserirPiquete");

  try {
    if (!form.reportValidity()) {
      return;
    }

    var servidorDw3 = form.dataset.servidorDw3;
    btnInserir.disabled = true;

    var response = await fetch(servidorDw3 + "/insertPiquete", {
      method: "POST",
      headers: dw3MontarHeadersAutenticacao({
        "content-type": "application/json",
      }),
      body: JSON.stringify(montarPiqueteDoFormulario()),
    });

    if (!response.ok) {
      throw new Error("Não foi possível inserir o piquete.");
    }

    var data = await response.json();
    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    if (data.status !== "ok") {
      throw new Error(data.status || "Não foi possível inserir o piquete.");
    }

    window.location.href = "/piquete";
  } catch (error) {
    alert(error.message || "Erro ao inserir piquete.");
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdatePiquete() {
  var form = document.getElementById("frmPiquete");
  var btnAtualizar = document.getElementById("btnAtualizarPiquete");

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var piqueteId = new URLSearchParams(window.location.search).get(
      "piqueteId"
    );
    var servidorDw3 = form.dataset.servidorDw3;

    btnAtualizar.disabled = true;

    var response = await fetch(
      servidorDw3 + "/updatePiquete/" + encodeURIComponent(piqueteId),
      {
        method: "PUT",
        headers: dw3MontarHeadersAutenticacao({
          "content-type": "application/json",
        }),
        body: JSON.stringify(montarPiqueteDoFormulario()),
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível atualizar o piquete.");
    }

    var data = await response.json();
    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    if (data.status !== "ok" || data.linhasAfetadas !== 1) {
      throw new Error(data.status || "Nenhum piquete foi atualizado.");
    }

    alert("Piquete atualizado com sucesso.");
    window.location.href = "/piquete";
  } catch (error) {
    alert(error.message || "Erro ao atualizar piquete.");
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeletePiquete() {
  var form = document.getElementById("frmPiquete");
  var btnRemover = document.getElementById("btnRemoverPiquete");

  if (btnRemover.disabled) {
    return;
  }

  if (!window.confirm("Confirma a remoção deste piquete?")) {
    return;
  }

  try {
    var piqueteId = document.getElementById("piqueteid").value;
    var servidorDw3 = form.dataset.servidorDw3;

    btnRemover.disabled = true;

    var response = await fetch(
      servidorDw3 + "/deletePiquete/" + encodeURIComponent(piqueteId),
      {
        method: "DELETE",
        headers: dw3MontarHeadersAutenticacao(),
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível remover o piquete.");
    }

    var data = await response.json();
    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    if (data.status !== "ok" || data.linhasAfetadas !== 1) {
      throw new Error(data.status || "Nenhum piquete foi removido.");
    }

    window.location.href = "/piquete";
  } catch (error) {
    alert(error.message || "Erro ao remover piquete.");
  } finally {
    btnRemover.disabled = false;
  }
}