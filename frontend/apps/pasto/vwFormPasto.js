document.addEventListener("DOMContentLoaded", async function () {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById("frmPasto");
  if (!form) {
    return;
  }

  var parametros = new URLSearchParams(window.location.search);
  var oper = parametros.get("oper") || parametros.get("Oper");

  var btnInserir = document.getElementById("btnInserirPasto");
  var btnAtualizar = document.getElementById("btnAtualizarPasto");
  var btnRemover = document.getElementById("btnRemoverPasto");

  if (oper === "Cr") {
    btnInserir.classList.remove("d-none");
    btnInserir.addEventListener("click", function () {
      vwInsertPasto();
    });
  }

  if (oper === "Re") {
    await vwGetPastoByID();
    desabilitarCamposPasto();
  }

  if (oper === "Up") {
    btnAtualizar.classList.remove("d-none");
    btnAtualizar.disabled = !(await vwGetPastoByID());
    btnAtualizar.addEventListener("click", function () {
      vwUpdatePasto();
    });
  }

  if (oper === "De") {
    btnRemover.classList.remove("d-none");
    btnRemover.disabled = !(await vwGetPastoByID());
    desabilitarCamposPasto();
    btnRemover.addEventListener("click", function () {
      vwDeletePasto();
    });
  }
});

function desabilitarCamposPasto() {
  document.getElementById("descricao").disabled = true;
  document.getElementById("areatotal").disabled = true;
}

function montarPastoDoFormulario() {
  return {
    descricao: document.getElementById("descricao").value,
    areatotal: Number(document.getElementById("areatotal").value),
    removido: document.getElementById("removido").value === "true",
  };
}

async function vwGetPastoByID() {
  var form = document.getElementById("frmPasto");
  try {
    var parametros = new URLSearchParams(window.location.search);
    var pastoId = parametros.get("pastoId");
    var servidorDw3 = form.dataset.servidorDw3;

    if (!pastoId || !/^\d+$/.test(pastoId) || Number(pastoId) <= 0) {
      throw new Error("ID do pasto inválido.");
    }

    var response = await fetch(
      servidorDw3 + "/getPastoByID/" + encodeURIComponent(pastoId),
      {
        headers: dw3MontarHeadersAutenticacao({
          "content-type": "application/json",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível carregar o pasto.");
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

    var pasto = data.registro[0];
    if (!pasto) {
      throw new Error("Pasto não encontrado.");
    }

    document.getElementById("pastoid").value = pasto.pastoid;
    document.getElementById("descricao").value = pasto.descricao ?? "";
    document.getElementById("areatotal").value = pasto.areatotal ?? "";
    document.getElementById("removido").value = String(pasto.removido === true);

    return true;
  } catch (error) {
    alert(error.message || "Erro ao carregar pasto.");
    return false;
  }
}

async function vwInsertPasto() {
  var form = document.getElementById("frmPasto");
  var btnInserir = document.getElementById("btnInserirPasto");

  try {
    if (!form.reportValidity()) {
      return;
    }

    var servidorDw3 = form.dataset.servidorDw3;
    btnInserir.disabled = true;

    var response = await fetch(servidorDw3 + "/insertPasto", {
      method: "POST",
      headers: dw3MontarHeadersAutenticacao({
        "content-type": "application/json",
      }),
      body: JSON.stringify(montarPastoDoFormulario()),
    });

    if (!response.ok) {
      throw new Error("Não foi possível inserir o pasto.");
    }

    var data = await response.json();
    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    if (data.status !== "ok") {
      throw new Error(data.status || "Não foi possível inserir o pasto.");
    }

    window.location.href = "/pasto";
  } catch (error) {
    alert(error.message || "Erro ao inserir pasto.");
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdatePasto() {
  var form = document.getElementById("frmPasto");
  var btnAtualizar = document.getElementById("btnAtualizarPasto");

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var pastoId = new URLSearchParams(window.location.search).get("pastoId");
    var servidorDw3 = form.dataset.servidorDw3;

    btnAtualizar.disabled = true;

    var response = await fetch(
      servidorDw3 + "/updatePasto/" + encodeURIComponent(pastoId),
      {
        method: "PUT",
        headers: dw3MontarHeadersAutenticacao({
          "content-type": "application/json",
        }),
        body: JSON.stringify(montarPastoDoFormulario()),
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível atualizar o pasto.");
    }

    var data = await response.json();
    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    if (data.status !== "ok" || data.linhasAfetadas !== 1) {
      throw new Error(data.status || "Nenhum pasto foi atualizado.");
    }

    alert("Pasto atualizado com sucesso.");
    window.location.href = "/pasto";
  } catch (error) {
    alert(error.message || "Erro ao atualizar pasto.");
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeletePasto() {
  var form = document.getElementById("frmPasto");
  var btnRemover = document.getElementById("btnRemoverPasto");

  if (btnRemover.disabled) {
    return;
  }

  if (!window.confirm("Confirma a remoção deste pasto?")) {
    return;
  }

  try {
    var pastoId = document.getElementById("pastoid").value;
    var servidorDw3 = form.dataset.servidorDw3;

    btnRemover.disabled = true;

    var response = await fetch(
      servidorDw3 + "/deletePasto/" + encodeURIComponent(pastoId),
      {
        method: "DELETE",
        headers: dw3MontarHeadersAutenticacao(),
      }
    );

    if (!response.ok) {
      throw new Error("Não foi possível remover o pasto.");
    }

    var data = await response.json();
    if (data.auth === false) {
      alert(data.message || "Sessão expirada. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    if (data.status !== "ok" || data.linhasAfetadas !== 1) {
      throw new Error(data.status || "Nenhum pasto foi removido.");
    }

    window.location.href = "/pasto";
  } catch (error) {
    alert(error.message || "Erro ao remover pasto.");
  } finally {
    btnRemover.disabled = false;
  }
}